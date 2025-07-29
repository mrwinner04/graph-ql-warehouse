import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { UserRole } from '../common/types';
import { AuthenticatedUser } from '../common/graphql-context';
import { WarehouseEntity } from './warehouse.entity';
import { WarehouseService } from './warehouse.service';
import { WarehouseResponse } from './dto/warehouse.response';

@Resolver(() => WarehouseEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehouseResolver {
  constructor(private readonly warehouseService: WarehouseService) {}

  // Query to get all warehouses in the company
  @Query(() => [WarehouseResponse], {
    description: 'Get all warehouses in the same company',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async warehouses(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WarehouseResponse[]> {
    return await this.warehouseService.findAll(user.companyId);
  }

  // Query to get a specific warehouse by ID
  @Query(() => WarehouseResponse, { description: 'Get a warehouse by ID' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async warehouse(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<WarehouseResponse> {
    return await this.warehouseService.findOne(id, currentUser.companyId);
  }

  // Mutation to create a new warehouse
  @Mutation(() => WarehouseResponse, {
    description: 'Create a new warehouse in the company',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async createWarehouse(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('name') name: string,
    @Args('address', { nullable: true }) address?: string,
    @Args('type', { nullable: true }) type?: string,
  ): Promise<WarehouseResponse> {
    return await this.warehouseService.create({
      name,
      address,
      type,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });
  }

  // Mutation to update warehouse
  @Mutation(() => WarehouseResponse, {
    description: 'Update warehouse information',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async updateWarehouse(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('id') id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('address', { nullable: true }) address?: string,
    @Args('type', { nullable: true }) type?: string,
  ): Promise<WarehouseResponse> {
    return await this.warehouseService.update(
      id,
      {
        name,
        address,
        type,
        modifiedBy: currentUser.id,
      },
      currentUser.companyId,
    );
  }

  // Mutation to delete warehouse
  @Mutation(() => Boolean, {
    description:
      'Delete a warehouse (OWNER: hard delete, OPERATOR: soft delete)',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
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
