import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { OwnerAndOperator, AllRoles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { AuthenticatedUser } from '../common/graphql-context';
import { CustomerEntity } from './customer.entity';
import { OrderEntity } from '../order/order.entity';
import { CustomerService } from './customer.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CustomerResponse,
  CreateCustomerInput,
  UpdateCustomerInput,
  ClientWithMostOrders,
} from './customer.types';

@Resolver(() => CustomerEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Query(() => [CustomerResponse])
  @AllRoles()
  async customers(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CustomerResponse[]> {
    return await this.customerService.findAll(user.companyId);
  }

  @Query(() => CustomerResponse)
  @AllRoles()
  async customer(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CustomerResponse> {
    return await this.customerService.findOne(id, currentUser.companyId);
  }

  @Mutation(() => CustomerResponse)
  @OwnerAndOperator()
  async createCustomer(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input', new ZodValidationPipe(CreateCustomerSchema))
    input: CreateCustomerInput,
  ): Promise<CustomerResponse> {
    return await this.customerService.create({
      ...input,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });
  }

  @Mutation(() => CustomerResponse)
  @OwnerAndOperator()
  async updateCustomer(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(UpdateCustomerSchema))
    input: UpdateCustomerInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CustomerResponse> {
    return await this.customerService.update(
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
  async deleteCustomer(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<boolean> {
    await this.customerService.remove(
      id,
      currentUser.companyId,
      currentUser.role,
    );
    return true;
  }

  @ResolveField(() => [OrderEntity])
  async orders(@Parent() customer: CustomerEntity): Promise<OrderEntity[]> {
    return await this.customerService.findOrdersByCustomerId(customer.id);
  }

  @Query(() => ClientWithMostOrders, {
    description: 'Get client with most orders',
    nullable: true,
  })
  @AllRoles()
  async clientWithMostOrders(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ClientWithMostOrders | undefined> {
    return await this.customerService.getClientWithMostOrders(
      currentUser.companyId,
    );
  }
}
