import { BadRequestException, ConflictException } from '@nestjs/common';
import { Repository, FindOptionsWhere } from 'typeorm';
import { UserRole } from './types';

export async function assertNotExists<T extends object>(
  repo: Repository<T>,
  where: FindOptionsWhere<T>,
  errorMessage: string,
  excludeId?: string,
): Promise<void> {
  const existing = await repo.findOneBy(where);
  if (
    existing &&
    (!excludeId || (existing as { id?: string }).id !== excludeId)
  ) {
    throw new BadRequestException(errorMessage);
  }
}

export async function validateUserEmailNotExists(
  userRepo: Repository<any>,
  email: string,
  excludeId?: string,
): Promise<void> {
  const existingUser = await userRepo.findOne({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingUser && existingUser.id !== excludeId) {
    throw new ConflictException('User with this email already exists');
  }
}

export async function validateCustomerEmailNotExists(
  customerRepo: Repository<any>,
  email: string,
  companyId: string,
  excludeId?: string,
): Promise<void> {
  if (!email) return; // Skip validation if no email provided

  const existingCustomer = await customerRepo.findOne({
    where: { email: email.toLowerCase().trim(), companyId },
  });

  if (existingCustomer && existingCustomer.id !== excludeId) {
    throw new ConflictException(
      'Customer with this email already exists in your company',
    );
  }
}

export async function validateWarehouseNameNotExists(
  warehouseRepo: Repository<any>,
  name: string,
  companyId: string,
  excludeId?: string,
): Promise<void> {
  const existingWarehouse = await warehouseRepo.findOne({
    where: { name: name.trim(), companyId },
  });

  if (existingWarehouse && existingWarehouse.id !== excludeId) {
    throw new ConflictException(
      'Warehouse with this name already exists in your company',
    );
  }
}

export async function validateCustomerNameNotExists(
  customerRepo: Repository<any>,
  name: string,
  companyId: string,
  excludeId?: string,
): Promise<void> {
  const existingCustomer = await customerRepo.findOne({
    where: { name: name.trim(), companyId },
  });

  if (existingCustomer && existingCustomer.id !== excludeId) {
    throw new ConflictException(
      'Customer with this name already exists in your company',
    );
  }
}

/**
 * Delete entity based on user role
 * - OWNER: Hard delete (permanent removal)
 * - OPERATOR: Soft delete (mark as deleted)
 * - VIEWER: Cannot delete (throws error)
 * @param repo - TypeORM repository
 * @param where - Where conditions to identify the entity
 * @param userRole - Role of the user performing the delete
 * @param entityName - Name of the entity for error messages
 */
export async function deleteEntityByRole<T extends object>(
  repo: Repository<T>,
  where: FindOptionsWhere<T>,
  userRole: UserRole,
  entityName: string = 'Entity',
): Promise<void> {
  if (userRole === UserRole.OWNER) {
    // Hard delete for owners
    const result = await repo.delete(where);
    if (result.affected === 0) {
      throw new BadRequestException(`${entityName} not found`);
    }
  } else if (userRole === UserRole.OPERATOR) {
    // Soft delete for operators
    const result = await repo.softDelete(where);
    if (result.affected === 0) {
      throw new BadRequestException(`${entityName} not found`);
    }
  } else {
    // VIEWER cannot delete
    throw new BadRequestException(
      `Viewers cannot delete ${entityName.toLowerCase()}s`,
    );
  }
}
