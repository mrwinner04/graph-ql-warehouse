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

import { InvoiceEntity } from './invoice.entity';
import { InvoiceService } from './invoice.service';
import {
  InvoiceResponse,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from './invoice.types';
import { OrderService } from '../order/order.service';
import { OrderEntity } from '../order/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateInvoiceSchema, UpdateInvoiceSchema } from './invoice.types';

@Resolver(() => InvoiceEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceResolver {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly orderService: OrderService,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
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

  @ResolveField(() => Number, { nullable: true })
  async total(@Parent() invoice: InvoiceEntity): Promise<number> {
    const result = await this.invoiceRepository.manager
      .createQueryBuilder()
      .select('SUM(oi.quantity * CAST(oi.price AS DECIMAL))', 'total')
      .from('order_items', 'oi')
      .where('oi.order_id = :orderId', { orderId: invoice.orderId })
      .andWhere('oi.deleted_at IS NULL')
      .getRawOne();

    return result?.total ? parseFloat(result.total) : 0;
  }
}
