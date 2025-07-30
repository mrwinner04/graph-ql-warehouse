import { ObjectType, Field } from '@nestjs/graphql';
import { UserEntity } from '../../user/user.entity';

@ObjectType()
export class RegisterResponse {
  @Field(() => UserEntity)
  user: UserEntity;
}
