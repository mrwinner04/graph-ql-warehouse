import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './user.entity';
import { CompanyEntity } from '../company/company.entity';
import { UserRole } from '../common/types';
import { validateCompanyAccess } from '../common/company-access.utils';
import { UserResponse } from './dto/user.response';
import {
  transformEntity,
  hashPassword,
  comparePassword,
} from '../common/entity-transformers';
import {
  validateFieldNotExistsGlobally,
  deleteEntityByRole,
} from '../common/common.utils';

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyId: string;
}

interface UpdateUserData {
  email?: string;
  name?: string;
  role?: UserRole;
  password?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  async validatePassword(user: UserEntity, password: string): Promise<boolean> {
    return comparePassword(password, user.password);
  }

  async findAll(companyId: string): Promise<UserResponse[]> {
    const users = await this.userRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
    return users.map(
      (user) => transformEntity(user, ['password']) as UserResponse,
    );
  }

  async findOne(
    id: string,
    companyId: string,
  ): Promise<Omit<UserEntity, 'password'>> {
    const user = await validateCompanyAccess(
      () =>
        this.userRepository.findOne({
          where: { id },
          select: [
            'id',
            'email',
            'name',
            'role',
            'companyId',
            'createdAt',
            'updatedAt',
            'deletedAt',
          ],
        }),
      companyId,
      'User',
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByCompanyId(companyId: string): Promise<UserResponse[]> {
    const users = await this.userRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
    return users.map(
      (user) => transformEntity(user, ['password']) as UserResponse,
    );
  }

  async create(data: CreateUserData): Promise<UserResponse> {
    await validateFieldNotExistsGlobally(
      this.userRepository,
      'email',
      data.email,
      'User',
      undefined,
      (value) => value.toLowerCase().trim(),
    );

    const hashedPassword = await hashPassword(data.password);

    const user = this.userRepository.create({
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      name: data.name.trim(),
      role: data.role,
      companyId: data.companyId,
    });

    const savedUser = await this.userRepository.save(user);
    return transformEntity(savedUser, ['password']) as UserResponse;
  }

  async update(
    id: string,
    data: UpdateUserData,
    companyId: string,
  ): Promise<Omit<UserEntity, 'password'>> {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    await this.findOne(id, companyId);

    if (data.email) {
      await validateFieldNotExistsGlobally(
        this.userRepository,
        'email',
        data.email,
        'User',
        id,
        (value) => value.toLowerCase().trim(),
      );
    }

    await this.userRepository.update(
      { id, companyId },
      {
        ...(data.email && { email: data.email.toLowerCase().trim() }),
        ...(data.name && { name: data.name.trim() }),
        ...(data.role && { role: data.role }),
        ...(data.password && { password: data.password }),
      },
    );

    return this.findOne(id, companyId);
  }

  async remove(
    id: string,
    companyId: string,
    userRole: UserRole,
  ): Promise<void> {
    await this.findOne(id, companyId);
    await deleteEntityByRole(
      this.userRepository,
      { id, companyId },
      userRole,
      'User',
    );
  }
}
