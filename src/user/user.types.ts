import { z } from 'zod';
import { InputType, Field, ObjectType, ID } from '@nestjs/graphql';
import { UserRole } from '../common/types';

// ===== ZOD VALIDATION SCHEMAS =====

export const UserBaseSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.nativeEnum(UserRole),
});

export const CreateUserSchema = UserBaseSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyId: z.uuid('Invalid company ID'),
});

export const UpdateUserSchema = UserBaseSchema.partial().extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional(),
});

export const AddUserToCompanySchema = UserBaseSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ===== GRAPHQL INPUT TYPES =====

@InputType({ description: 'Input type for creating a user' })
export class CreateUserInput {
  @Field(() => String, { description: 'User email' })
  email: string;

  @Field(() => String, { description: 'User password' })
  password: string;

  @Field(() => String, { description: 'User full name' })
  name: string;

  @Field(() => UserRole, { description: 'User role' })
  role: UserRole;
}

@InputType({ description: 'Input type for updating a user' })
export class UpdateUserInput {
  @Field(() => String, { description: 'User email', nullable: true })
  email?: string;

  @Field(() => String, { description: 'User password', nullable: true })
  password?: string;

  @Field(() => String, { description: 'User full name', nullable: true })
  name?: string;

  @Field(() => UserRole, { description: 'User role', nullable: true })
  role?: UserRole;
}

@InputType({ description: 'Input type for adding a user to company' })
export class AddUserToCompanyInput {
  @Field(() => String, { description: 'User email' })
  email: string;

  @Field(() => String, { description: 'User password' })
  password: string;

  @Field(() => String, { description: 'User full name' })
  name: string;

  @Field(() => UserRole, { description: 'User role' })
  role: UserRole;
}

// ===== GRAPHQL RESPONSE TYPES =====

@ObjectType({ description: 'User response without password' })
export class UserResponse {
  @Field(() => ID, { description: 'Unique identifier for the user' })
  id: string;

  @Field(() => String, { description: 'Company ID the user belongs to' })
  companyId: string;

  @Field(() => String, { description: 'User email address' })
  email: string;

  @Field(() => String, { description: 'User full name' })
  name: string;

  @Field(() => UserRole, { description: 'User role in the system' })
  role: UserRole;

  @Field(() => Date, {
    description: 'When the user was created',
    nullable: true,
  })
  createdAt?: Date;

  @Field(() => Date, {
    description: 'When the user was last updated',
    nullable: true,
  })
  updatedAt?: Date;

  @Field(() => Date, {
    description: 'When the user was deleted',
    nullable: true,
  })
  deletedAt?: Date;
}
