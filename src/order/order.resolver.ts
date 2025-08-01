import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, UsePipes } from '@nestjs/common';

import { OrderEntity } from './order.entity';
import {
  CreateOrderInput,
  UpdateOrderInput,
  TransferOrderInput,
} from './order.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateOrderSchema, UpdateOrderSchema } from './order.types';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { OwnerAndOperator, AllRoles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';

import { AuthenticatedUser } from '../common/graphql-context';
import { CustomerEntity } from '../customer/customer.entity';
import { WarehouseEntity } from '../warehouse/warehouse.entity';
import { OrderItemEntity } from '../order-item/order-item.entity';
import { InvoiceEntity } from '../invoice/invoice.entity';
import { CustomerService } from '../customer/customer.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { OrderItemService } from '../order-item/order-item.service';
import { InvoiceService } from '../invoice/invoice.service';

@Resolver(() => OrderEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    private readonly customerService: CustomerService,
    private readonly warehouseService: WarehouseService,
    private readonly orderItemService: OrderItemService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Query(() => [OrderEntity])
  @AllRoles()
  async orders(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderEntity[]> {
    const orders = await this.orderService.findAll(currentUser.companyId);
    // Convert OrderResponse back to OrderEntity for field resolvers
    return orders.map((orderResponse) => {
      const order = new OrderEntity();
      Object.assign(order, orderResponse);
      return order;
    });
  }

  @Query(() => OrderEntity)
  @AllRoles()
  async order(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderEntity> {
    const orderResponse = await this.orderService.findOne(
      id,
      currentUser.companyId,
    );
    // Convert OrderResponse back to OrderEntity for field resolvers
    const order = new OrderEntity();
    Object.assign(order, orderResponse);
    return order;
  }

  @Mutation(() => OrderEntity)
  @OwnerAndOperator()
  async createOrder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input', new ZodValidationPipe(CreateOrderSchema))
    input: CreateOrderInput,
  ): Promise<OrderEntity> {
    const orderResponse = await this.orderService.create({
      ...input,
      modifiedBy: currentUser.id,
      companyId: currentUser.companyId,
    });

    const order = new OrderEntity();
    Object.assign(order, orderResponse);
    return order;
  }

  @Mutation(() => OrderEntity)
  @OwnerAndOperator()
  async updateOrder(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(UpdateOrderSchema))
    input: UpdateOrderInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderEntity> {
    const orderResponse = await this.orderService.update(
      id,
      {
        ...input,
        modifiedBy: currentUser.id,
      },
      currentUser.companyId,
    );

    const order = new OrderEntity();
    Object.assign(order, orderResponse);
    return order;
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

  @Mutation(() => OrderEntity)
  @OwnerAndOperator()
  async createTransferOrder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: TransferOrderInput,
  ): Promise<OrderEntity> {
    const orderResponse = await this.orderService.createTransferOrder({
      ...input,
      modifiedBy: currentUser.id,
      companyId: currentUser.companyId,
    });

    const order = new OrderEntity();
    Object.assign(order, orderResponse);
    return order;
  }

  @ResolveField(() => CustomerEntity)
  async customer(@Parent() order: OrderEntity): Promise<CustomerEntity> {
    return this.customerService.findById(order.customerId);
  }

  @ResolveField(() => WarehouseEntity)
  async warehouse(@Parent() order: OrderEntity): Promise<WarehouseEntity> {
    return this.warehouseService.findById(order.warehouseId);
  }

  @ResolveField(() => [OrderItemEntity])
  async orderItems(@Parent() order: OrderEntity): Promise<OrderItemEntity[]> {
    return this.orderItemService.findOrderItemsByOrderId(order.id);
  }

  @ResolveField(() => [InvoiceEntity])
  async invoices(@Parent() order: OrderEntity): Promise<InvoiceEntity[]> {
    return this.invoiceService.findInvoicesByOrderId(order.id);
  }
}
