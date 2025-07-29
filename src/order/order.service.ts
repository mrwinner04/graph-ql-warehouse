import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './order.entity';
import { OrderItemEntity } from '../order-item/order-item.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

  async findOrderItemsByOrderId(orderId: string): Promise<OrderItemEntity[]> {
    return this.orderItemRepository.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });
  }
}
