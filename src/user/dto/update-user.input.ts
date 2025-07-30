import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from '../../common/types';

@InputType({ description: 'Input type for updating a user' })
export class UpdateUserInput {
  @Field(() => String, { description: 'User email', nullable: true })
  email?: string;

  @Field(() => String, { description: 'User password', nullable: true })
  password?: string;

  @Field(() => String, { description: 'User full name', nullable: true })
  name?: string;

  @Field(() => UserRole, { description: 'User role', nullable: true })
  role?: UserRole;
}
