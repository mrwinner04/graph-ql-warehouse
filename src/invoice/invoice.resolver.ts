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
import { OwnerAndOperator, AllRoles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { AuthenticatedUser } from '../common/graphql-context';

import { InvoiceEntity } from './invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceResponse } from './dto/invoice.response';
import { CreateInvoiceInput } from './dto/create-invoice.input';
import { UpdateInvoiceInput } from './dto/update-invoice.input';
import { OrderService } from '../order/order.service';
import { OrderEntity } from '../order/order.entity';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateInvoiceSchema, UpdateInvoiceSchema } from './invoice.types';

@Resolver(() => InvoiceEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceResolver {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly orderService: OrderService,
  ) {}

  @Query(() => [InvoiceEntity])
  @AllRoles()
  async invoices(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<InvoiceEntity[]> {
    const invoices = await this.invoiceService.findAll(currentUser.companyId);

    return invoices.map((invoiceResponse) => {
      const invoice = new InvoiceEntity();
      Object.assign(invoice, invoiceResponse);
      return invoice;
    });
  }

  @Query(() => InvoiceEntity)
  @AllRoles()
  async invoice(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<InvoiceEntity> {
    const invoiceResponse = await this.invoiceService.findOne(
      id,
      currentUser.companyId,
    );

    const invoice = new InvoiceEntity();
    Object.assign(invoice, invoiceResponse);
    return invoice;
  }

  @Mutation(() => InvoiceResponse)
  @OwnerAndOperator()
  @UsePipes(new ZodValidationPipe(CreateInvoiceSchema))
  async createInvoice(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: CreateInvoiceInput,
  ): Promise<InvoiceResponse> {
    return await this.invoiceService.create({
      ...input,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });
  }

  @Mutation(() => InvoiceResponse)
  @OwnerAndOperator()
  @UsePipes(new ZodValidationPipe(UpdateInvoiceSchema))
  async updateInvoice(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('id') id: string,
    @Args('input') input: UpdateInvoiceInput,
  ): Promise<InvoiceResponse> {
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

  @ResolveField(() => OrderEntity)
  async order(@Parent() invoice: InvoiceEntity) {
    return await this.orderService.findById(invoice.orderId);
  }
}
