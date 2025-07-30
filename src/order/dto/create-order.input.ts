import { InputType, Field } from '@nestjs/graphql';
import { OrderType } from '../order.entity';

@InputType({ description: 'Input type for creating an order' })
export class CreateOrderInput {
  @Field(() => String, { description: 'Order number', nullable: true })
  number?: string;

  @Field(() => OrderType, { description: 'Order type' })
  type: OrderType;

  @Field(() => String, { description: 'Customer ID' })
  customerId: string;

  @Field(() => String, { description: 'Warehouse ID' })
  warehouseId: string;

  @Field(() => Date, { description: 'Order date', nullable: true })
  date?: Date;
}
