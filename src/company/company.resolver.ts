import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, UsePipes, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import {
  OwnerOnly,
  OwnerAndOperator,
  AllRoles,
} from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { UserResponse } from '../user/user.types';
import { ProductResponse } from '../product/product.types';
import { OrderResponse } from '../order/order.types';
import { CustomerResponse } from '../customer/customer.types';
import { Invoice } from '../invoice/invoice.types';
import { CompanyService } from './company.service';
import { AuthenticatedUser } from '../common/graphql-context';
import { UpdateCompanyInput, Company } from './company.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UpdateCompanySchema } from './company.types';

@Resolver(() => Company)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Query(() => [Company])
  @OwnerOnly()
  async companies(@CurrentUser() user: AuthenticatedUser): Promise<Company[]> {
    return await this.companyService.findByCompanyId(user.companyId);
  }

  @Query(() => Company)
  @AllRoles()
  async company(
    @Args('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Company> {
    if (user.companyId !== id) {
      throw new UnauthorizedException('Access denied');
    }
    return await this.companyService.findById(id);
  }

  @Mutation(() => Company)
  @OwnerAndOperator()
  @UsePipes(new ZodValidationPipe(UpdateCompanySchema))
  async updateCompany(
    @Args('id') id: string,
    @Args('input') input: UpdateCompanyInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Company> {
    if (user.companyId !== id) {
      throw new UnauthorizedException('Access denied');
    }
    return await this.companyService.update(id, input);
  }

  @ResolveField(() => [UserResponse])
  async users(@Parent() company: Company): Promise<UserResponse[]> {
    return this.companyService.findUsersByCompanyId(company.id);
  }

  @ResolveField(() => [ProductResponse])
  async products(@Parent() company: Company): Promise<ProductResponse[]> {
    return this.companyService.findProductsByCompanyId(company.id);
  }

  @ResolveField(() => [OrderResponse])
  async orders(@Parent() company: Company): Promise<OrderResponse[]> {
    return this.companyService.findOrdersByCompanyId(company.id);
  }

  @ResolveField(() => [CustomerResponse])
  async customers(@Parent() company: Company): Promise<CustomerResponse[]> {
    return this.companyService.findCustomersByCompanyId(company.id);
  }

  @ResolveField(() => [Invoice])
  async invoices(@Parent() company: Company): Promise<Invoice[]> {
    return this.companyService.findInvoicesByCompanyId(company.id);
  }
}
