import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {
  Roles,
  OwnerAndOperator,
  AllRoles,
} from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { UserRole } from '../common/types';
import { AuthenticatedUser } from '../common/graphql-context';
import { WarehouseEntity } from './warehouse.entity';
import { WarehouseService } from './warehouse.service';
import {
  WarehouseResponse,
  CreateWarehouseInput,
  UpdateWarehouseInput,
} from './warehouse.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  CreateWarehouseSchema,
  UpdateWarehouseSchema,
} from './warehouse.types';

@Resolver(() => WarehouseEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehouseResolver {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Query(() => [WarehouseResponse])
  @AllRoles()
  async warehouses(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WarehouseResponse[]> {
    return await this.warehouseService.findAll(user.companyId);
  }

  @Query(() => WarehouseResponse)
  @AllRoles()
  async warehouse(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<WarehouseResponse> {
    return await this.warehouseService.findOne(id, currentUser.companyId);
  }

  @Mutation(() => WarehouseResponse)
  @OwnerAndOperator()
  @UsePipes(new ZodValidationPipe(CreateWarehouseSchema))
  async createWarehouse(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: CreateWarehouseInput,
  ): Promise<WarehouseResponse> {
    return await this.warehouseService.create({
      ...input,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });
  }

  @Mutation(() => WarehouseResponse)
  @OwnerAndOperator()
  @UsePipes(new ZodValidationPipe(UpdateWarehouseSchema))
  async updateWarehouse(
    @Args('id') id: string,
    @Args('input') input: UpdateWarehouseInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<WarehouseResponse> {
    return await this.warehouseService.update(
      id,
      {
        ...input,
        modifiedBy: currentUser.id,
      },
      currentUser.companyId,
    );
  }

  @Mutation(() => Boolean)
  @OwnerAndOperator()
  async deleteWarehouse(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<boolean> {
    await this.warehouseService.remove(
      id,
      currentUser.companyId,
      currentUser.role,
    );
    return true;
  }
}
