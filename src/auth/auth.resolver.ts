import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UsePipes } from '@nestjs/common';
import { Public } from '../decorator/public.decorator';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { LoginResponse } from './dto/login.response';
import { RegisterResponse } from './dto/register.response';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { LoginSchema, RegisterSchema } from '../user/user.types';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => LoginResponse)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
    return this.authService.login(input);
  }

  @Public()
  @Mutation(() => RegisterResponse)
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(
    @Args('input') input: RegisterInput,
  ): Promise<RegisterResponse> {
    return this.authService.register(input);
  }
}
