import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity, InvoiceStatus } from './invoice.entity';
import { InvoiceResponse } from './invoice.types';
import { transformEntity } from '../common/entity-transformers';
import {
  validateFieldNotExistsInCompany,
  deleteEntityByRole,
} from '../common/common.utils';
import { validateCompanyAccess } from '../common/company-access.utils';
import { UserRole } from '../common/types';
import { nanoid } from 'nanoid';
import { CalculationService } from '../common/calculation.service';

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
    private readonly calculationService: CalculationService,
  ) {}

  async findAll(companyId: string): Promise<InvoiceResponse[]> {
    const invoices = await this.invoiceRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });

    const invoicesWithTotals = await Promise.all(
      invoices.map(async (invoice) => {
        const total = await this.calculationService.calculateOrderTotal(
          invoice.orderId,
        );
        const transformed = transformEntity(invoice) as InvoiceResponse;
        return { ...transformed, total };
      }),
    );

    return invoicesWithTotals;
  }

  async findOne(id: string, companyId: string): Promise<InvoiceResponse> {
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

    const total = await this.calculationService.calculateOrderTotal(
      invoice.orderId,
    );
    const transformed = transformEntity(invoice) as InvoiceResponse;
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

  async create(data: CreateInvoiceData): Promise<InvoiceResponse> {
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
    return transformEntity(savedInvoice) as InvoiceResponse;
  }

  async update(
    id: string,
    data: UpdateInvoiceData,
    companyId: string,
  ): Promise<InvoiceResponse> {
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
  ): Promise<InvoiceResponse> {
    return this.create({
      orderId,
      companyId,
      modifiedBy,
    });
  }
}
