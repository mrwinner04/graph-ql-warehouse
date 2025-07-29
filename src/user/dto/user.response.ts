import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserRole } from '../../common/types';

@ObjectType({ description: 'User response without password' })
export class UserResponse {
  @Field(() => ID, { description: 'Unique identifier for the user' })
  id: string;

  @Field(() => String, { description: 'Company ID the user belongs to' })
  companyId: string;

  @Field(() => String, { description: 'User email address' })
  email: string;

  @Field(() => String, { description: 'User full name' })
  name: string;

  @Field(() => UserRole, { description: 'User role in the system' })
  role: UserRole;

  @Field(() => Date, {
    description: 'When the user was created',
    nullable: true,
  })
  createdAt?: Date;

  @Field(() => Date, {
    description: 'When the user was last updated',
    nullable: true,
  })
  updatedAt?: Date;

  @Field(() => Date, {
    description: 'When the user was deleted',
    nullable: true,
  })
  deletedAt?: Date;
}
