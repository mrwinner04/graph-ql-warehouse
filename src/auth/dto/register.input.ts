import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { UserRole } from '../../common/types';

@InputType()
export class RegisterInput {
  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsString()
  @MinLength(6)
  password: string;

  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  companyName: string;

  @Field(() => UserRole, {
    defaultValue: UserRole.VIEWER,
  })
  @IsOptional()
  role?: UserRole = UserRole.VIEWER;
}
