import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { CompanyAccessInterceptor } from './common/company-access.interceptor';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { CustomerModule } from './customer/customer.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order-item/order-item.module';
import { InvoiceModule } from './invoice/invoice.module';
import { DevModule } from './dev/dev.module';
import { dbConfig } from './db.config';
import { GraphQLError } from './common/graphql-context';
import { AppResolver } from './app.resolver';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      introspection: true,
      context: ({ req }: { req: any }) => ({ req }),
      formatError: (error: GraphQLError) => {
        const originalError = error.extensions?.originalError;
        if (originalError) {
          return {
            message: originalError.message || error.message,
            statusCode: originalError.statusCode,
            error: originalError.error,
          };
        }
        return error;
      },
    }),

    TypeOrmModule.forRoot(dbConfig),

    // Application modules
    AuthModule,
    CompanyModule,
    UserModule,
    CustomerModule,
    WarehouseModule,
    ProductModule,
    OrderModule,
    OrderItemModule,
    InvoiceModule,
    DevModule,
  ],

  providers: [
    AppResolver,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    CompanyAccessInterceptor,
  ],
})
export class AppModule {}
