import { z } from 'zod';
import { InputType, Field, ObjectType, ID, Int, Float } from '@nestjs/graphql';
import { ProductType } from './product.entity';

// ===== ZOD VALIDATION SCHEMAS =====

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
  type: z.enum(['SOLID', 'LIQUID', 'solid', 'liquid']),
});

// Create product schema
export const CreateProductSchema = ProductBaseSchema;

// Update product schema
export const UpdateProductSchema = ProductBaseSchema.partial();

// ===== GRAPHQL INPUT TYPES =====

@InputType({ description: 'Input type for creating a product' })
export class CreateProductInput {
  @Field(() => String, { description: 'Product name' })
  name: string;

  @Field(() => String, { description: 'Product code' })
  code: string;

  @Field(() => String, { description: 'Product price' })
  price: string;

  @Field(() => ProductType, { description: 'Product type' })
  type: ProductType;
}

@InputType({ description: 'Input type for updating a product' })
export class UpdateProductInput {
  @Field(() => String, { description: 'Product name', nullable: true })
  name?: string;

  @Field(() => String, { description: 'Product code', nullable: true })
  code?: string;

  @Field(() => String, { description: 'Product price', nullable: true })
  price?: string;

  @Field(() => ProductType, { description: 'Product type', nullable: true })
  type?: ProductType;
}

// ===== GRAPHQL RESPONSE TYPES =====

@ObjectType({ description: 'Product response type' })
export class ProductResponse {
  @Field(() => ID, { description: 'Unique identifier for the product' })
  id: string;

  @Field(() => String, { description: 'Company ID the product belongs to' })
  companyId: string;

  @Field(() => String, { description: 'Product name' })
  name: string;

  @Field(() => String, { description: 'Product code', nullable: true })
  code?: string;

  @Field(() => String, { description: 'Product price' })
  price: string;

  @Field(() => ProductType, { description: 'Product type' })
  type: ProductType;

  @Field(() => Date, {
    description: 'When the product was created',
    nullable: true,
  })
  createdAt?: Date;

  @Field(() => Date, {
    description: 'When the product was last updated',
    nullable: true,
  })
  updatedAt?: Date;

  @Field(() => Date, {
    description: 'When the product was deleted',
    nullable: true,
  })
  deletedAt?: Date;

  @Field(() => String, {
    description: 'ID of user who last modified the product',
    nullable: true,
  })
  modifiedBy?: string;
}

// ===== REPORT TYPES =====

export const BestSellingProductsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
});

@InputType({ description: 'Input for best selling products report' })
export class BestSellingProductsInput {
  @Field(() => Int, {
    description: 'Number of results to return',
    nullable: true,
  })
  limit?: number;
}

@ObjectType({ description: 'Best selling product report item' })
export class BestSellingProductItem {
  @Field(() => String, { description: 'Product ID' })
  productId: string;

  @Field(() => String, { description: 'Product name' })
  productName: string;

  @Field(() => String, { description: 'Product code', nullable: true })
  productCode?: string;

  @Field(() => Int, { description: 'Total quantity sold' })
  totalQuantity: number;

  @Field(() => Float, { description: 'Total revenue generated' })
  totalRevenue: number;

  @Field(() => Float, { description: 'Average price per unit' })
  averagePrice: number;

  @Field(() => Int, { description: 'Number of orders containing this product' })
  orderCount: number;
}

@ObjectType({ description: 'Best selling products report' })
export class BestSellingProductsReport {
  @Field(() => [BestSellingProductItem], {
    description: 'List of best selling products',
  })
  products: BestSellingProductItem[];

  @Field(() => Int, { description: 'Total number of products in report' })
  totalProducts: number;

  @Field(() => Float, { description: 'Total revenue across all products' })
  totalRevenue: number;
}
