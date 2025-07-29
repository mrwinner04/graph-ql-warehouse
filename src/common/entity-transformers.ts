import { UserEntity } from '../user/user.entity';
import { UserResponse } from '../user/dto/user.response';
import { CustomerEntity } from '../customer/customer.entity';
import { CustomerResponse } from '../customer/dto/customer.response';
import { WarehouseEntity } from '../warehouse/warehouse.entity';
import { WarehouseResponse } from '../warehouse/dto/warehouse.response';
import * as bcrypt from 'bcryptjs';

export function toUserResponse(user: UserEntity): UserResponse {
  return {
    id: user.id,
    companyId: user.companyId,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
}
export function toCustomerResponse(customer: CustomerEntity): CustomerResponse {
  return {
    id: customer.id,
    companyId: customer.companyId,
    name: customer.name,
    email: customer.email,
    type: customer.type,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    deletedAt: customer.deletedAt,
    modifiedBy: customer.modifiedBy,
  };
}

export function toWarehouseResponse(
  warehouse: WarehouseEntity,
): WarehouseResponse {
  return {
    id: warehouse.id,
    companyId: warehouse.companyId,
    name: warehouse.name,
    address: warehouse.address,
    type: warehouse.type,
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
    deletedAt: warehouse.deletedAt,
    modifiedBy: warehouse.modifiedBy,
  };
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
