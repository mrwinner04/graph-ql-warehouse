import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Warehouse entity representing storage addresses' })
@Entity('warehouses')
export class WarehouseEntity {
  @Field(() => ID, { description: 'Unique identifier for the warehouse' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Company ID the warehouse belongs to' })
  @Column({ type: 'uuid', name: 'company_id', nullable: false })
  companyId: string;

  @Field(() => String, { description: 'Warehouse name' })
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Field(() => String, { description: 'Warehouse address', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  address?: string;

  @Field(() => String, {
    description: 'Warehouse type (solid/liquid)',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true })
  type?: string;

  @Field(() => Date, { description: 'When the warehouse was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Field(() => Date, { description: 'When the warehouse was last updated' })
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
