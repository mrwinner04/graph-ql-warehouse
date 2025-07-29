import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseEntity } from './warehouse.entity';
import { WarehouseResponse } from './dto/warehouse.response';
import { UserRole } from '../common/types';
import { validateCompanyAccess } from '../common/company-access.utils';
import { toWarehouseResponse } from '../common/entity-transformers';
import {
  validateWarehouseNameNotExists,
  deleteEntityByRole,
} from '../common/common.utils';

interface CreateWarehouseData {
  name: string;
  address?: string;
  type?: string;
  companyId: string;
  modifiedBy?: string;
}

interface UpdateWarehouseData {
  name?: string;
  address?: string;
  type?: string;
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
    return warehouses.map(toWarehouseResponse);
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

    return toWarehouseResponse(warehouse);
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
    await validateWarehouseNameNotExists(
      this.warehouseRepository,
      data.name,
      data.companyId,
    );

    const warehouse = this.warehouseRepository.create({
      name: data.name.trim(),
      address: data.address?.trim(),
      type: data.type?.trim(),
      companyId: data.companyId,
      modifiedBy: data.modifiedBy,
    });

    const savedWarehouse = await this.warehouseRepository.save(warehouse);
    return toWarehouseResponse(savedWarehouse);
  }

  // Update warehouse with company access validation
  async update(
    id: string,
    data: UpdateWarehouseData,
    companyId: string,
  ): Promise<WarehouseResponse> {
    await this.findOne(id, companyId);

    if (data.name) {
      await validateWarehouseNameNotExists(
        this.warehouseRepository,
        data.name,
        companyId,
        id,
      );
    }

    await this.warehouseRepository.update(
      { id, companyId },
      {
        ...(data.name && { name: data.name.trim() }),
        ...(data.address && { address: data.address.trim() }),
        ...(data.type && { type: data.type.trim() }),
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
