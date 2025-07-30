import { z } from 'zod';

// Base user schema
export const UserBaseSchema = z.object({
  email: z.email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['OWNER', 'OPERATOR', 'VIEWER']),
});

// Create user schema
export const CreateUserSchema = UserBaseSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyId: z.uuid('Invalid company ID'),
});

// Update user schema
export const UpdateUserSchema = UserBaseSchema.partial().extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional(),
});

// Login schema
export const LoginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Register schema
export const RegisterSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name too long'),
});
