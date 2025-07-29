import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from './customer.entity';
import { CustomerResolver } from './customer.resolver';
import { CustomerService } from './customer.service';
import { OrderEntity } from '../order/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity, OrderEntity])],
  providers: [CustomerResolver, CustomerService],
  exports: [TypeOrmModule, CustomerService],
})
export class CustomerModule {}
