import { z } from 'zod';
import { InputType, Field, ObjectType, ID } from '@nestjs/graphql';
import { CustomerType } from './customer.entity';

// ===== ZOD VALIDATION SCHEMAS =====

export const CustomerBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Customer name is required')
    .max(100, 'Customer name too long'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  address: z.string().max(200, 'Address too long').optional(),
  type: z.enum(CustomerType),
});

export const CreateCustomerSchema = CustomerBaseSchema.extend({
  companyId: z.uuid('Invalid company ID'),
});

export const UpdateCustomerSchema = CustomerBaseSchema.partial();

// ===== GRAPHQL INPUT TYPES =====

@InputType()
export class CreateCustomerInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => CustomerType)
  type: CustomerType;
}

@InputType()
export class UpdateCustomerInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  address?: string;

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

  @Field(() => String, {
    nullable: true,
  })
  phone?: string;

  @Field(() => String, {
    nullable: true,
  })
  address?: string;

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
