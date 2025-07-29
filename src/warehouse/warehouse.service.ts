import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseEntity } from './warehouse.entity';
import { WarehouseResponse } from './dto/warehouse.response';
import { validateCompanyAccess } from '../common/company-access.utils';

interface CreateWarehouseData {
  name: string;
  location?: string;
  description?: string;
  companyId: string;
  modifiedBy?: string;
}

interface UpdateWarehouseData {
  name?: string;
  location?: string;
  description?: string;
  modifiedBy?: string;
}

// Helper function to transform WarehouseEntity to WarehouseResponse
function toWarehouseResponse(warehouse: WarehouseEntity): WarehouseResponse {
  return {
    id: warehouse.id,
    companyId: warehouse.companyId,
    name: warehouse.name,
    location: warehouse.location,
    description: warehouse.description,
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
    deletedAt: warehouse.deletedAt,
    modifiedBy: warehouse.modifiedBy,
  };
}

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(WarehouseEntity)
    private readonly warehouseRepository: Repository<WarehouseEntity>,
  ) {}

  // Find all warehouses in a company
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

  // Create new warehouse
  async create(data: CreateWarehouseData): Promise<WarehouseResponse> {
    // Check if warehouse with name already exists in the same company
    const existingWarehouse = await this.warehouseRepository.findOne({
      where: { name: data.name, companyId: data.companyId },
    });
    if (existingWarehouse) {
      throw new ConflictException(
        'Warehouse with this name already exists in your company',
      );
    }

    // Create warehouse
    const warehouse = this.warehouseRepository.create({
      name: data.name.trim(),
      location: data.location?.trim(),
      description: data.description?.trim(),
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
    // Check if warehouse exists and has access
    await this.findOne(id, companyId);

    // Check if name is being changed and if it already exists
    if (data.name) {
      const existingWarehouse = await this.warehouseRepository.findOne({
        where: { name: data.name, companyId },
      });
      if (existingWarehouse && existingWarehouse.id !== id) {
        throw new ConflictException(
          'Warehouse with this name already exists in your company',
        );
      }
    }

    // Update warehouse
    await this.warehouseRepository.update(
      { id, companyId },
      {
        ...(data.name && { name: data.name.trim() }),
        ...(data.location && { location: data.location.trim() }),
        ...(data.description && { description: data.description.trim() }),
        ...(data.modifiedBy && { modifiedBy: data.modifiedBy }),
      },
    );

    return this.findOne(id, companyId);
  }

  // Delete warehouse with company access validation
  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);
    await this.warehouseRepository.softDelete({ id, companyId });
  }
}
