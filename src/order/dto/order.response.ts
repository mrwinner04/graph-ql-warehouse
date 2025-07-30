import { ObjectType, Field, ID } from '@nestjs/graphql';
import { OrderType } from '../order.entity';

@ObjectType({ description: 'Order response type' })
export class OrderResponse {
  @Field(() => ID, { description: 'Unique identifier for the order' })
  id: string;

  @Field(() => String, { description: 'Company ID the order belongs to' })
  companyId: string;

  @Field(() => String, { description: 'Order number' })
  number: string;

  @Field(() => OrderType, { description: 'Order type' })
  type: OrderType;

  @Field(() => String, { description: 'Customer ID' })
  customerId: string;

  @Field(() => String, { description: 'Warehouse ID' })
  warehouseId: string;

  @Field(() => Date, { description: 'Order date' })
  date: Date;

  @Field(() => Date, {
    description: 'When the order was created',
    nullable: true,
  })
  createdAt?: Date;

  @Field(() => Date, {
    description: 'When the order was last updated',
    nullable: true,
  })
  updatedAt?: Date;

  @Field(() => Date, {
    description: 'When the order was deleted',
    nullable: true,
  })
  deletedAt?: Date;

  @Field(() => String, {
    description: 'ID of user who last modified the order',
    nullable: true,
  })
  modifiedBy?: string;
}
