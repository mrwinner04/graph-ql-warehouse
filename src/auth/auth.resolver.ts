import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Public } from '../decorator/public.decorator';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { LoginResponse } from './dto/login.response';
import { RegisterResponse } from './dto/register.response';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => LoginResponse, {
    description: 'Login with email and password',
  })
  async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
    return this.authService.login(input);
  }

  @Public()
  @Mutation(() => RegisterResponse, { description: 'Register a new user' })
  async register(
    @Args('input') input: RegisterInput,
  ): Promise<RegisterResponse> {
    return this.authService.register(input);
  }
}
