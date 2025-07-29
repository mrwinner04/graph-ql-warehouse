import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Invoice entity representing billing documents' })
@Entity('invoices')
export class InvoiceEntity {
  @Field(() => ID, { description: 'Unique identifier for the invoice' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Company ID the invoice belongs to' })
  @Column({ type: 'uuid', name: 'company_id', nullable: false })
  companyId: string;

  @Field(() => String, { description: 'Invoice number' })
  @Column({ type: 'varchar', nullable: false })
  number: string;

  @Field(() => String, { description: 'Order ID this invoice is for' })
  @Column({ type: 'uuid', name: 'order_id', nullable: false })
  orderId: string;

  @Field(() => String, { description: 'Total amount of the invoice' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: '0.0',
  })
  totalAmount: string;

  @Field(() => String, { description: 'Tax amount', nullable: true })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: '0.0',
  })
  taxAmount?: string;

  @Field(() => String, { description: 'Discount amount', nullable: true })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: '0.0',
  })
  discountAmount?: string;

  @Field(() => String, { description: 'Invoice status' })
  @Column({
    type: 'enum',
    enum: ['draft', 'sent', 'paid', 'cancelled'],
    nullable: false,
    default: 'draft',
  })
  status: string;

  @Field(() => Date, { description: 'Invoice date' })
  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  date?: Date;

  @Field(() => Date, { description: 'Due date', nullable: true })
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dueDate?: Date;

  @Field(() => Date, { description: 'When the invoice was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Field(() => Date, { description: 'When the invoice was last updated' })
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
