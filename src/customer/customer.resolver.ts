import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {
  Roles,
  OwnerAndOperator,
  AllRoles,
} from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { AuthenticatedUser } from '../common/graphql-context';
import { CustomerEntity } from './customer.entity';
import { OrderEntity } from '../order/order.entity';
import { CustomerService } from './customer.service';
import { CustomerResponse } from './dto/customer.response';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateCustomerSchema, UpdateCustomerSchema } from './customer.types';

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
  @UsePipes(new ZodValidationPipe(CreateCustomerSchema))
  async createCustomer(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: CreateCustomerInput,
  ): Promise<CustomerResponse> {
    return await this.customerService.create({
      ...input,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });
  }

  @Mutation(() => CustomerResponse)
  @OwnerAndOperator()
  @UsePipes(new ZodValidationPipe(UpdateCustomerSchema))
  async updateCustomer(
    @Args('id') id: string,
    @Args('input') input: UpdateCustomerInput,
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

  // Mutation to delete customer
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

  // Field resolver for orders relationship
  @ResolveField(() => [OrderEntity])
  async orders(@Parent() customer: CustomerEntity): Promise<OrderEntity[]> {
    return await this.customerService.findOrdersByCustomerId(customer.id);
  }
}
