import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, UsePipes } from '@nestjs/common';

import { OrderItemEntity } from './order-item.entity';
import { CreateOrderItemInput, UpdateOrderItemInput } from './order-item.types';
import { OrderItemService } from './order-item.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { OwnerAndOperator, AllRoles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';

import { AuthenticatedUser } from '../common/graphql-context';

// Import related entities for field resolvers
import { OrderEntity } from '../order/order.entity';
import { ProductEntity } from '../product/product.entity';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  CreateOrderItemSchema,
  UpdateOrderItemSchema,
} from './order-item.types';

@Resolver(() => OrderItemEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderItemResolver {
  constructor(
    private readonly orderItemService: OrderItemService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {}

  @Query(() => [OrderItemEntity])
  @AllRoles()
  async orderItems(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderItemEntity[]> {
    const orderItems = await this.orderItemService.findAll(
      currentUser.companyId,
    );

    const filteredOrderItems: OrderItemEntity[] = [];
    for (const orderItemResponse of orderItems) {
      try {
        const order = await this.orderService.findById(
          orderItemResponse.orderId,
        );
        if (order.companyId === currentUser.companyId) {
          const orderItem = new OrderItemEntity();
          Object.assign(orderItem, orderItemResponse);
          filteredOrderItems.push(orderItem);
        }
      } catch (error) {
        continue;
      }
    }

    return filteredOrderItems;
  }

  @Query(() => OrderItemEntity)
  @AllRoles()
  async orderItem(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderItemEntity> {
    const orderItemResponse = await this.orderItemService.findOne(
      id,
      currentUser.companyId,
    );

    const order = await this.orderService.findById(orderItemResponse.orderId);
    if (order.companyId !== currentUser.companyId) {
      throw new Error('Order item not found');
    }

    const orderItem = new OrderItemEntity();
    Object.assign(orderItem, orderItemResponse);
    return orderItem;
  }

  @Mutation(() => OrderItemEntity)
  @OwnerAndOperator()
  @UsePipes(new ZodValidationPipe(CreateOrderItemSchema))
  async createOrderItem(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: CreateOrderItemInput,
  ): Promise<OrderItemEntity> {
    const order = await this.orderService.findById(input.orderId);

    const orderItemResponse = await this.orderItemService.create({
      ...input,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });

    const orderItem = new OrderItemEntity();
    Object.assign(orderItem, orderItemResponse);
    return orderItem;
  }

  @Mutation(() => OrderItemEntity)
  @OwnerAndOperator()
  @UsePipes(new ZodValidationPipe(UpdateOrderItemSchema))
  async updateOrderItem(
    @Args('id') id: string,
    @Args('input') input: UpdateOrderItemInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderItemEntity> {
    const orderItemResponse = await this.orderItemService.update(
      id,
      {
        ...input,
        modifiedBy: currentUser.id,
      },
      currentUser.companyId,
    );

    const orderItem = new OrderItemEntity();
    Object.assign(orderItem, orderItemResponse);
    return orderItem;
  }

  @Mutation(() => Boolean)
  @OwnerAndOperator()
  async deleteOrderItem(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<boolean> {
    await this.orderItemService.remove(
      id,
      currentUser.companyId,
      currentUser.role,
    );
    return true;
  }

  @ResolveField(() => OrderEntity)
  async order(@Parent() orderItem: OrderItemEntity): Promise<OrderEntity> {
    return this.orderService.findById(orderItem.orderId);
  }

  @ResolveField(() => ProductEntity)
  async product(@Parent() orderItem: OrderItemEntity): Promise<ProductEntity> {
    return this.productService.findById(orderItem.productId);
  }
}
