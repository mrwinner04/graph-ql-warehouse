import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from './order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItemEntity])],
  providers: [],
  exports: [TypeOrmModule],
})
export class OrderItemModule {}
