import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import {
  CreateOrderInput,
  UpdateOrderInput,
  TransferOrderInput,
  OrderResponse,
} from './order.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateOrderSchema, UpdateOrderSchema } from './order.types';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { OwnerAndOperator, AllRoles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';

import { AuthenticatedUser } from '../common/graphql-context';
import { CustomerResponse } from '../customer/customer.types';
import { WarehouseResponse } from '../warehouse/warehouse.types';
import { OrderItemResponse } from '../order-item/order-item.types';
import { Invoice } from '../invoice/invoice.types';
import { CustomerService } from '../customer/customer.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { OrderItemService } from '../order-item/order-item.service';
import { InvoiceService } from '../invoice/invoice.service';

@Resolver(() => OrderResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    private readonly customerService: CustomerService,
    private readonly warehouseService: WarehouseService,
    private readonly orderItemService: OrderItemService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Query(() => [OrderResponse])
  @AllRoles()
  async orders(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderResponse[]> {
    return await this.orderService.findAll(currentUser.companyId);
  }

  @Query(() => OrderResponse)
  @AllRoles()
  async order(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderResponse> {
    return await this.orderService.findOne(id, currentUser.companyId);
  }

  @Mutation(() => OrderResponse)
  @OwnerAndOperator()
  async createOrder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input', new ZodValidationPipe(CreateOrderSchema))
    input: CreateOrderInput,
  ): Promise<OrderResponse> {
    return await this.orderService.create({
      ...input,
      modifiedBy: currentUser.id,
      companyId: currentUser.companyId,
    });
  }

  @Mutation(() => OrderResponse)
  @OwnerAndOperator()
  async updateOrder(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(UpdateOrderSchema))
    input: UpdateOrderInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderResponse> {
    return await this.orderService.update(
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
  async deleteOrder(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<boolean> {
    await this.orderService.remove(id, currentUser.companyId, currentUser.role);
    return true;
  }

  @Mutation(() => OrderResponse)
  @OwnerAndOperator()
  async createTransferOrder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: TransferOrderInput,
  ): Promise<OrderResponse> {
    return await this.orderService.createTransferOrder({
      ...input,
      modifiedBy: currentUser.id,
      companyId: currentUser.companyId,
    });
  }

  @ResolveField(() => CustomerResponse)
  async customer(@Parent() order: OrderResponse): Promise<CustomerResponse> {
    return this.customerService.findById(order.customerId);
  }

  @ResolveField(() => WarehouseResponse)
  async warehouse(@Parent() order: OrderResponse): Promise<WarehouseResponse> {
    return this.warehouseService.findById(order.warehouseId);
  }

  @ResolveField(() => [OrderItemResponse])
  async orderItems(
    @Parent() order: OrderResponse,
  ): Promise<OrderItemResponse[]> {
    return this.orderItemService.findOrderItemsByOrderId(order.id);
  }

  @ResolveField(() => [Invoice])
  async invoices(@Parent() order: OrderResponse): Promise<Invoice[]> {
    return this.invoiceService.findInvoicesByOrderId(order.id);
  }
}
