import { z } from 'zod';
import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { UserRole } from '../common/types';
import { UserResponse } from '../user/user.types';

// ===== ZOD VALIDATION SCHEMAS =====

// Login schema
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Register schema
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name too long'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.VIEWER),
});

// Change password schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// ===== GRAPHQL INPUT TYPES =====

@InputType()
export class LoginInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}

@InputType()
export class RegisterInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  companyName: string;

  @Field(() => UserRole, {
    defaultValue: UserRole.VIEWER,
  })
  role?: UserRole = UserRole.VIEWER;
}

@InputType()
export class ChangePasswordInput {
  @Field(() => String)
  currentPassword: string;

  @Field(() => String)
  newPassword: string;
}

// ===== GRAPHQL RESPONSE TYPES =====

@ObjectType()
export class LoginResponse {
  @Field(() => String)
  accessToken: string;
}

@ObjectType()
export class RegisterResponse {
  @Field(() => UserResponse)
  user: UserResponse;
}

@ObjectType()
export class AuthResponse {
  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => String)
  companyId: string;
}

@ObjectType()
export class ChangePasswordResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}
