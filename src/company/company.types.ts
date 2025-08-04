import { z } from 'zod';
import { InputType, Field, ObjectType, ID } from '@nestjs/graphql';

export const CompanyBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name too long'),
});

export const UpdateCompanySchema = CompanyBaseSchema;

// ===== GRAPHQL INPUT TYPES =====

@InputType()
export class UpdateCompanyInput {
  @Field(() => String)
  name: string;
}

// ===== GRAPHQL RESPONSE TYPES =====

@ObjectType()
export class Company {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => String, { nullable: true })
  modifiedBy?: string;
}
