import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';

const create = async (
  tenantId: string,
  data: { rentalRequestId: string; rating: number; comment?: string }
) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: data.rentalRequestId },
    include: { review: true },
  });

  if (!rental) throw new AppError(404, 'Rental request not found.');
  if (rental.tenantId !== tenantId) {
    throw new AppError(403, 'You can only review your own rentals.');
  }
  if (rental.status !== 'COMPLETED') {
    throw new AppError(400, 'You can only review a COMPLETED rental.');
  }
  if (rental.review) {
    throw new AppError(409, 'You have already reviewed this rental.');
  }

  return prisma.review.create({
    data: {
      rating: data.rating,
      comment: data.comment,
      propertyId: rental.propertyId,
      tenantId,
      rentalRequestId: rental.id,
    },
  });
};

export const ReviewService = { create };
