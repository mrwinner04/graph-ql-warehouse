import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum ProductType {
  SOLID = 'solid',
  LIQUID = 'liquid',
}

registerEnumType(ProductType, {
  name: 'ProductType',
  description: 'Product types in the system',
});

@ObjectType({ description: 'Product entity representing inventory items' })
@Entity('products')
export class ProductEntity {
  @Field(() => ID, { description: 'Unique identifier for the product' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Company ID the product belongs to' })
  @Column({ type: 'uuid', name: 'company_id', nullable: false })
  companyId: string;

  @Field(() => String, { description: 'Product name' })
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Field(() => String, { description: 'Product code', nullable: true })
  @Column({ type: 'varchar', nullable: true, unique: true })
  code?: string;

  @Field(() => String, { description: 'Product price' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: '0.0',
  })
  price: string;

  @Field(() => ProductType, { description: 'Product type' })
  @Column({
    type: 'enum',
    enum: ProductType,
    name: 'type',
    nullable: false,
  })
  type: ProductType;

  @Field(() => Date, { description: 'When the product was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Field(() => Date, { description: 'When the product was last updated' })
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
