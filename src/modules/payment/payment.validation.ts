import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    rentalRequestId: z.string().uuid('Valid rentalRequestId is required'),
  }),
});

export const confirmPaymentSchema = z.object({
  body: z.object({
    transactionId: z.string().min(1, 'transactionId is required'),
  }),
});
