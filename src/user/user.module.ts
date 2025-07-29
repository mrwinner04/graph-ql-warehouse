import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { CompanyEntity } from '../company/company.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, CompanyEntity])],
  providers: [UserResolver, UserService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
