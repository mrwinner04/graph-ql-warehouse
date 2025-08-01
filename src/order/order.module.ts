import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from './order.entity';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { CustomerModule } from '../customer/customer.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { OrderItemModule } from '../order-item/order-item.module';
import { ProductModule } from '../product/product.module';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    CustomerModule,
    WarehouseModule,
    forwardRef(() => ProductModule),
    forwardRef(() => OrderItemModule),
    forwardRef(() => InvoiceModule),
  ],
  providers: [OrderService, OrderResolver],
  exports: [OrderService],
})
export class OrderModule {}
