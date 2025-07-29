import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '../common/types';

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User roles in the system',
});

@ObjectType({ description: 'User entity representing system users' })
@Entity('users')
export class UserEntity {
  @Field(() => ID, { description: 'Unique identifier for the user' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Company ID the user belongs to' })
  @Column({ type: 'uuid', name: 'company_id', nullable: false })
  companyId: string;

  @Field(() => String, { description: 'User email address' })
  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Field(() => String, { description: 'User full name' })
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Field(() => UserRole, { description: 'User role in the system' })
  @Column({ type: 'varchar', nullable: false, default: UserRole.VIEWER })
  role: UserRole;

  @Field(() => Date, { description: 'When the user was created' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;

  @Field(() => Date, { description: 'When the user was last updated' })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
