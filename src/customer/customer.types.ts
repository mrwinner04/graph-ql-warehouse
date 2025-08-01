import { z } from 'zod';
import { InputType, Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { CustomerType } from './customer.entity';

// ===== ZOD VALIDATION SCHEMAS =====

export const CustomerBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Customer name is required')
    .max(100, 'Customer name too long'),
  email: z.string().email('Invalid email format').optional(),
  type: z.enum(['CUSTOMER', 'SUPPLIER', 'customer', 'supplier']),
});

export const CreateCustomerSchema = CustomerBaseSchema;

export const UpdateCustomerSchema = CustomerBaseSchema.partial();

// ===== GRAPHQL INPUT TYPES =====

@InputType()
export class CreateCustomerInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => CustomerType)
  type: CustomerType;
}

@InputType()
export class UpdateCustomerInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => CustomerType, { nullable: true })
  type?: CustomerType;
}

// ===== GRAPHQL RESPONSE TYPES =====

@ObjectType()
export class CustomerResponse {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  companyId: string;

  @Field(() => String)
  name: string;

  @Field(() => String, {
    nullable: true,
  })
  email?: string;

  @Field(() => CustomerType)
  type: CustomerType;

  @Field(() => Date, {
    nullable: true,
  })
  createdAt?: Date;

  @Field(() => Date, {
    nullable: true,
  })
  updatedAt?: Date;

  @Field(() => Date, {
    nullable: true,
  })
  deletedAt?: Date;

  @Field(() => String, {
    nullable: true,
  })
  modifiedBy?: string;
}

// ===== REPORT TYPES =====

export const ClientWithMostOrdersSchema = z.object({});

@ObjectType()
export class ClientWithMostOrders {
  @Field(() => String)
  customerId: string;

  @Field(() => String)
  customerName: string;

  @Field(() => Int)
  orderCount: number;
}
