import { InputType, Field } from '@nestjs/graphql';
import { OrderType } from '../order.entity';

@InputType({ description: 'Input type for updating an order' })
export class UpdateOrderInput {
  @Field(() => String, { description: 'Order number', nullable: true })
  number?: string;

  @Field(() => OrderType, { description: 'Order type', nullable: true })
  type?: OrderType;

  @Field(() => String, { description: 'Customer ID', nullable: true })
  customerId?: string;

  @Field(() => String, { description: 'Warehouse ID', nullable: true })
  warehouseId?: string;

  @Field(() => Date, { description: 'Order date', nullable: true })
  date?: Date;
}
