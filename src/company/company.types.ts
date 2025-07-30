import { z } from 'zod';
import { InputType, Field } from '@nestjs/graphql';

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
