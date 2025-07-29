import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './order.entity';
// import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { OrderItemEntity } from '../order-item/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity])],
  providers: [/* OrderResolver, */ OrderService],
  exports: [TypeOrmModule, OrderService],
})
export class OrderModule {}
