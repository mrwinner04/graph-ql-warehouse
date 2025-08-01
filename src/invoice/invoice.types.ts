import { z } from 'zod';
import { InputType, Field, ObjectType, ID, Float } from '@nestjs/graphql';
import { InvoiceStatus } from './invoice.entity';

// ===== ZOD VALIDATION SCHEMAS =====

export const InvoiceBaseSchema = z.object({
  orderId: z.uuid('Invalid order ID'),
  number: z.string().max(50, 'Invoice number too long').optional(),
  date: z.date().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
});

export const CreateInvoiceSchema = InvoiceBaseSchema.extend({
  companyId: z.uuid('Invalid company ID'),
});

export const UpdateInvoiceSchema = InvoiceBaseSchema.partial();

// ===== GRAPHQL INPUT TYPES =====

@InputType()
export class CreateInvoiceInput {
  @Field(() => String)
  orderId: string;

  @Field(() => String)
  number?: string;

  @Field(() => Date)
  date?: Date;

  @Field(() => InvoiceStatus)
  status?: InvoiceStatus;
}

@InputType()
export class UpdateInvoiceInput {
  @Field(() => String, {
    nullable: true,
  })
  orderId?: string;

  @Field(() => String)
  number?: string;

  @Field(() => Date)
  date?: Date;

  @Field(() => InvoiceStatus)
  status?: InvoiceStatus;
}

// ===== GRAPHQL RESPONSE TYPES =====

@ObjectType()
export class InvoiceResponse {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  companyId: string;

  @Field(() => String)
  orderId: string;

  @Field(() => String)
  number: string;

  @Field(() => Date)
  date: Date;

  @Field(() => InvoiceStatus)
  status: InvoiceStatus;

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

  @Field(() => Float, {
    description: 'Total amount of the invoice',
    nullable: true,
  })
  total?: number;
}
