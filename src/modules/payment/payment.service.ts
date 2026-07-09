import { prisma } from '../../lib/prisma';
import { getStripe } from '../../lib/stripe';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';

// Step 1: Tenant creates a payment session for an APPROVED rental request.
const createCheckout = async (tenantId: string, rentalRequestId: string) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rental) throw new AppError(404, 'Rental request not found.');
  if (rental.tenantId !== tenantId) {
    throw new AppError(403, 'You can only pay for your own rental requests.');
  }
  if (rental.status !== 'APPROVED') {
    throw new AppError(400, 'You can only pay for an APPROVED rental request.');
  }
  if (rental.payment && rental.payment.status === 'COMPLETED') {
    throw new AppError(409, 'This rental request is already paid.');
  }

  const stripe = getStripe();
  const amount = rental.property.price; // monthly rent in currency units

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Rent: ${rental.property.title}`,
            description: `RentNest booking for ${rental.property.location}`,
          },
          unit_amount: amount * 100, // Stripe expects the smallest currency unit
        },
        quantity: 1,
      },
    ],
    metadata: { rentalRequestId, tenantId },
    success_url: `${env.clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.clientUrl}/payment-cancel`,
  });

  // Upsert a PENDING payment record keyed by the rental request
  const payment = await prisma.payment.upsert({
    where: { rentalRequestId },
    create: {
      transactionId: session.id,
      amount,
      provider: 'STRIPE',
      status: 'PENDING',
      rentalRequestId,
      tenantId,
    },
    update: {
      transactionId: session.id,
      amount,
      status: 'PENDING',
    },
  });

  return {
    checkoutUrl: session.url,
    transactionId: session.id,
    payment,
  };
};

// Step 2: Confirm/verify a payment (used by Postman flow OR success redirect).
const confirmPayment = async (transactionId: string) => {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(transactionId);

  const payment = await prisma.payment.findFirst({ where: { transactionId } });
  if (!payment) throw new AppError(404, 'Payment record not found.');

  if (session.payment_status === 'paid') {
    // Mark payment completed and activate the rental (transaction for safety)
    const [updatedPayment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          stripePaymentIntentId: (session.payment_intent as string) ?? null,
        },
      }),
      prisma.rentalRequest.update({
        where: { id: payment.rentalRequestId },
        data: { status: 'ACTIVE' },
      }),
    ]);
    return { status: 'COMPLETED', payment: updatedPayment };
  }

  return { status: 'PENDING', payment, note: 'Payment not completed yet.' };
};

// Called by the Stripe webhook when checkout.session.completed fires.
const markPaidByWebhook = async (sessionId: string, paymentIntentId?: string) => {
  const payment = await prisma.payment.findFirst({
    where: { transactionId: sessionId },
  });
  if (!payment || payment.status === 'COMPLETED') return;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntentId ?? null,
      },
    }),
    prisma.rentalRequest.update({
      where: { id: payment.rentalRequestId },
      data: { status: 'ACTIVE' },
    }),
  ]);
};

const getMyPayments = async (tenantId: string) => {
  return prisma.payment.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    include: {
      rentalRequest: {
        select: { id: true, status: true, property: { select: { title: true } } },
      },
    },
  });
};

const getById = async (id: string, userId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { rentalRequest: { include: { property: true } } },
  });
  if (!payment) throw new AppError(404, 'Payment not found.');

  // tenant who paid OR landlord of the property may view
  const isTenant = payment.tenantId === userId;
  const isLandlord = payment.rentalRequest.property.landlordId === userId;
  if (!isTenant && !isLandlord) {
    throw new AppError(403, 'You are not allowed to view this payment.');
  }
  return payment;
};

export const PaymentService = {
  createCheckout,
  confirmPayment,
  markPaidByWebhook,
  getMyPayments,
  getById,
};
