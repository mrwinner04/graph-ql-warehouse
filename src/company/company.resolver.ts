import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { UserRole } from '../common/types';
import { CompanyEntity } from './company.entity';
import { UserEntity } from '../user/user.entity';
import { ProductEntity } from '../product/product.entity';
import { OrderEntity } from '../order/order.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { InvoiceEntity } from '../invoice/invoice.entity';
import { CompanyService } from './company.service';
import { AuthenticatedUser } from '../common/graphql-context';

@Resolver(() => CompanyEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Query(() => CompanyEntity, { description: "Get the current user's company" })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async myCompany(@CurrentUser() user: any): Promise<CompanyEntity> {
    return await this.companyService.findById(user.companyId);
  }

  @Query(() => [CompanyEntity], {
    description: 'Get all companies (OWNER only)',
  })
  @Roles(UserRole.OWNER)
  async companies(): Promise<CompanyEntity[]> {
    return await this.companyService.findAll();
  }

  @Query(() => CompanyEntity, { description: 'Get a company by ID' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async company(
    @Args('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CompanyEntity> {
    if (user.companyId !== id && user.role !== UserRole.OWNER) {
      throw new UnauthorizedException('Access denied');
    }
    return await this.companyService.findById(id);
  }

  @Mutation(() => CompanyEntity, { description: 'Update company information' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async updateCompany(
    @Args('id') id: string,
    @Args('name') name: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CompanyEntity> {
    if (user.companyId !== id && user.role !== UserRole.OWNER) {
      throw new UnauthorizedException('Access denied');
    }
    return await this.companyService.update(id, { name });
  }

  // Field resolvers for relationships
  @ResolveField(() => [UserEntity], {
    description: 'Users belonging to this company',
  })
  async users(@Parent() company: CompanyEntity): Promise<UserEntity[]> {
    return this.companyService.findUsersByCompanyId(company.id);
  }

  @ResolveField(() => [ProductEntity], {
    description: 'Products belonging to this company',
  })
  async products(@Parent() company: CompanyEntity): Promise<ProductEntity[]> {
    return this.companyService.findProductsByCompanyId(company.id);
  }

  @ResolveField(() => [OrderEntity], {
    description: 'Orders belonging to this company',
  })
  async orders(@Parent() company: CompanyEntity): Promise<OrderEntity[]> {
    return this.companyService.findOrdersByCompanyId(company.id);
  }

  @ResolveField(() => [CustomerEntity], {
    description: 'Customers belonging to this company',
  })
  async customers(@Parent() company: CompanyEntity): Promise<CustomerEntity[]> {
    return this.companyService.findCustomersByCompanyId(company.id);
  }

  @ResolveField(() => [InvoiceEntity], {
    description: 'Invoices belonging to this company',
  })
  async invoices(@Parent() company: CompanyEntity): Promise<InvoiceEntity[]> {
    return this.companyService.findInvoicesByCompanyId(company.id);
  }
}
