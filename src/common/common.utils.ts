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

export async function validateFieldNotExistsInCompany<
  T extends { id?: string },
>(
  repo: Repository<T>,
  field: string,
  value: string,
  companyId: string,
  entityName: string,
  excludeId?: string,
  transformValue?: (value: string) => string,
): Promise<void> {
  if (!value) return; // Skip validation if no value provided

  const transformedValue = transformValue
    ? transformValue(value)
    : value.trim();

  const existing = await repo.findOne({
    where: { [field]: transformedValue, companyId } as any,
  });

  if (existing && existing.id !== excludeId) {
    throw new ConflictException(
      `${entityName} with this ${field} already exists in your company`,
    );
  }
}

export async function validateFieldNotExistsGlobally<T extends { id?: string }>(
  repo: Repository<T>,
  field: string,
  value: string,
  entityName: string,
  excludeId?: string,
  transformValue?: (value: string) => string,
): Promise<void> {
  if (!value) return; // Skip validation if no value provided

  const transformedValue = transformValue
    ? transformValue(value)
    : value.trim();

  const existing = await repo.findOne({
    where: { [field]: transformedValue } as any,
  });

  if (existing && existing.id !== excludeId) {
    throw new ConflictException(
      `${entityName} with this ${field} already exists`,
    );
  }
}

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
