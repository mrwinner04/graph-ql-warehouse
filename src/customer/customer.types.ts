import { z } from 'zod';
import { CustomerType } from './customer.entity';

export const CustomerBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Customer name is required')
    .max(100, 'Customer name too long'),
  email: z.email('Invalid email format').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  address: z.string().max(200, 'Address too long').optional(),
  type: z.enum(CustomerType),
});

export const CreateCustomerSchema = CustomerBaseSchema.extend({
  companyId: z.uuid('Invalid company ID'),
});

export const UpdateCustomerSchema = CustomerBaseSchema.partial();
