import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { LoginResponse } from './dto/login.response';
import { RegisterResponse } from './dto/register.response';
import { UserRole } from '../common/types';
import { UserEntity } from '../user/user.entity';
import { CompanyEntity } from '../company/company.entity';
import { hashPassword, comparePassword } from '../common/entity-transformers';
import { validateFieldNotExistsGlobally } from '../common/common.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(
      input.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }

  async register(input: RegisterInput): Promise<RegisterResponse> {
    await validateFieldNotExistsGlobally(
      this.userRepository,
      'email',
      input.email,
      'User',
      undefined,
      (value) => value.toLowerCase().trim(),
    );

    if (!input.companyName || input.companyName.trim().length === 0) {
      throw new BadRequestException('Company name is required');
    }

    const company = this.companyRepository.create({
      name: input.companyName.trim(),
    });

    const savedCompany = await this.companyRepository.save(company);

    const hashedPassword = await hashPassword(input.password);

    const user = this.userRepository.create({
      email: input.email.toLowerCase().trim(),
      password: hashedPassword,
      name: input.name.trim(),
      role: input.role || UserRole.OWNER,
      companyId: savedCompany.id,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      user: savedUser,
    };
  }
}
