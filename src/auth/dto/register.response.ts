import { ObjectType, Field } from '@nestjs/graphql';
import { UserEntity } from '../../user/user.entity';

@ObjectType({ description: 'Register response containing the created user' })
export class RegisterResponse {
  @Field(() => UserEntity, { description: 'The created user' })
  user: UserEntity;
}
