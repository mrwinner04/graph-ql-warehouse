import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderEntity, OrderType } from './order.entity';
import { OrderResponse, TransferOrderInput } from './order.types';
import { UserRole } from '../common/types';
import { validateCompanyAccess } from '../common/company-access.utils';
import { transformEntity } from '../common/entity-transformers';
import {
  validateFieldNotExistsInCompany,
  deleteEntityByRole,
} from '../common/common.utils';
import { ProductService } from '../product/product.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { InvoiceService } from '../invoice/invoice.service';

interface CreateOrderData {
  number?: string;
  type: OrderType;
  customerId: string;
  warehouseId: string;
  date?: Date;
  companyId: string;
  modifiedBy?: string;
  [key: string]: any;
}

interface UpdateOrderData {
  number?: string;
  type?: OrderType;
  customerId?: string;
  warehouseId?: string;
  date?: Date;
  modifiedBy?: string;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly productService: ProductService,
    private readonly warehouseService: WarehouseService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async findAll(companyId: string): Promise<OrderResponse[]> {
    const orders = await this.orderRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
    return orders.map((order) => transformEntity(order) as OrderResponse);
  }

  async findOne(id: string, companyId: string): Promise<OrderResponse> {
    const order = await validateCompanyAccess(
      () =>
        this.orderRepository.findOne({
          where: { id },
        }),
      companyId,
      'Order',
    );

    return transformEntity(order) as OrderResponse;
  }

  async findById(id: string): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return transformEntity(order) as OrderResponse;
  }

  async create(data: CreateOrderData): Promise<OrderResponse> {
    let orderNumber = data.number;
    if (!orderNumber) {
      orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    } else {
      const existing = await this.orderRepository.findOne({
        where: { number: orderNumber.trim(), companyId: data.companyId },
      });

      if (existing) {
        orderNumber = `${orderNumber.trim()}-${Date.now()}`;
      }
    }

    if (!data.date) {
      data.date = new Date();
    }

    if (!data.type) {
      throw new Error('Order type is required');
    }

    const order = this.orderRepository.create({
      number: orderNumber,
      type: data.type,
      customerId: data.customerId,
      warehouseId: data.warehouseId,
      date: data.date,
      companyId: data.companyId,
      modifiedBy: data.modifiedBy,
    });

    const savedOrder = await this.orderRepository.save(order);

    try {
      await this.invoiceService.createForOrder(
        savedOrder.id,
        data.companyId,
        data.modifiedBy,
      );
    } catch (error) {}

    return transformEntity(savedOrder) as OrderResponse;
  }

  async update(
    id: string,
    data: UpdateOrderData,
    companyId: string,
  ): Promise<OrderResponse> {
    await this.findOne(id, companyId);

    if (data.number) {
      await validateFieldNotExistsInCompany(
        this.orderRepository,
        'number',
        data.number,
        companyId,
        'Order',
        id,
        (value) => value.trim(),
      );
    }

    await this.orderRepository.update(
      { id, companyId },
      {
        ...(data.number && { number: data.number.trim() }),
        ...(data.type && { type: data.type as OrderType }),
        ...(data.customerId && { customerId: data.customerId }),
        ...(data.warehouseId && { warehouseId: data.warehouseId }),
        ...(data.date && { date: data.date }),
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
      this.orderRepository,
      { id, companyId },
      userRole,
      'Order',
    );
  }

  async findOrdersByCustomerId(customerId: string): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async createTransferOrder(
    data: TransferOrderInput & { companyId: string; modifiedBy?: string },
  ): Promise<OrderResponse> {
    const fromWarehouse = await this.warehouseService.findById(
      data.fromWarehouseId,
    );
    const toWarehouse = await this.warehouseService.findById(
      data.toWarehouseId,
    );

    if (
      fromWarehouse.companyId !== data.companyId ||
      toWarehouse.companyId !== data.companyId
    ) {
      throw new BadRequestException(
        'Warehouses must belong to the same company',
      );
    }

    if (fromWarehouse.id === toWarehouse.id) {
      throw new BadRequestException('From and to warehouses must be different');
    }

    const orderNumber = `TRANSFER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const transferOrder = this.orderRepository.create({
      number: orderNumber,
      type: OrderType.TRANSFER,
      customerId: data.customerId,
      warehouseId: data.toWarehouseId,
      date: data.date ? new Date(data.date) : new Date(),
      companyId: data.companyId,
      modifiedBy: data.modifiedBy,
    });

    const savedOrder = await this.orderRepository.save(transferOrder);

    return transformEntity(savedOrder) as OrderResponse;
  }
}
