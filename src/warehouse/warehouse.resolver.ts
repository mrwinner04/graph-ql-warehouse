import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { OwnerAndOperator, AllRoles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { AuthenticatedUser } from '../common/graphql-context';
import { WarehouseEntity } from './warehouse.entity';
import { WarehouseService } from './warehouse.service';
import {
  WarehouseResponse,
  CreateWarehouseInput,
  UpdateWarehouseInput,
  ProductWithHighestStock,
  AvailableStockReport,
} from './warehouse.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  CreateWarehouseSchema,
  UpdateWarehouseSchema,
} from './warehouse.types';

@Resolver(() => WarehouseResponse)
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
  async createWarehouse(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input', new ZodValidationPipe(CreateWarehouseSchema))
    input: CreateWarehouseInput,
  ): Promise<WarehouseResponse> {
    return await this.warehouseService.create({
      ...input,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });
  }

  @Mutation(() => WarehouseResponse)
  @OwnerAndOperator()
  async updateWarehouse(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(UpdateWarehouseSchema))
    input: UpdateWarehouseInput,
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

  // Query to get product with highest stock per warehouse
  @Query(() => [ProductWithHighestStock], {
    description: 'Get product with highest stock per warehouse',
  })
  @AllRoles()
  async productWithHighestStockPerWarehouse(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProductWithHighestStock[]> {
    return await this.warehouseService.getProductWithHighestStockPerWarehouse(
      currentUser.companyId,
    );
  }

  // Query to get available stock per warehouse
  @Query(() => [AvailableStockReport], {
    description: 'Get available stock per warehouse',
  })
  @AllRoles()
  async availableStock(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('warehouseId', { nullable: true }) warehouseId?: string,
  ): Promise<AvailableStockReport[]> {
    return await this.warehouseService.getAvailableStock(
      currentUser.companyId,
      warehouseId,
    );
  }

  @ResolveField(() => [AvailableStockReport])
  async availableProducts(
    @Parent() warehouse: WarehouseResponse,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AvailableStockReport[]> {
    return await this.warehouseService.getAvailableStock(
      currentUser.companyId,
      warehouse.id,
    );
  }

  // //@ResolveField(() => OrderEntity)
  //   async order(@Parent() invoice: InvoiceEntity) {
  //     return await this.orderService.findById(invoice.orderId);
  //   }
}
