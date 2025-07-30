import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum OrderType {
  SALES = 'sales',
  PURCHASE = 'purchase',
  TRANSFER = 'transfer',
}

registerEnumType(OrderType, {
  name: 'OrderType',
  description: 'Order types in the system',
});

@ObjectType({ description: 'Order entity representing customer orders' })
@Entity('orders')
export class OrderEntity {
  @Field(() => ID, { description: 'Unique identifier for the order' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Company ID the order belongs to' })
  @Column({ type: 'uuid', name: 'company_id', nullable: false })
  companyId: string;

  @Field(() => String, { description: 'Order number' })
  @Column({ type: 'varchar', nullable: false })
  number: string;

  @Field(() => OrderType, { description: 'Order type' })
  @Column({
    type: 'enum',
    enum: OrderType,
    name: 'type',
    nullable: false,
  })
  type: OrderType;

  @Field(() => String, { description: 'Customer ID' })
  @Column({ type: 'uuid', name: 'customer_id', nullable: false })
  customerId: string;

  @Field(() => String, { description: 'Warehouse ID' })
  @Column({ type: 'uuid', name: 'warehouse_id', nullable: false })
  warehouseId: string;

  @Field(() => Date, { description: 'Order date' })
  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;

  @Field(() => Date, { description: 'When the order was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Field(() => Date, { description: 'When the order was last updated' })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Field(() => String, {
    description: 'ID of user who last modified the order',
    nullable: true,
  })
  @Column({ type: 'uuid', name: 'modified_by', nullable: true })
  modifiedBy?: string;
}
