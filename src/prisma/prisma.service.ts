import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import process from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const databaseUrl = process.env['DATABASE_URL'];

    if (typeof databaseUrl !== 'string' || databaseUrl.length === 0) {
      throw new Error('DATABASE_URL is required to initialize PrismaClient');
    }

    const connectionString: string = databaseUrl;

    super({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
