import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    rentalRequestId: z.string().uuid('Valid rentalRequestId is required'),
    rating: z.number().int().min(1, 'Rating min is 1').max(5, 'Rating max is 5'),
    comment: z.string().optional(),
  }),
});
