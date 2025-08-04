import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { registerEnumType } from '@nestjs/graphql';

export enum OrderType {
  SALES = 'sales',
  PURCHASE = 'purchase',
  TRANSFER = 'transfer',
}

registerEnumType(OrderType, {
  name: 'OrderType',
});

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id', nullable: false })
  companyId: string;

  @Column({ type: 'varchar', nullable: false })
  number: string;

  @Column({
    type: 'enum',
    enum: OrderType,
    name: 'type',
    nullable: false,
  })
  type: OrderType;

  @Column({ type: 'uuid', name: 'customer_id', nullable: false })
  customerId: string;

  @Column({ type: 'uuid', name: 'warehouse_id', nullable: false })
  warehouseId: string;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'uuid', name: 'modified_by', nullable: true })
  modifiedBy?: string;
}
