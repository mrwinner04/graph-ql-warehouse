import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { OrderEntity } from './order.entity';
import { OrderResponse } from './dto/order.response';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { OrderService } from './order.service';
import { UserRole } from '../common/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { CurrentClient } from '../decorator/current-client.decorator';
import { AuthenticatedUser } from '../common/graphql-context';
import { CustomerEntity } from '../customer/customer.entity';
import { WarehouseEntity } from '../warehouse/warehouse.entity';
import { OrderItemEntity } from '../order-item/order-item.entity';
import { InvoiceEntity } from '../invoice/invoice.entity';
import { CustomerService } from '../customer/customer.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { OrderItemService } from '../order-item/order-item.service';
// import { InvoiceService } from '../invoice/invoice.service';

@Resolver(() => OrderEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    private readonly customerService: CustomerService,
    private readonly warehouseService: WarehouseService,
    private readonly orderItemService: OrderItemService,
    // private readonly invoiceService: InvoiceService,
  ) {}

  @Query(() => [OrderEntity], {
    description: 'Get all orders for the company',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async orders(@CurrentClient() companyId: string): Promise<OrderEntity[]> {
    const orders = await this.orderService.findAll(companyId);
    // Convert OrderResponse back to OrderEntity for field resolvers
    return orders.map((orderResponse) => {
      const order = new OrderEntity();
      Object.assign(order, orderResponse);
      return order;
    });
  }

  @Query(() => OrderEntity, { description: 'Get a specific order by ID' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async order(
    @Args('id') id: string,
    @CurrentClient() companyId: string,
  ): Promise<OrderEntity> {
    const orderResponse = await this.orderService.findOne(id, companyId);
    // Convert OrderResponse back to OrderEntity for field resolvers
    const order = new OrderEntity();
    Object.assign(order, orderResponse);
    return order;
  }

  @Mutation(() => OrderResponse, { description: 'Create a new order' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async createOrder(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: CreateOrderInput,
  ): Promise<OrderResponse> {
    return this.orderService.create({
      ...input,
      modifiedBy: currentUser.id,
      companyId: currentUser.companyId,
    });
  }

  @Mutation(() => OrderResponse, { description: 'Update an existing order' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async updateOrder(
    @Args('id') id: string,
    @Args('input') input: UpdateOrderInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OrderResponse> {
    return this.orderService.update(
      id,
      {
        ...input,
        modifiedBy: currentUser.id,
      },
      currentUser.companyId,
    );
  }

  @Mutation(() => Boolean, { description: 'Delete an order' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async deleteOrder(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<boolean> {
    await this.orderService.remove(id, currentUser.companyId, currentUser.role);
    return true;
  }

  // Field Resolver: Resolve customer for an order
  @ResolveField(() => CustomerEntity, {
    description: 'Customer for this order',
  })
  async customer(@Parent() order: OrderEntity): Promise<CustomerEntity> {
    return this.customerService.findById(order.customerId);
  }

  // Field Resolver: Resolve warehouse for an order
  @ResolveField(() => WarehouseEntity, {
    description: 'Warehouse for this order',
  })
  async warehouse(@Parent() order: OrderEntity): Promise<WarehouseEntity> {
    return this.warehouseService.findById(order.warehouseId);
  }

  // Field Resolver: Resolve order items for an order
  @ResolveField(() => [OrderItemEntity], {
    description: 'Order items for this order',
  })
  async orderItems(@Parent() order: OrderEntity): Promise<OrderItemEntity[]> {
    return this.orderItemService.findOrderItemsByOrderId(order.id);
  }

  // Field Resolver: Resolve invoices for an order
  // @ResolveField(() => [InvoiceEntity], {
  //   description: 'Invoices for this order',
  // })
  // async invoices(@Parent() order: OrderEntity): Promise<InvoiceEntity[]> {
  //   return this.invoiceService.findInvoicesByOrderId(order.id);
  // }
}
