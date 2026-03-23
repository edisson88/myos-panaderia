import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envConfig } from './config/env.config';
import { HasuraModule } from './shared/hasura/hasura.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductionModule } from './modules/production/production.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ExportsModule } from './modules/exports/exports.module';

@Module({
  imports: [
    // Config is global — available everywhere via ConfigService
    ConfigModule.forRoot(envConfig),

    // Global data layer — provides HasuraService to every module
    HasuraModule,

    // Feature modules
    AuthModule,
    CustomersModule,
    DashboardModule,
    OrdersModule,
    ProductsModule,
    ProductionModule,
    DeliveriesModule,
    AnalyticsModule,
    ExportsModule,
  ],
})
export class AppModule {}
