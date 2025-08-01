import { z } from 'zod';
import { InputType, Field, ObjectType, ID } from '@nestjs/graphql';

// ===== ZOD VALIDATION SCHEMAS =====

// Base order item schema
export const OrderItemBaseSchema = z.object({
  orderId: z.uuid('Invalid order ID'),
  productId: z.uuid('Invalid product ID'),
  quantity: z.number().positive('Quantity must be positive'),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal number'),
});

export const CreateOrderItemSchema = OrderItemBaseSchema;

export const UpdateOrderItemSchema = OrderItemBaseSchema.partial();

// ===== GRAPHQL INPUT TYPES =====

@InputType({ description: 'Input type for creating an order item' })
export class CreateOrderItemInput {
  @Field(() => String, { description: 'Order ID' })
  orderId: string;

  @Field(() => String, { description: 'Product ID' })
  productId: string;

  @Field(() => Number, { description: 'Quantity of the product' })
  quantity: number;

  @Field(() => String, { description: 'Price per unit' })
  price: string;
}

@InputType({ description: 'Input type for updating an order item' })
export class UpdateOrderItemInput {
  @Field(() => String, { description: 'Order ID', nullable: true })
  orderId?: string;

  @Field(() => String, { description: 'Product ID', nullable: true })
  productId?: string;

  @Field(() => Number, {
    description: 'Quantity of the product',
    nullable: true,
  })
  quantity?: number;

  @Field(() => String, { description: 'Price per unit', nullable: true })
  price?: string;
}

// ===== GRAPHQL RESPONSE TYPES =====

@ObjectType({ description: 'Order item response type' })
export class OrderItemResponse {
  @Field(() => ID, { description: 'Unique identifier for the order item' })
  id: string;

  @Field(() => String, { description: 'Order ID this item belongs to' })
  orderId: string;

  @Field(() => String, { description: 'Product ID for this item' })
  productId: string;

  @Field(() => Number, { description: 'Quantity of the product' })
  quantity: number;

  @Field(() => String, { description: 'Price per unit' })
  price: string;

  @Field(() => Date, {
    description: 'When the order item was created',
    nullable: true,
  })
  createdAt?: Date;

  @Field(() => Date, {
    description: 'When the order item was last updated',
    nullable: true,
  })
  updatedAt?: Date;

  @Field(() => Date, {
    description: 'When the order item was deleted',
    nullable: true,
  })
  deletedAt?: Date;

  @Field(() => String, {
    description: 'ID of user who last modified the order item',
    nullable: true,
  })
  modifiedBy?: string;
}
