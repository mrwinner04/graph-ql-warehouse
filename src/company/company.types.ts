import { z } from 'zod';

export const CompanyBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name too long'),
});

export const UpdateCompanySchema = CompanyBaseSchema;
