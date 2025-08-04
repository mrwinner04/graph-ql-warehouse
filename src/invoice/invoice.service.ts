import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity, InvoiceStatus } from './invoice.entity';
import { Invoice } from './invoice.types';
import { transformEntity } from '../common/entity-transformers';
import {
  validateFieldNotExistsInCompany,
  deleteEntityByRole,
} from '../common/common.utils';
import { validateCompanyAccess } from '../common/company-access.utils';
import { UserRole } from '../common/types';
import { nanoid } from 'nanoid';

interface CreateInvoiceData {
  orderId: string;
  number?: string;
  date?: Date;
  status?: InvoiceStatus;
  companyId: string;
  modifiedBy?: string;
}

interface UpdateInvoiceData {
  orderId?: string;
  number?: string;
  date?: Date;
  status?: InvoiceStatus;
  modifiedBy?: string;
}

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
  ) {}

  async findAll(companyId: string): Promise<Invoice[]> {
    const invoices = await this.invoiceRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });

    const invoicesWithTotals = await Promise.all(
      invoices.map(async (invoice) => {
        const total = await this.calculateOrderTotal(invoice.orderId);
        const transformed = transformEntity(invoice) as Invoice;
        return { ...transformed, total };
      }),
    );

    return invoicesWithTotals;
  }

  async findOne(id: string, companyId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    await validateCompanyAccess(
      () => Promise.resolve(invoice),
      companyId,
      'Invoice',
    );

    const total = await this.calculateOrderTotal(invoice.orderId);
    const transformed = transformEntity(invoice) as Invoice;
    return { ...transformed, total };
  }

  async findById(id: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async calculateOrderTotal(orderId: string): Promise<number> {
    const result = await this.invoiceRepository.manager
      .createQueryBuilder()
      .select('SUM(oi.quantity * CAST(oi.price AS DECIMAL))', 'total')
      .from('order_items', 'oi')
      .where('oi.order_id = :orderId', { orderId })
      .andWhere('oi.deleted_at IS NULL')
      .getRawOne();

    return result?.total ? parseFloat(result.total) : 0;
  }

  async create(data: CreateInvoiceData): Promise<Invoice> {
    let invoiceNumber = data.number;
    if (!invoiceNumber) {
      let tries = 0;
      while (tries < 10) {
        invoiceNumber = `INV-${Date.now()}-${nanoid(8)}`;
        const existing = await this.invoiceRepository.findOne({
          where: { number: invoiceNumber, companyId: data.companyId },
        });
        if (!existing) break;
        tries++;
      }
    } else {
      await validateFieldNotExistsInCompany(
        this.invoiceRepository,
        'number',
        invoiceNumber,
        data.companyId,
        'Invoice',
        undefined,
        (value) => value.trim(),
      );
    }

    if (!data.date) {
      data.date = new Date();
    }

    if (!data.status) {
      data.status = InvoiceStatus.PENDING;
    }

    const invoice = this.invoiceRepository.create({
      orderId: data.orderId,
      number: invoiceNumber,
      date: data.date,
      status: data.status,
      companyId: data.companyId,
      modifiedBy: data.modifiedBy,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);
    const total = await this.calculateOrderTotal(savedInvoice.orderId);
    const transformed = transformEntity(savedInvoice) as Invoice;
    return { ...transformed, total };
  }

  async update(
    id: string,
    data: UpdateInvoiceData,
    companyId: string,
  ): Promise<Invoice> {
    await this.findOne(id, companyId);

    if (data.number) {
      await validateFieldNotExistsInCompany(
        this.invoiceRepository,
        'number',
        data.number,
        companyId,
        'Invoice',
        id,
        (value) => value.trim(),
      );
    }

    await this.invoiceRepository.update(
      { id },
      {
        ...(data.orderId && { orderId: data.orderId }),
        ...(data.number && { number: data.number.trim() }),
        ...(data.date && { date: data.date }),
        ...(data.status && { status: data.status }),
        ...(data.modifiedBy && { modifiedBy: data.modifiedBy }),
      },
    );

    return this.findOne(id, companyId);
  }

  async remove(
    id: string,
    companyId: string,
    userRole: UserRole,
  ): Promise<void> {
    await this.findOne(id, companyId);
    await deleteEntityByRole(
      this.invoiceRepository,
      { id },
      userRole,
      'Invoice',
    );
  }

  async findInvoicesByOrderId(orderId: string): Promise<InvoiceEntity[]> {
    return this.invoiceRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  async createForOrder(
    orderId: string,
    companyId: string,
    modifiedBy?: string,
  ): Promise<Invoice> {
    return this.create({
      orderId,
      companyId,
      modifiedBy,
    });
  }
}
