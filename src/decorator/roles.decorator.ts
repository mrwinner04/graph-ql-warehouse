import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../common/types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const OwnerOnly = () => SetMetadata(ROLES_KEY, [UserRole.OWNER]);

export const OwnerAndOperator = () =>
  SetMetadata(ROLES_KEY, [UserRole.OWNER, UserRole.OPERATOR]);

export const AllRoles = () =>
  SetMetadata(ROLES_KEY, [UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER]);
