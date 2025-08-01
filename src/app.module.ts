import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { InvoiceEntity } from './invoice/invoice.entity';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { RolesGuard } from './auth/guard/roles.guard';
import { CompanyAccessInterceptor } from './common/company-access.interceptor';
import { CalculationService } from './common/calculation.service';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { CustomerModule } from './customer/customer.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order-item/order-item.module';
import { InvoiceModule } from './invoice/invoice.module';
import { dbConfig } from './db.config';
import { GraphQLError } from './common/graphql-context';

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
    TypeOrmModule.forFeature([InvoiceEntity]),

    AuthModule,
    CompanyModule,
    UserModule,
    CustomerModule,
    WarehouseModule,
    ProductModule,
    OrderModule,
    OrderItemModule,
    InvoiceModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    CompanyAccessInterceptor,
    CalculationService,
  ],
})
export class AppModule {}
