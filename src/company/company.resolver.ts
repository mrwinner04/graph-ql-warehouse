import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, UsePipes, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {
  Roles,
  OwnerOnly,
  OwnerAndOperator,
  AllRoles,
} from '../decorator/roles.decorator';
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
import { UpdateCompanyInput } from './company.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UpdateCompanySchema } from './company.types';

@Resolver(() => CompanyEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Query(() => [CompanyEntity])
  @OwnerOnly()
  async companies(): Promise<CompanyEntity[]> {
    return await this.companyService.findAll();
  }

  @Query(() => CompanyEntity)
  @AllRoles()
  async company(
    @Args('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CompanyEntity> {
    if (user.companyId !== id && user.role !== UserRole.OWNER) {
      throw new UnauthorizedException('Access denied');
    }
    return await this.companyService.findById(id);
  }

  @Mutation(() => CompanyEntity)
  @OwnerAndOperator()
  @UsePipes(new ZodValidationPipe(UpdateCompanySchema))
  async updateCompany(
    @Args('id') id: string,
    @Args('input') input: UpdateCompanyInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CompanyEntity> {
    if (user.companyId !== id && user.role !== UserRole.OWNER) {
      throw new UnauthorizedException('Access denied');
    }
    return await this.companyService.update(id, input);
  }

  @ResolveField(() => [UserEntity])
  async users(@Parent() company: CompanyEntity): Promise<UserEntity[]> {
    return this.companyService.findUsersByCompanyId(company.id);
  }

  @ResolveField(() => [ProductEntity])
  async products(@Parent() company: CompanyEntity): Promise<ProductEntity[]> {
    return this.companyService.findProductsByCompanyId(company.id);
  }

  @ResolveField(() => [OrderEntity])
  async orders(@Parent() company: CompanyEntity): Promise<OrderEntity[]> {
    return this.companyService.findOrdersByCompanyId(company.id);
  }

  @ResolveField(() => [CustomerEntity])
  async customers(@Parent() company: CompanyEntity): Promise<CustomerEntity[]> {
    return this.companyService.findCustomersByCompanyId(company.id);
  }

  @ResolveField(() => [InvoiceEntity])
  async invoices(@Parent() company: CompanyEntity): Promise<InvoiceEntity[]> {
    return this.companyService.findInvoicesByCompanyId(company.id);
  }
}
