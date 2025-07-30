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
});

@ObjectType()
@Entity('orders')
export class OrderEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'uuid', name: 'company_id', nullable: false })
  companyId: string;

  @Field(() => String)
  @Column({ type: 'varchar', nullable: false })
  number: string;

  @Field(() => OrderType)
  @Column({
    type: 'enum',
    enum: OrderType,
    name: 'type',
    nullable: false,
  })
  type: OrderType;

  @Field(() => String)
  @Column({ type: 'uuid', name: 'customer_id', nullable: false })
  customerId: string;

  @Field(() => String)
  @Column({ type: 'uuid', name: 'warehouse_id', nullable: false })
  warehouseId: string;

  @Field(() => Date)
  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  date: Date;

  @Field(() => Date)
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Field(() => Date)
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
    nullable: true,
  })
  @Column({ type: 'uuid', name: 'modified_by', nullable: true })
  modifiedBy?: string;
}
