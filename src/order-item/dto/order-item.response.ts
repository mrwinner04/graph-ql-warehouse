import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Order item response type' })
export class OrderItemResponse {
  @Field(() => ID, { description: 'Unique identifier for the order item' })
  id: string;

  @Field(() => String, { description: 'Order ID this item belongs to' })
  orderId: string;

  @Field(() => String, { description: 'Product ID for this item' })
  productId: string;

  @Field(() => Number, { description: 'Quantity of the product' })
  quantity: number;

  @Field(() => String, { description: 'Price per unit' })
  price: string;

  @Field(() => Date, {
    description: 'When the order item was created',
    nullable: true,
  })
  createdAt?: Date;

  @Field(() => Date, {
    description: 'When the order item was last updated',
    nullable: true,
  })
  updatedAt?: Date;

  @Field(() => Date, {
    description: 'When the order item was deleted',
    nullable: true,
  })
  deletedAt?: Date;

  @Field(() => String, {
    description: 'ID of user who last modified the order item',
    nullable: true,
  })
  modifiedBy?: string;
}
