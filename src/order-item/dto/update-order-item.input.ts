import { InputType, Field } from '@nestjs/graphql';

@InputType({ description: 'Input type for updating an order item' })
export class UpdateOrderItemInput {
  @Field(() => String, { description: 'Order ID', nullable: true })
  orderId?: string;

  @Field(() => String, { description: 'Product ID', nullable: true })
  productId?: string;

  @Field(() => Number, {
    description: 'Quantity of the product',
    nullable: true,
  })
  quantity?: number;

  @Field(() => String, { description: 'Price per unit', nullable: true })
  price?: string;
}
