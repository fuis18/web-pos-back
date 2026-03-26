import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProductsModule } from './products/products.module.js';
import { SalesModule } from './sales/sales.module.js';
import { UsersModule } from './users/users.module.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [PrismaModule, ProductsModule, SalesModule, UsersModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
