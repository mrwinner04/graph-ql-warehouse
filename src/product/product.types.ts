import { z } from 'zod';

// Base product schema
export const ProductBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Product name too long'),
  code: z
    .string()
    .min(1, 'Product code is required')
    .max(50, 'Product code too long'),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal number'),
  type: z.enum(['solid', 'liquid']),
});

// Create product schema
export const CreateProductSchema = ProductBaseSchema.extend({
  companyId: z.uuid('Invalid company ID'),
});

// Update product schema
export const UpdateProductSchema = ProductBaseSchema.partial();
