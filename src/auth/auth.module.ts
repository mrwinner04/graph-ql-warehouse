import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { UserEntity } from '../user/user.entity';
import { CompanyEntity } from '../company/company.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([UserEntity, CompanyEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [JwtStrategy, AuthResolver, AuthService],
  exports: [JwtModule, PassportModule, AuthService],
})
export class AuthModule {}
