import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from './company.entity';
import { CompanyResolver } from './company.resolver';
import { CompanyService } from './company.service';
import { UserEntity } from '../user/user.entity';
import { ProductEntity } from '../product/product.entity';
import { OrderEntity } from '../order/order.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { InvoiceEntity } from '../invoice/invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyEntity,
      UserEntity,
      ProductEntity,
      OrderEntity,
      CustomerEntity,
      InvoiceEntity,
    ]),
  ],
  providers: [CompanyResolver, CompanyService],
  exports: [TypeOrmModule, CompanyService],
})
export class CompanyModule {}
