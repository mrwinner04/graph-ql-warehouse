import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from '../../common/types';

@InputType({ description: 'Input type for creating a user' })
export class CreateUserInput {
  @Field(() => String, { description: 'User email' })
  email: string;

  @Field(() => String, { description: 'User password' })
  password: string;

  @Field(() => String, { description: 'User full name' })
  name: string;

  @Field(() => UserRole, { description: 'User role' })
  role: UserRole;
}
