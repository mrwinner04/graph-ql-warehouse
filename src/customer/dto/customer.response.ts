import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Customer response type' })
export class CustomerResponse {
  @Field(() => ID, { description: 'Unique identifier for the customer' })
  id: string;

  @Field(() => String, { description: 'Company ID the customer belongs to' })
  companyId: string;

  @Field(() => String, { description: 'Customer name' })
  name: string;

  @Field(() => String, {
    description: 'Customer email address',
    nullable: true,
  })
  email?: string;

  @Field(() => String, {
    description: 'Customer type (customer/supplier)',
    nullable: true,
  })
  type?: string;

  @Field(() => Date, {
    description: 'When the customer was created',
    nullable: true,
  })
  createdAt?: Date;

  @Field(() => Date, {
    description: 'When the customer was last updated',
    nullable: true,
  })
  updatedAt?: Date;

  @Field(() => Date, {
    description: 'When the customer was deleted',
    nullable: true,
  })
  deletedAt?: Date;

  @Field(() => String, {
    description: 'ID of user who last modified the customer',
    nullable: true,
  })
  modifiedBy?: string;
}
