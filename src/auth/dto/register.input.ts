import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { UserRole } from '../../common/types';

@InputType({ description: 'Input for user registration' })
export class RegisterInput {
  @Field(() => String, { description: 'User email address' })
  @IsEmail()
  email: string;

  @Field(() => String, { description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;

  @Field(() => String, { description: 'User full name' })
  @IsString()
  name: string;

  @Field(() => String, { description: 'Company name' })
  @IsString()
  companyName: string;

  @Field(() => UserRole, {
    description: 'User role',
    defaultValue: UserRole.VIEWER,
  })
  @IsOptional()
  role?: UserRole = UserRole.VIEWER;
}
