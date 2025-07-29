import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { UserRole } from '../common/types';
import { AuthenticatedUser } from '../common/graphql-context';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UserResponse } from './dto/user.response';

function toUserRole(role: unknown): UserRole | undefined {
  if (
    typeof role === 'string' &&
    (role === 'OWNER' || role === 'OPERATOR' || role === 'VIEWER')
  ) {
    return UserRole[role as keyof typeof UserRole];
  }
  return undefined;
}

@Resolver(() => UserEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserResponse], {
    description: 'Get all users in the same company',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async users(@CurrentUser() user: AuthenticatedUser): Promise<UserResponse[]> {
    return await this.userService.findAll(user.companyId);
  }

  @Query(() => UserResponse, { description: 'Get a user by ID' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async user(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponse> {
    return await this.userService.findOne(id, currentUser.companyId);
  }

  @Mutation(() => UserResponse, {
    description: 'Create a new user in the company',
  })
  @Roles(UserRole.OWNER)
  async createUser(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('name') name: string,
    @Args('role') role: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponse> {
    const userRole = toUserRole(role);
    if (!userRole) {
      throw new BadRequestException(
        'Invalid role. Must be OWNER, OPERATOR, or VIEWER',
      );
    }

    return await this.userService.create({
      email,
      password,
      name,
      role: userRole,
      companyId: currentUser.companyId,
    });
  }

  @Mutation(() => UserResponse, { description: 'Update user information' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async updateUser(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('email', { nullable: true }) email?: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('role', { nullable: true }) role?: string,
    @Args('password', { nullable: true }) password?: string,
  ): Promise<UserResponse> {
    const userRole = role ? toUserRole(role) : undefined;
    if (role && !userRole) {
      throw new BadRequestException(
        'Invalid role. Must be OWNER, OPERATOR, or VIEWER',
      );
    }

    if (role && currentUser.role !== UserRole.OWNER) {
      throw new UnauthorizedException('Only owners can change user roles');
    }

    return await this.userService.update(
      id,
      {
        email,
        name,
        role: userRole,
        password,
      },
      currentUser.companyId,
    );
  }

  @Mutation(() => Boolean, {
    description: 'Delete a user (OWNER: hard delete, OPERATOR: soft delete)',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
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
