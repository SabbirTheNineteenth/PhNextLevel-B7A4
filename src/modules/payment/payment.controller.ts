import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { PaymentService } from './payment.service';
import { getStripe } from '../../lib/stripe';
import { env } from '../../config/env';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createCheckout(
    req.user!.userId,
    req.body.rentalRequestId
  );
  sendResponse(res, {
    statusCode: 201,
    message: 'Payment session created. Open checkoutUrl to pay.',
    data: result,
  });
});

const confirm = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.confirmPayment(req.body.transactionId);
  sendResponse(res, {
    statusCode: 200,
    message: 'Payment verified',
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getMyPayments(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: 'Payment history fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getById(req.params.id, req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: 'Payment details fetched successfully',
    data: result,
  });
});

// Stripe webhook. Requires the raw request body (configured in app.ts).
const webhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const stripe = getStripe();

  let event;
  try {
    if (env.stripe.webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, env.stripe.webhookSecret);
    } else {
      // If no webhook secret set, parse the raw buffer directly (dev only)
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid webhook signature';
    return res.status(400).json({ success: false, message });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      id: string;
      payment_intent?: string;
    };
    await PaymentService.markPaidByWebhook(session.id, session.payment_intent);
  }

  res.status(200).json({ received: true });
};

export const PaymentController = { create, confirm, getMyPayments, getById, webhook };
