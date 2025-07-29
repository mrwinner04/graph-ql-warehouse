import * as bcrypt from 'bcryptjs';

export function transformEntity<T extends Record<string, any>>(
  entity: T,
  excludeFields: (keyof T)[] = [],
): Partial<T> {
  const transformed = { ...entity };
  excludeFields.forEach((field) => {
    delete transformed[field];
  });
  return transformed;
}

export function transformToResponse<T extends Record<string, any>>(
  entity: T,
  excludeFields: (keyof T)[] = [],
): Partial<T> {
  const transformed = { ...entity };

  // Remove excluded fields
  excludeFields.forEach((field) => {
    delete transformed[field];
  });

  return transformed;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
