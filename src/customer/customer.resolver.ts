import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { UserRole } from '../common/types';
import { AuthenticatedUser } from '../common/graphql-context';
import { CustomerEntity } from './customer.entity';
import { OrderEntity } from '../order/order.entity';
import { CustomerService } from './customer.service';
import { CustomerResponse } from './dto/customer.response';

@Resolver(() => CustomerEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  // Query to get all customers in the company
  @Query(() => [CustomerResponse], {
    description: 'Get all customers in the same company',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async customers(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CustomerResponse[]> {
    return await this.customerService.findAll(user.companyId);
  }

  // Query to get a specific customer by ID
  @Query(() => CustomerResponse, { description: 'Get a customer by ID' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async customer(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CustomerResponse> {
    return await this.customerService.findOne(id, currentUser.companyId);
  }

  // Mutation to create a new customer
  @Mutation(() => CustomerResponse, {
    description: 'Create a new customer in the company',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async createCustomer(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('name') name: string,
    @Args('email', { nullable: true }) email?: string,
    @Args('type', { nullable: true }) type?: string,
  ): Promise<CustomerResponse> {
    return await this.customerService.create({
      name,
      email,
      type,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });
  }

  // Mutation to update customer
  @Mutation(() => CustomerResponse, {
    description: 'Update customer information',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async updateCustomer(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('id') id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('email', { nullable: true }) email?: string,
    @Args('type', { nullable: true }) type?: string,
  ): Promise<CustomerResponse> {
    return await this.customerService.update(
      id,
      {
        name,
        email,
        type,
        modifiedBy: currentUser.id,
      },
      currentUser.companyId,
    );
  }

  // Mutation to delete customer
  @Mutation(() => Boolean, {
    description:
      'Delete a customer (OWNER: hard delete, OPERATOR: soft delete)',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
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
  @ResolveField(() => [OrderEntity], {
    description: 'Orders placed by this customer',
  })
  async orders(@Parent() customer: CustomerEntity): Promise<OrderEntity[]> {
    return await this.customerService.findOrdersByCustomerId(customer.id);
  }
}
