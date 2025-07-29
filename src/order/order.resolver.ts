import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { OrderEntity } from './order.entity';
import { OrderItemEntity } from '../order-item/order-item.entity';
import { OrderService } from './order.service';

@Resolver(() => OrderEntity)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @ResolveField(() => [OrderItemEntity], { description: 'Items in this order' })
  async orderItems(@Parent() order: OrderEntity): Promise<OrderItemEntity[]> {
    return this.orderService.findOrderItemsByOrderId(order.id);
  }
}
