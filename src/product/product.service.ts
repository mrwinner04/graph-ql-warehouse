import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity, ProductType } from './product.entity';
import { ProductResponse } from './product.types';
import { validateCompanyAccess } from '../common/company-access.utils';
import { transformEntity } from '../common/entity-transformers';
import {
  validateFieldNotExistsInCompany,
  deleteEntityByRole,
} from '../common/common.utils';
import { UserRole } from '../common/types';

interface CreateProductData {
  name: string;
  code?: string;
  price: string;
  type: ProductType;
  companyId: string;
  modifiedBy?: string;
}

interface UpdateProductData {
  name?: string;
  code?: string;
  price?: string;
  type?: ProductType;
  modifiedBy?: string;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async findAll(companyId: string): Promise<ProductResponse[]> {
    const products = await this.productRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
    return products.map(
      (product) => transformEntity(product) as ProductResponse,
    );
  }

  // Find product by ID with company access validation
  async findOne(id: string, companyId: string): Promise<ProductResponse> {
    const product = await validateCompanyAccess(
      () =>
        this.productRepository.findOne({
          where: { id },
        }),
      companyId,
      'Product',
    );

    return transformEntity(product) as ProductResponse;
  }

  // Find product by ID (for internal use)
  async findById(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async create(data: CreateProductData): Promise<ProductResponse> {
    // Check if product with name already exists in the same company
    await validateFieldNotExistsInCompany(
      this.productRepository,
      'name',
      data.name,
      data.companyId,
      'Product',
      undefined,
      (value) => value.trim(),
    );

    // Check if product with code already exists in the same company (if code is provided)
    if (data.code) {
      await validateFieldNotExistsInCompany(
        this.productRepository,
        'code',
        data.code,
        data.companyId,
        'Product',
        undefined,
        (value) => value.trim(),
      );
    }

    // Create product
    const product = this.productRepository.create({
      name: data.name.trim(),
      code: data.code?.trim(),
      price: data.price,
      type: data.type,
      companyId: data.companyId,
      modifiedBy: data.modifiedBy,
    });

    const savedProduct = await this.productRepository.save(product);
    return transformEntity(savedProduct) as ProductResponse;
  }

  // Update product with company access validation
  async update(
    id: string,
    data: UpdateProductData,
    companyId: string,
  ): Promise<ProductResponse> {
    // Check if product exists and has access
    await this.findOne(id, companyId);

    // Check if name is being changed and if it already exists
    if (data.name) {
      await validateFieldNotExistsInCompany(
        this.productRepository,
        'name',
        data.name,
        companyId,
        'Product',
        id,
        (value) => value.trim(),
      );
    }

    // Check if code is being changed and if it already exists
    if (data.code) {
      await validateFieldNotExistsInCompany(
        this.productRepository,
        'code',
        data.code,
        companyId,
        'Product',
        id,
        (value) => value.trim(),
      );
    }

    // Update product
    await this.productRepository.update(
      { id, companyId },
      {
        ...(data.name && { name: data.name.trim() }),
        ...(data.code && { code: data.code.trim() }),
        ...(data.price && { price: data.price }),
        ...(data.type && { type: data.type }),
        ...(data.modifiedBy && { modifiedBy: data.modifiedBy }),
      },
    );

    return this.findOne(id, companyId);
  }

  // Delete product with company access validation
  async remove(
    id: string,
    companyId: string,
    userRole: UserRole,
  ): Promise<void> {
    await this.findOne(id, companyId);
    await deleteEntityByRole(
      this.productRepository,
      { id, companyId },
      userRole,
      'Product',
    );
  }
}
