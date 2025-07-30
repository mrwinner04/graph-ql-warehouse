import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderEntity, OrderType } from './order.entity';
import { OrderResponse } from './dto/order.response';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { UserRole } from '../common/types';
import { validateCompanyAccess } from '../common/company-access.utils';
import { transformEntity } from '../common/entity-transformers';
import {
  validateFieldNotExistsInCompany,
  deleteEntityByRole,
} from '../common/common.utils';
import { validateProductWarehouseCompatibility } from '../common/type-validation.utils';
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
  [key: string]: any; // Allow additional properties
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

  // Find all orders for a company
  async findAll(companyId: string): Promise<OrderResponse[]> {
    const orders = await this.orderRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
    return orders.map((order) => transformEntity(order) as OrderResponse);
  }

  // Find order by ID with company access validation
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

  // Find order by ID (for internal use)
  async findById(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  // Create new order
  async create(data: CreateOrderData): Promise<OrderResponse> {
    // Generate unique order number if not provided or if it already exists
    let orderNumber = data.number;
    if (!orderNumber) {
      orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    } else {
      // Check if order with number already exists in the same company
      const existing = await this.orderRepository.findOne({
        where: { number: orderNumber.trim(), companyId: data.companyId },
      });

      if (existing) {
        // If exists, append timestamp to make it unique
        orderNumber = `${orderNumber.trim()}-${Date.now()}`;
      }
    }

    // Set default date if not provided
    if (!data.date) {
      data.date = new Date();
    }

    // Ensure type is properly set
    if (!data.type) {
      throw new Error('Order type is required');
    }

    // Note: Product-warehouse type validation will be done when adding order items
    // since we don't know which products will be added to the order at creation time

    // Create order
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

    // Automatically create an invoice for the order
    try {
      await this.invoiceService.createForOrder(
        savedOrder.id,
        data.companyId,
        data.modifiedBy,
      );
      console.log(
        `✅ Invoice created automatically for order ${savedOrder.number}`,
      );
    } catch (error) {
      console.error(
        `❌ Failed to create invoice for order ${savedOrder.number}:`,
        error.message,
      );
      // Don't fail the order creation if invoice creation fails
    }

    return transformEntity(savedOrder) as OrderResponse;
  }

  // Update order with company access validation
  async update(
    id: string,
    data: UpdateOrderData,
    companyId: string,
  ): Promise<OrderResponse> {
    // Check if order exists and has access
    await this.findOne(id, companyId);

    // Check if number is being changed and if it already exists
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

    // Update order
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

  // Delete order with company access validation
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

  // Find orders by customer ID (for field resolver)
  async findOrdersByCustomerId(customerId: string): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  // Find orders by warehouse ID (for field resolver)
  async findOrdersByWarehouseId(warehouseId: string): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { warehouseId },
      order: { createdAt: 'DESC' },
    });
  }
}
