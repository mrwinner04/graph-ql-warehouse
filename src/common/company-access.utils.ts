import { NotFoundException, ForbiddenException } from '@nestjs/common';

export function checkCompanyAccess<T extends { companyId?: string }>(
  entity: T | null,
  userCompanyId: string,
  entityName: string = 'Entity',
): T {
  if (!entity) {
    throw new NotFoundException(`${entityName} not found`);
  }

  if (entity.companyId && entity.companyId !== userCompanyId) {
    throw new ForbiddenException(
      `Access denied: You can only access data from your own company`,
    );
  }

  return entity;
}

export async function validateCompanyAccess<T extends { companyId?: string }>(
  findEntity: () => Promise<T | null>,
  userCompanyId: string,
  entityName: string = 'Entity',
): Promise<T> {
  const entity = await findEntity();
  return checkCompanyAccess(entity, userCompanyId, entityName);
}
