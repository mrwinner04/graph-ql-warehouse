import { InputType, Field } from '@nestjs/graphql';

@InputType({ description: 'Input type for creating an order item' })
export class CreateOrderItemInput {
  @Field(() => String, { description: 'Order ID' })
  orderId: string;

  @Field(() => String, { description: 'Product ID' })
  productId: string;

  @Field(() => Number, { description: 'Quantity of the product' })
  quantity: number;

  @Field(() => String, { description: 'Price per unit' })
  price: string;
}
