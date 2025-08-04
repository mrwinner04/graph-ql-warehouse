import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Inject, UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { OwnerAndOperator, AllRoles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { AuthenticatedUser } from '../common/graphql-context';

import { InvoiceEntity } from './invoice.entity';
import { InvoiceService } from './invoice.service';
import {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from './invoice.types';
import { OrderService } from '../order/order.service';
import { OrderResponse } from '../order/order.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateInvoiceSchema, UpdateInvoiceSchema } from './invoice.types';

@Resolver(() => Invoice)
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceResolver {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly orderService: OrderService,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
  ) {}

  @Query(() => [Invoice])
  @AllRoles()
  async invoices(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Invoice[]> {
    return this.invoiceService.findAll(currentUser.companyId);
  }

  @Query(() => Invoice)
  @AllRoles()
  async invoice(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Invoice> {
    return await this.invoiceService.findOne(id, currentUser.companyId);
  }

  @Mutation(() => Invoice)
  @OwnerAndOperator()
  async createInvoice(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input', new ZodValidationPipe(CreateInvoiceSchema))
    input: CreateInvoiceInput,
  ): Promise<Invoice> {
    return await this.invoiceService.create({
      ...input,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });
  }

  @Mutation(() => Invoice)
  @OwnerAndOperator()
  async updateInvoice(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(UpdateInvoiceSchema))
    input: UpdateInvoiceInput,
  ): Promise<Invoice> {
    return await this.invoiceService.update(
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
  async deleteInvoice(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('id') id: string,
  ): Promise<boolean> {
    await this.invoiceService.remove(
      id,
      currentUser.companyId,
      currentUser.role,
    );
    return true;
  }

  @ResolveField(() => OrderResponse)
  async order(@Parent() invoice: Invoice) {
    return await this.orderService.findById(invoice.orderId);
  }
}
