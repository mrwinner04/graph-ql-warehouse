import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { OrderItemModule } from '../order-item/order-item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    forwardRef(() => OrderItemModule),
  ],
  providers: [ProductResolver, ProductService],
  exports: [TypeOrmModule, ProductService],
})
export class ProductModule {}
