import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, UsePipes } from '@nestjs/common';

import {
  CreateOrderItemInput,
  UpdateOrderItemInput,
  OrderItemResponse,
} from './order-item.types';
import { OrderItemService } from './order-item.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { OwnerAndOperator, AllRoles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';

import { AuthenticatedUser } from '../common/graphql-context';

import { OrderResponse } from '../order/order.types';
import { ProductResponse } from '../product/product.types';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  CreateOrderItemSchema,
  UpdateOrderItemSchema,
} from './order-item.types';

@Resolver(() => OrderItemResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderItemResolver {
  constructor(
    private readonly orderItemService: OrderItemService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {}

  @Query(() => [OrderItemResponse])
  @AllRoles()
  async orderItems(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderItemResponse[]> {
    return await this.orderItemService.findAll(currentUser.companyId);
  }

  @Query(() => OrderItemResponse)
  @AllRoles()
  async orderItem(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderItemResponse> {
    return await this.orderItemService.findOne(id, currentUser.companyId);
  }

  @Mutation(() => OrderItemResponse)
  @OwnerAndOperator()
  async createOrderItem(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input', new ZodValidationPipe(CreateOrderItemSchema))
    input: CreateOrderItemInput,
  ): Promise<OrderItemResponse> {
    return await this.orderItemService.create({
      ...input,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });
  }

  @Mutation(() => OrderItemResponse)
  @OwnerAndOperator()
  async updateOrderItem(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(UpdateOrderItemSchema))
    input: UpdateOrderItemInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderItemResponse> {
    return await this.orderItemService.update(
      id,
      {
        ...input,
        modifiedBy: currentUser.id,
      },
      currentUser.companyId,
    );
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

  @ResolveField(() => OrderResponse)
  async order(@Parent() orderItem: OrderItemResponse): Promise<OrderResponse> {
    return this.orderService.findById(orderItem.orderId);
  }

  @ResolveField(() => ProductResponse)
  async product(
    @Parent() orderItem: OrderItemResponse,
  ): Promise<ProductResponse> {
    return this.productService.findById(orderItem.productId);
  }
}
