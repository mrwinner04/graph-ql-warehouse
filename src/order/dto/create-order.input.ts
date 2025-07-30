import { InputType, Field } from '@nestjs/graphql';
import { OrderType } from '../order.entity';

@InputType()
export class CreateOrderInput {
  @Field(() => String)
  number?: string;

  @Field(() => OrderType)
  type: OrderType;

  @Field(() => String)
  customerId: string;

  @Field(() => String)
  warehouseId: string;

  @Field(() => Date)
  date?: Date;
}
