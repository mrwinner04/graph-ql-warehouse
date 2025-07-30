import { z } from 'zod';

// Base order item schema
export const OrderItemBaseSchema = z.object({
  orderId: z.uuid('Invalid order ID'),
  productId: z.uuid('Invalid product ID'),
  quantity: z.number().positive('Quantity must be positive'),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal number'),
});

// Create order item schema
export const CreateOrderItemSchema = OrderItemBaseSchema.extend({
  companyId: z.uuid('Invalid company ID'),
});

// Update order item schema
export const UpdateOrderItemSchema = OrderItemBaseSchema.partial();
