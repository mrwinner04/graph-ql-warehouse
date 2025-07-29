import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { CurrentUser } from '../decorator/current-user.decorator';
import { UserRole } from '../common/types';
import { AuthenticatedUser } from '../common/graphql-context';
import { ProductEntity, ProductType } from './product.entity';
import { ProductService } from './product.service';
import { ProductResponse } from './dto/product.response';

@Resolver(() => ProductEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  // Query to get all products in the company
  @Query(() => [ProductResponse], {
    description: 'Get all products in the same company',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async products(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProductResponse[]> {
    return await this.productService.findAll(user.companyId);
  }

  // Query to get a specific product by ID
  @Query(() => ProductResponse, { description: 'Get a product by ID' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  async product(
    @Args('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProductResponse> {
    return await this.productService.findOne(id, currentUser.companyId);
  }

  // Mutation to create a new product
  @Mutation(() => ProductResponse, {
    description: 'Create a new product in the company',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async createProduct(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('name') name: string,
    @Args('price') price: string,
    @Args('type') type: ProductType,
    @Args('code', { nullable: true }) code?: string,
  ): Promise<ProductResponse> {
    return await this.productService.create({
      name,
      code,
      price,
      type,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    });
  }

  // Mutation to update product
  @Mutation(() => ProductResponse, {
    description: 'Update product information',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  async updateProduct(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('id') id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('code', { nullable: true }) code?: string,
    @Args('price', { nullable: true }) price?: string,
    @Args('type', { nullable: true }) type?: ProductType,
  ): Promise<ProductResponse> {
    return await this.productService.update(
      id,
      {
        name,
        code,
        price,
        type,
        modifiedBy: currentUser.id,
      },
      currentUser.companyId,
    );
  }

  // Mutation to delete product
  @Mutation(() => Boolean, {
    description: 'Delete a product (OWNER: hard delete, OPERATOR: soft delete)',
  })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
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
