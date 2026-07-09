import { z } from 'zod';

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    location: z.string().min(2, 'Location is required'),
    price: z.number().int().positive('Price must be a positive number'),
    categoryId: z.string().uuid('Valid categoryId is required'),
    bedrooms: z.number().int().min(0).optional(),
    bathrooms: z.number().int().min(0).optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const updatePropertySchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    location: z.string().min(2).optional(),
    price: z.number().int().positive().optional(),
    categoryId: z.string().uuid().optional(),
    bedrooms: z.number().int().min(0).optional(),
    bathrooms: z.number().int().min(0).optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>['body'];
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>['body'];
