import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity } from './invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntity])],
  providers: [],
  exports: [TypeOrmModule],
})
export class InvoiceModule {}
