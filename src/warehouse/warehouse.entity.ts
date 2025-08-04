import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { registerEnumType } from '@nestjs/graphql';

export enum WarehouseType {
  SOLID = 'solid',
  LIQUID = 'liquid',
}

registerEnumType(WarehouseType, {
  name: 'WarehouseType',
  description: 'Warehouse types in the system',
});

@Entity('warehouses')
export class WarehouseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id', nullable: false })
  companyId: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  address?: string;

  @Column({
    type: 'enum',
    enum: WarehouseType,
    nullable: true,
  })
  type?: WarehouseType;

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
