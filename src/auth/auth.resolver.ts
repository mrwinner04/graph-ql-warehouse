import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UsePipes } from '@nestjs/common';
import { Public } from '../decorator/public.decorator';
import { AuthService } from './auth.service';
import {
  LoginInput,
  RegisterInput,
  ChangePasswordInput,
  LoginResponse,
  RegisterResponse,
  ChangePasswordResponse,
} from './auth.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { LoginSchema, RegisterSchema } from './auth.types';
import { CurrentUser } from '../decorator/current-user.decorator';
import { AuthenticatedUser } from '../common/graphql-context';

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

  @Mutation(() => ChangePasswordResponse)
  async changePassword(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: ChangePasswordInput,
  ): Promise<ChangePasswordResponse> {
    return this.authService.changePassword(currentUser.id, input);
  }
}
