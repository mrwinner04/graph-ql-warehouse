import { ObjectType, Field, ID } from '@nestjs/graphql';

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

  @Field(() => String, {
    description: 'Warehouse type (solid/liquid)',
    nullable: true,
  })
  type?: string;

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
