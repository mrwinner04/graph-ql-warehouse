import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseEntity } from './warehouse.entity';
import {
  WarehouseResponse,
  ProductWithHighestStock,
  AvailableStockReport,
  AvailableStockItem,
} from './warehouse.types';
import { UserRole } from '../common/types';
import { validateCompanyAccess } from '../common/company-access.utils';
import { transformEntity } from '../common/entity-transformers';
import {
  validateFieldNotExistsInCompany,
  deleteEntityByRole,
} from '../common/common.utils';
import { WarehouseType } from './warehouse.entity';
import { validateWarehouseTypeChange } from '../common/type-validation.utils';

interface CreateWarehouseData {
  name: string;
  address?: string;
  type?: WarehouseType;
  companyId: string;
  modifiedBy?: string;
}

interface UpdateWarehouseData {
  name?: string;
  address?: string;
  type?: WarehouseType;
  modifiedBy?: string;
}

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(WarehouseEntity)
    private readonly warehouseRepository: Repository<WarehouseEntity>,
  ) {}

  async findAll(companyId: string): Promise<WarehouseResponse[]> {
    const warehouses = await this.warehouseRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
    return warehouses.map(
      (warehouse) => transformEntity(warehouse) as WarehouseResponse,
    );
  }

  async findOne(id: string, companyId: string): Promise<WarehouseResponse> {
    const warehouse = await validateCompanyAccess(
      () =>
        this.warehouseRepository.findOne({
          where: { id },
        }),
      companyId,
      'Warehouse',
    );

    return transformEntity(warehouse) as WarehouseResponse;
  }

  async findById(id: string): Promise<WarehouseEntity> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return warehouse;
  }

  async create(data: CreateWarehouseData): Promise<WarehouseResponse> {
    await validateFieldNotExistsInCompany(
      this.warehouseRepository,
      'name',
      data.name,
      data.companyId,
      'Warehouse',
      undefined,
      (value) => value.trim(),
    );

    const warehouse = this.warehouseRepository.create({
      name: data.name.trim(),
      address: data.address?.trim(),
      type: data.type,
      companyId: data.companyId,
      modifiedBy: data.modifiedBy,
    });

    const savedWarehouse = await this.warehouseRepository.save(warehouse);
    return transformEntity(savedWarehouse) as WarehouseResponse;
  }

  async update(
    id: string,
    data: UpdateWarehouseData,
    companyId: string,
  ): Promise<WarehouseResponse> {
    await this.findOne(id, companyId);

    if (data.type) {
      await validateWarehouseTypeChange(
        this.warehouseRepository.manager,
        id,
        data.type,
      );
    }

    if (data.name) {
      await validateFieldNotExistsInCompany(
        this.warehouseRepository,
        'name',
        data.name,
        companyId,
        'Warehouse',
        id,
        (value) => value.trim(),
      );
    }

    await this.warehouseRepository.update(
      { id, companyId },
      {
        ...(data.name && { name: data.name.trim() }),
        ...(data.address && { address: data.address.trim() }),
        ...(data.type && { type: data.type }),
        ...(data.modifiedBy && { modifiedBy: data.modifiedBy }),
      },
    );

    return this.findOne(id, companyId);
  }

  async remove(
    id: string,
    companyId: string,
    userRole: UserRole,
  ): Promise<void> {
    await this.findOne(id, companyId);
    await deleteEntityByRole(
      this.warehouseRepository,
      { id, companyId },
      userRole,
      'Warehouse',
    );
  }

  // Get product with highest stock per warehouse
  async getProductWithHighestStockPerWarehouse(
    companyId: string,
  ): Promise<ProductWithHighestStock[]> {
    return this.warehouseRepository.manager
      .createQueryBuilder()
      .select('w.id', 'warehouseId')
      .addSelect('w.name', 'warehouseName')
      .addSelect('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('SUM(oi.quantity)', 'totalStock')
      .from('warehouses', 'w')
      .innerJoin('orders', 'o', 'o.warehouse_id = w.id')
      .innerJoin('order_items', 'oi', 'oi.order_id = o.id')
      .innerJoin('products', 'p', 'p.id = oi.product_id')
      .where('w.company_id = :companyId', { companyId })
      .andWhere('o.company_id = :companyId', { companyId })
      .andWhere('w.deleted_at IS NULL')
      .andWhere('o.deleted_at IS NULL')
      .andWhere('oi.deleted_at IS NULL')
      .andWhere('p.deleted_at IS NULL')
      .groupBy('w.id, w.name, p.id, p.name')
      .orderBy('w.id')
      .addOrderBy('"totalStock"', 'DESC')
      .getRawMany<ProductWithHighestStock>();
  }

  // Get available stock per warehouse
  async getAvailableStock(
    companyId: string,
    warehouseId?: string,
  ): Promise<AvailableStockReport[]> {
    let warehouses: WarehouseEntity[];

    if (warehouseId) {
      // Get specific warehouse
      const warehouse = await this.findById(warehouseId);
      if (warehouse.companyId !== companyId) {
        throw new BadRequestException('Warehouse not found in company');
      }
      warehouses = [warehouse];
    } else {
      // Get all warehouses in company
      warehouses = await this.warehouseRepository.find({
        where: { companyId },
        order: { name: 'ASC' },
      });
    }

    const reports: AvailableStockReport[] = [];

    for (const warehouse of warehouses) {
      // Calculate available stock for each product in this warehouse
      const stockQuery = this.warehouseRepository.manager
        .createQueryBuilder()
        .select('p.id', 'productId')
        .addSelect('p.name', 'productName')
        .addSelect('p.code', 'productCode')
        .addSelect('COALESCE(SUM(oi.quantity), 0)', 'availableQuantity')
        .addSelect('AVG(CAST(oi.price AS DECIMAL))', 'averagePrice')
        .from('products', 'p')
        .leftJoin('order_items', 'oi', 'oi.product_id = p.id')
        .leftJoin('orders', 'o', 'oi.order_id = o.id')
        .where('p.company_id = :companyId', { companyId })
        .andWhere('o.warehouse_id = :warehouseId', {
          warehouseId: warehouse.id,
        })
        .andWhere('p.deleted_at IS NULL')
        .andWhere('oi.deleted_at IS NULL')
        .andWhere('o.deleted_at IS NULL')
        .groupBy('p.id, p.name, p.code')
        .having('COALESCE(SUM(oi.quantity), 0) > 0')
        .orderBy('p.name', 'ASC');

      const stockItems = await stockQuery.getRawMany();

      const products: AvailableStockItem[] = stockItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        availableQuantity: parseInt(item.availableQuantity),
        averagePrice: parseFloat(item.averagePrice || '0'),
      }));

      const totalProducts = products.length;
      const totalValue = products.reduce(
        (sum, product) =>
          sum + product.availableQuantity * product.averagePrice,
        0,
      );

      reports.push({
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        products,
        totalProducts,
        totalValue,
      });
    }

    return reports;
  }
}
