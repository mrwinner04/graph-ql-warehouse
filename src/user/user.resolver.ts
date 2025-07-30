import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, UsePipes, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {
  Roles,
  OwnerOnly,
  OwnerAndOperator,
  AllRoles,
} from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { UserRole } from '../common/types';
import { AuthenticatedUser } from '../common/graphql-context';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UserResponse } from './dto/user.response';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateUserSchema, UpdateUserSchema } from './user.types';

@Resolver(() => UserEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserResponse])
  @OwnerAndOperator()
  async users(@CurrentUser() user: AuthenticatedUser): Promise<UserResponse[]> {
    return await this.userService.findAll(user.companyId);
  }

  @Query(() => UserResponse)
  @AllRoles()
  async user(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponse> {
    return await this.userService.findOne(id, currentUser.companyId);
  }

  @Mutation(() => UserResponse)
  @OwnerOnly()
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async createUser(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: CreateUserInput,
  ): Promise<UserResponse> {
    return await this.userService.create({
      ...input,
      companyId: currentUser.companyId,
    });
  }

  @Mutation(() => UserResponse)
  @OwnerAndOperator()
  @UsePipes(new ZodValidationPipe(UpdateUserSchema))
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponse> {
    if (
      (input.role && currentUser.role !== UserRole.OWNER) ||
      UserRole.OPERATOR
    ) {
      throw new UnauthorizedException('Only owners can change user roles');
    }

    return await this.userService.update(id, input, currentUser.companyId);
  }

  @Mutation(() => Boolean)
  @OwnerAndOperator()
  async deleteUser(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<boolean> {
    const user = await this.userService.findById(id);

    if (user.id === currentUser.id) {
      throw new UnauthorizedException('Cannot delete your own account');
    }

    await this.userService.remove(id, currentUser.companyId, currentUser.role);
    return true;
  }
}
