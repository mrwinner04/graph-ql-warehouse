import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderItemEntity } from './order-item.entity';
import { OrderItemService } from './order-item.service';
import { OrderItemResolver } from './order-item.resolver';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItemEntity]),
    forwardRef(() => OrderModule),
    forwardRef(() => ProductModule),
    WarehouseModule,
  ],
  providers: [OrderItemService, OrderItemResolver],
  exports: [OrderItemService],
})
export class OrderItemModule {}
