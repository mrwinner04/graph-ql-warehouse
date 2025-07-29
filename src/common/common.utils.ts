import { BadRequestException } from '@nestjs/common';
import { Repository, FindOptionsWhere } from 'typeorm';

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
