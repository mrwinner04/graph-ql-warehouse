import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Order item entity representing items in orders' })
@Entity('order_items')
export class OrderItemEntity {
  @Field(() => ID, { description: 'Unique identifier for the order item' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Order ID this item belongs to' })
  @Column({ type: 'uuid', name: 'order_id', nullable: false })
  orderId: string;

  @Field(() => String, { description: 'Product ID for this item' })
  @Column({ type: 'uuid', name: 'product_id', nullable: false })
  productId: string;

  @Field(() => Number, { description: 'Quantity of the product' })
  @Column({
    type: 'int',
    nullable: false,
    default: 1,
  })
  quantity: number;

  @Field(() => String, { description: 'Unit price for this item' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: '0.0',
  })
  unitPrice: string;

  @Field(() => String, { description: 'Total price for this item' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: '0.0',
  })
  totalPrice: string;

  @Field(() => Date, { description: 'When the order item was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Field(() => Date, { description: 'When the order item was last updated' })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
