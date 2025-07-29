import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Company entity representing tenant companies' })
@Entity('companies')
export class CompanyEntity {
  @Field(() => ID, { description: 'Unique identifier for the company' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Company name' })
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Field(() => Date, { description: 'When the company was created' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Field(() => Date, { description: 'When the company was last updated' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'uuid', name: 'modified_by', nullable: true })
  modifiedBy?: string;
}
