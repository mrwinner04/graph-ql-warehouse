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
import { ProductEntity } from './product.entity';
import { ProductService } from './product.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductResponse,
  CreateProductInput,
  UpdateProductInput,
} from './product.types';

@Resolver(() => ProductEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  // Query to get all products in the company
  @Query(() => [ProductResponse])
  @AllRoles()
  async products(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProductResponse[]> {
    return await this.productService.findAll(user.companyId);
  }

  // Query to get a specific product by ID
  @Query(() => ProductResponse)
  @AllRoles()
  async product(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProductResponse> {
    return await this.productService.findOne(id, currentUser.companyId);
  }

  // Mutation to create a new product
  @Mutation(() => ProductResponse)
  @OwnerAndOperator()
  @UsePipes(new ZodValidationPipe(CreateProductSchema))
  async createProduct(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input') input: CreateProductInput,
  ): Promise<ProductResponse> {
    return await this.productService.create({
      ...input,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });
  }

  // Mutation to update product
  @Mutation(() => ProductResponse)
  @OwnerAndOperator()
  @UsePipes(new ZodValidationPipe(UpdateProductSchema))
  async updateProduct(
    @Args('id') id: string,
    @Args('input') input: UpdateProductInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProductResponse> {
    return await this.productService.update(
      id,
      {
        ...input,
        modifiedBy: currentUser.id,
      },
      currentUser.companyId,
    );
  }

  // Mutation to delete product
  @Mutation(() => Boolean)
  @OwnerAndOperator()
  async deleteProduct(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<boolean> {
    await this.productService.remove(
      id,
      currentUser.companyId,
      currentUser.role,
    );
    return true;
  }
}
