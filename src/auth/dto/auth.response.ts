import { ObjectType, Field } from '@nestjs/graphql';
import { UserRole } from '../../common/types';

@ObjectType()
export class AuthResponse {
  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => String)
  companyId: string;
}
