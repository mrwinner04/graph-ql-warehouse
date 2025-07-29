import { ObjectType, Field } from '@nestjs/graphql';
import { UserRole } from '../../common/types';

@ObjectType({ description: 'Authentication response' })
export class AuthResponse {
  @Field(() => String, { description: 'JWT access token' })
  accessToken: string;

  @Field(() => String, { description: 'User ID' })
  userId: string;

  @Field(() => String, { description: 'User email' })
  email: string;

  @Field(() => String, { description: 'User name' })
  name: string;

  @Field(() => UserRole, { description: 'User role' })
  role: UserRole;

  @Field(() => String, { description: 'Company ID' })
  companyId: string;
}
