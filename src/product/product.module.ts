import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  providers: [ProductResolver, ProductService],
  exports: [TypeOrmModule, ProductService],
})
export class ProductModule {}
