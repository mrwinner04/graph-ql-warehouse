import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './user.entity';
import { CompanyEntity } from '../company/company.entity';
import { UserRole } from '../common/types';
import { validateCompanyAccess } from '../common/company-access.utils';
import { UserResponse } from './dto/user.response';

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

function toUserResponse(user: UserEntity): UserResponse {
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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  async validatePassword(user: UserEntity, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async findAll(companyId: string): Promise<UserResponse[]> {
    const users = await this.userRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
    return users.map(toUserResponse);
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
    return users.map(toUserResponse);
  }

  async create(data: CreateUserData): Promise<UserResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = this.userRepository.create({
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      name: data.name.trim(),
      role: data.role,
      companyId: data.companyId,
    });

    const savedUser = await this.userRepository.save(user);
    return toUserResponse(savedUser);
  }

  async update(
    id: string,
    data: UpdateUserData,
    companyId: string,
  ): Promise<Omit<UserEntity, 'password'>> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    await this.findOne(id, companyId);

    if (data.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
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

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);
    await this.userRepository.softDelete({ id, companyId });
  }
}
