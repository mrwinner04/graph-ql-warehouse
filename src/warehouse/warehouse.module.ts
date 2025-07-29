import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseEntity } from './warehouse.entity';
import { WarehouseResolver } from './warehouse.resolver';
import { WarehouseService } from './warehouse.service';

@Module({
  imports: [TypeOrmModule.forFeature([WarehouseEntity])],
  providers: [WarehouseResolver, WarehouseService],
  exports: [TypeOrmModule, WarehouseService],
})
export class WarehouseModule {}
