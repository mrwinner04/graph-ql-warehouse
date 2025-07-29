import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType({ description: 'Login response containing only the access token' })
export class LoginResponse {
  @Field(() => String, { description: 'JWT access token' })
  accessToken: string;
}
