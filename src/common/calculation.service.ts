import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity } from '../invoice/invoice.entity';

@Injectable()
export class CalculationService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
  ) {}

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
}
