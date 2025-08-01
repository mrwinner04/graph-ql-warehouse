import { z } from 'zod';
import { InputType, Field, ObjectType, ID, Int, Float } from '@nestjs/graphql';
import { OrderType } from './order.entity';

// ===== ZOD VALIDATION SCHEMAS =====

export const OrderBaseSchema = z.object({
  number: z.string().max(50, 'Order number too long').optional(),
  type: z.enum([
    'SALES',
    'PURCHASE',
    'TRANSFER',
    'sales',
    'purchase',
    'transfer',
  ]),
  customerId: z.string().uuid('Invalid customer ID'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  date: z.union([z.string(), z.date()]).optional(),
});

export const CreateOrderSchema = OrderBaseSchema;

export const UpdateOrderSchema = OrderBaseSchema.partial();

export const TransferOrderSchema = z.object({
  fromWarehouseId: z.string().min(1, 'From warehouse ID is required'),
  toWarehouseId: z.string().min(1, 'To warehouse ID is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  date: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().positive('Quantity must be positive'),
        price: z.string().min(1, 'Price is required'),
      }),
    )
    .min(1, 'At least one item is required'),
});

// ===== GRAPHQL INPUT TYPES =====

@InputType()
export class CreateOrderInput {
  @Field(() => String)
  number?: string;

  @Field(() => OrderType)
  type: OrderType;

  @Field(() => String)
  customerId: string;

  @Field(() => String)
  warehouseId: string;

  @Field(() => Date)
  date?: Date;
}

@InputType()
export class TransferOrderItemInput {
  @Field(() => String)
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => String)
  price: string;
}

@InputType()
export class TransferOrderInput {
  @Field(() => String)
  fromWarehouseId: string;

  @Field(() => String)
  toWarehouseId: string;

  @Field(() => String)
  customerId: string;

  @Field(() => Date, { nullable: true })
  date?: Date;

  @Field(() => [TransferOrderItemInput])
  items: TransferOrderItemInput[];
}

@InputType({ description: 'Input type for updating an order' })
export class UpdateOrderInput {
  @Field(() => String, { description: 'Order number', nullable: true })
  number?: string;

  @Field(() => OrderType, { description: 'Order type', nullable: true })
  type?: OrderType;

  @Field(() => String, { description: 'Customer ID', nullable: true })
  customerId?: string;

  @Field(() => String, { description: 'Warehouse ID', nullable: true })
  warehouseId?: string;

  @Field(() => Date, { description: 'Order date', nullable: true })
  date?: Date;
}

// ===== GRAPHQL RESPONSE TYPES =====

@ObjectType({ description: 'Order response type' })
export class OrderResponse {
  @Field(() => ID, { description: 'Unique identifier for the order' })
  id: string;

  @Field(() => String, { description: 'Company ID the order belongs to' })
  companyId: string;

  @Field(() => String, { description: 'Order number' })
  number: string;

  @Field(() => OrderType, { description: 'Order type' })
  type: OrderType;

  @Field(() => String, { description: 'Customer ID' })
  customerId: string;

  @Field(() => String, { description: 'Warehouse ID' })
  warehouseId: string;

  @Field(() => Date, { description: 'Order date' })
  date: Date;

  @Field(() => Date, {
    description: 'When the order was created',
    nullable: true,
  })
  createdAt?: Date;

  @Field(() => Date, {
    description: 'When the order was last updated',
    nullable: true,
  })
  updatedAt?: Date;

  @Field(() => Date, {
    description: 'When the order was deleted',
    nullable: true,
  })
  deletedAt?: Date;

  @Field(() => String, {
    description: 'ID of user who last modified the order',
    nullable: true,
  })
  modifiedBy?: string;
}
