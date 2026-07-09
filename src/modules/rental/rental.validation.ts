import { z } from 'zod';

export const createRentalSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid('Valid propertyId is required'),
    message: z.string().optional(),
    moveInDate: z
      .string()
      .datetime({ message: 'moveInDate must be an ISO date string' })
      .optional(),
  }),
});

// Landlord updates status: approve or reject a pending request,
// or mark an active rental as completed.
export const updateRentalStatusSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED', 'COMPLETED']),
  }),
});

export type CreateRentalInput = z.infer<typeof createRentalSchema>['body'];
