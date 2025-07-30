import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderItemEntity } from './order-item.entity';
import { OrderItemResponse } from './dto/order-item.response';
import { UserRole } from '../common/types';
import { transformEntity } from '../common/entity-transformers';
import { deleteEntityByRole } from '../common/common.utils';
import { validateProductWarehouseCompatibility } from '../common/type-validation.utils';
import { ProductService } from '../product/product.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { OrderService } from '../order/order.service';

interface CreateOrderItemData {
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  companyId: string;
  modifiedBy?: string;
}

interface UpdateOrderItemData {
  orderId?: string;
  productId?: string;
  quantity?: number;
  price?: string;
  modifiedBy?: string;
}

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    private readonly productService: ProductService,
    private readonly warehouseService: WarehouseService,
    private readonly orderService: OrderService,
  ) {}

  // Find all order items for a company
  async findAll(companyId: string): Promise<OrderItemResponse[]> {
    // Since we removed the @ManyToOne relationships, we need to use a different approach
    // We'll get all order items and filter by company access in the resolver
    const orderItems = await this.orderItemRepository.find({
      order: { createdAt: 'DESC' },
    });

    return orderItems.map(
      (orderItem) => transformEntity(orderItem) as OrderItemResponse,
    );
  }

  // Find order item by ID with company access validation
  async findOne(id: string, companyId: string): Promise<OrderItemResponse> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id },
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    // Note: Company access validation will be handled at the resolver level
    // by checking the order's companyId through the field resolver

    return transformEntity(orderItem) as OrderItemResponse;
  }

  // Find order item by ID (for internal use)
  async findById(id: string): Promise<OrderItemEntity> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id },
    });
    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }
    return orderItem;
  }

  // Create new order item
  async create(data: CreateOrderItemData): Promise<OrderItemResponse> {
    // Check if this product is already in the order
    const existingOrderItem = await this.orderItemRepository.findOne({
      where: {
        orderId: data.orderId,
        productId: data.productId,
      },
    });

    if (existingOrderItem) {
      throw new BadRequestException(
        'This product is already added to the order. Use updateOrderItem to modify quantity.',
      );
    }

    const product = await this.productService.findById(data.productId);
    const order = await this.orderService.findById(data.orderId);
    const warehouse = await this.warehouseService.findById(order.warehouseId);

    // Validate product-warehouse type compatibility
    if (warehouse.type) {
      validateProductWarehouseCompatibility(product.type, warehouse.type);
    }

    // Create order item
    const orderItem = this.orderItemRepository.create({
      orderId: data.orderId,
      productId: data.productId,
      quantity: data.quantity,
      price: data.price,
      modifiedBy: data.modifiedBy,
    });

    const savedOrderItem = await this.orderItemRepository.save(orderItem);
    return transformEntity(savedOrderItem) as OrderItemResponse;
  }

  // Update order item with company access validation
  async update(
    id: string,
    data: UpdateOrderItemData,
    companyId: string,
  ): Promise<OrderItemResponse> {
    // Check if order item exists and has access
    await this.findOne(id, companyId);

    // Update order item (removed duplicate product validation for now)
    await this.orderItemRepository.update(
      { id },
      {
        ...(data.orderId && { orderId: data.orderId }),
        ...(data.productId && { productId: data.productId }),
        ...(data.quantity && { quantity: data.quantity }),
        ...(data.price && { price: data.price }),
        ...(data.modifiedBy && { modifiedBy: data.modifiedBy }),
      },
    );

    return this.findOne(id, companyId);
  }

  // Delete order item with company access validation
  async remove(
    id: string,
    companyId: string,
    userRole: UserRole,
  ): Promise<void> {
    await this.findOne(id, companyId);
    await deleteEntityByRole(
      this.orderItemRepository,
      { id },
      userRole,
      'OrderItem',
    );
  }

  // Find order items by order ID (for field resolver)
  async findOrderItemsByOrderId(orderId: string): Promise<OrderItemEntity[]> {
    return this.orderItemRepository.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });
  }

  // Find order items by product ID (for field resolver)
  async findOrderItemsByProductId(
    productId: string,
  ): Promise<OrderItemEntity[]> {
    return this.orderItemRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }
}
