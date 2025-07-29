import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType({ description: 'Input for user login' })
export class LoginInput {
  @Field(() => String, { description: 'User email address' })
  @IsEmail()
  email: string;

  @Field(() => String, { description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;
}
