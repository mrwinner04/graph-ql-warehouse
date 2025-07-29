import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Customer entity representing company customers' })
@Entity('customers')
export class CustomerEntity {
  @Field(() => ID, { description: 'Unique identifier for the customer' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Company ID the customer belongs to' })
  @Column({ type: 'uuid', name: 'company_id', nullable: false })
  companyId: string;

  @Field(() => String, { description: 'Customer name' })
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Field(() => String, {
    description: 'Customer email address',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Field(() => String, {
    description: 'Customer type (customer/supplier)',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true })
  type?: string;

  @Field(() => Date, { description: 'When the customer was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Field(() => Date, { description: 'When the customer was last updated' })
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
