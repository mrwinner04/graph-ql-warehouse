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
import { ProductService } from './product.service';
import { OrderItemService } from '../order-item/order-item.service';
import { OrderItemResponse } from '../order-item/order-item.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductResponse,
  CreateProductInput,
  UpdateProductInput,
  BestSellingProductsReport,
  BestSellingProductsInput,
  BestSellingProductsSchema,
} from './product.types';

@Resolver(() => ProductResponse)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly orderItemService: OrderItemService,
  ) {}

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
  async createProduct(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input', new ZodValidationPipe(CreateProductSchema))
    input: CreateProductInput,
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
  async updateProduct(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(UpdateProductSchema))
    input: UpdateProductInput,
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

  // Query to get best selling products report
  @Query(() => BestSellingProductsReport, {
    description: 'Get best selling products report',
  })
  @AllRoles()
  async bestSellingProducts(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Args('input', new ZodValidationPipe(BestSellingProductsSchema))
    input: BestSellingProductsInput,
  ): Promise<BestSellingProductsReport> {
    return await this.productService.getBestSellingProducts(
      currentUser.companyId,
      input,
    );
  }

  @ResolveField(() => [OrderItemResponse])
  async orderItems(
    @Parent() product: ProductResponse,
  ): Promise<OrderItemResponse[]> {
    return await this.orderItemService.findOrderItemsByProductId(product.id);
  }
}
