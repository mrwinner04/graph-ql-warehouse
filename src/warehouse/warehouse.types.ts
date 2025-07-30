import { z } from 'zod';
import { InputType, Field, ObjectType, ID } from '@nestjs/graphql';
import { WarehouseType } from './warehouse.entity';

// ===== ZOD VALIDATION SCHEMAS =====

export const WarehouseBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Warehouse name is required')
    .max(100, 'Warehouse name too long'),
  address: z.string().max(200, 'Address too long').optional(),
  type: z.enum(['solid', 'liquid']).optional(),
});

export const CreateWarehouseSchema = WarehouseBaseSchema.extend({
  companyId: z.uuid('Invalid company ID'),
});

export const UpdateWarehouseSchema = WarehouseBaseSchema.partial();

// ===== GRAPHQL INPUT TYPES =====

@InputType({ description: 'Input type for creating a warehouse' })
export class CreateWarehouseInput {
  @Field(() => String, { description: 'Warehouse name' })
  name: string;

  @Field(() => String, { description: 'Warehouse address', nullable: true })
  address?: string;

  @Field(() => WarehouseType, { description: 'Warehouse type', nullable: true })
  type?: WarehouseType;
}

@InputType({ description: 'Input type for updating a warehouse' })
export class UpdateWarehouseInput {
  @Field(() => String, { description: 'Warehouse name', nullable: true })
  name?: string;

  @Field(() => String, { description: 'Warehouse address', nullable: true })
  address?: string;

  @Field(() => WarehouseType, { description: 'Warehouse type', nullable: true })
  type?: WarehouseType;
}

// ===== GRAPHQL RESPONSE TYPES =====

@ObjectType({ description: 'Warehouse response type' })
export class WarehouseResponse {
  @Field(() => ID, { description: 'Unique identifier for the warehouse' })
  id: string;

  @Field(() => String, { description: 'Company ID the warehouse belongs to' })
  companyId: string;

  @Field(() => String, { description: 'Warehouse name' })
  name: string;

  @Field(() => String, { description: 'Warehouse address', nullable: true })
  address?: string;

  @Field(() => WarehouseType, {
    description: 'Warehouse type (solid/liquid)',
    nullable: true,
  })
  type?: WarehouseType;

  @Field(() => Date, {
    description: 'When the warehouse was created',
    nullable: true,
  })
  createdAt?: Date;

  @Field(() => Date, {
    description: 'When the warehouse was last updated',
    nullable: true,
  })
  updatedAt?: Date;

  @Field(() => Date, {
    description: 'When the warehouse was deleted',
    nullable: true,
  })
  deletedAt?: Date;

  @Field(() => String, {
    description: 'ID of user who last modified the warehouse',
    nullable: true,
  })
  modifiedBy?: string;
}
