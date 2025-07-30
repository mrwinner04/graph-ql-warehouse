import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseEntity } from './warehouse.entity';
import { WarehouseResponse } from './warehouse.types';
import { UserRole } from '../common/types';
import { validateCompanyAccess } from '../common/company-access.utils';
import { transformEntity } from '../common/entity-transformers';
import {
  validateFieldNotExistsInCompany,
  deleteEntityByRole,
} from '../common/common.utils';
import { WarehouseType } from './warehouse.entity';

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

  // Find warehouse by ID with company access validation
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

  // Find warehouse by ID (for internal use)
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

  // Update warehouse with company access validation
  async update(
    id: string,
    data: UpdateWarehouseData,
    companyId: string,
  ): Promise<WarehouseResponse> {
    await this.findOne(id, companyId);

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

  // Delete warehouse with company access validation
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
}
