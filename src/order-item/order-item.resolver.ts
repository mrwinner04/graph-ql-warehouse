import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { OrderItemEntity } from './order-item.entity';
import { OrderItemResponse } from './dto/order-item.response';
import { CreateOrderItemInput } from './dto/create-order-item.input';
import { UpdateOrderItemInput } from './dto/update-order-item.input';
import { OrderItemService } from './order-item.service';
import { UserRole } from '../common/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { CurrentClient } from '../decorator/current-client.decorator';
import { AuthenticatedUser } from '../common/graphql-context';

// Import related entities for field resolvers
import { OrderEntity } from '../order/order.entity';
import { ProductEntity } from '../product/product.entity';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';

@Resolver(() => OrderItemEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderItemResolver {
  constructor(
    private readonly orderItemService: OrderItemService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {}

  // Query: Get all order items for the current user's company
  @Query(() => [OrderItemEntity], {
    description: 'Get all order items for the company',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async orderItems(
    @CurrentClient() companyId: string,
  ): Promise<OrderItemEntity[]> {
    const orderItems = await this.orderItemService.findAll(companyId);

    const filteredOrderItems: OrderItemEntity[] = [];
    for (const orderItemResponse of orderItems) {
      try {
        const order = await this.orderService.findById(
          orderItemResponse.orderId,
        );
        if (order.companyId === companyId) {
          const orderItem = new OrderItemEntity();
          Object.assign(orderItem, orderItemResponse);
          filteredOrderItems.push(orderItem);
        }
      } catch (error) {
        // Skip order items with invalid orders
        continue;
      }
    }

    return filteredOrderItems;
  }

  // Query: Get a specific order item by ID
  @Query(() => OrderItemEntity, {
    description: 'Get a specific order item by ID',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async orderItem(
    @Args('id') id: string,
    @CurrentClient() companyId: string,
  ): Promise<OrderItemEntity> {
    const orderItemResponse = await this.orderItemService.findOne(
      id,
      companyId,
    );

    // Validate company access by checking the order
    const order = await this.orderService.findById(orderItemResponse.orderId);
    if (order.companyId !== companyId) {
      throw new Error('Order item not found');
    }

    // Convert OrderItemResponse back to OrderItemEntity for field resolvers
    const orderItem = new OrderItemEntity();
    Object.assign(orderItem, orderItemResponse);
    return orderItem;
  }

  // Mutation: Create a new order item
  @Mutation(() => OrderItemEntity, { description: 'Create a new order item' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async createOrderItem(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: CreateOrderItemInput,
  ): Promise<OrderItemEntity> {
    // Get the order to validate company access
    const order = await this.orderService.findById(input.orderId);

    const orderItemResponse = await this.orderItemService.create({
      ...input,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });

    // Convert OrderItemResponse back to OrderItemEntity for field resolvers
    const orderItem = new OrderItemEntity();
    Object.assign(orderItem, orderItemResponse);
    return orderItem;
  }

  // Mutation: Update an existing order item
  @Mutation(() => OrderItemEntity, {
    description: 'Update an existing order item',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
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

    // Convert OrderItemResponse back to OrderItemEntity for field resolvers
    const orderItem = new OrderItemEntity();
    Object.assign(orderItem, orderItemResponse);
    return orderItem;
  }

  // Mutation: Delete an order item
  @Mutation(() => Boolean, { description: 'Delete an order item' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
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

  // Field Resolver: Resolve order for an order item
  @ResolveField(() => OrderEntity, { description: 'Order for this order item' })
  async order(@Parent() orderItem: OrderItemEntity): Promise<OrderEntity> {
    return this.orderService.findById(orderItem.orderId);
  }

  // Field Resolver: Resolve product for an order item
  @ResolveField(() => ProductEntity, {
    description: 'Product for this order item',
  })
  async product(@Parent() orderItem: OrderItemEntity): Promise<ProductEntity> {
    return this.productService.findById(orderItem.productId);
  }
}
