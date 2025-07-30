import { z } from 'zod';

// Base order schema
export const OrderBaseSchema = z.object({
  number: z.string().max(50, 'Order number too long').optional(),
  type: z.enum(['sales', 'purchase', 'transfer']),
  customerId: z.string().uuid('Invalid customer ID'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  date: z.date().optional(),
});

// Create order schema
export const CreateOrderSchema = OrderBaseSchema.extend({
  companyId: z.uuid('Invalid company ID'),
});

// Update order schema
export const UpdateOrderSchema = OrderBaseSchema.partial();
