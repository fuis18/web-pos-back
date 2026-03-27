import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import process from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (typeof databaseUrl !== 'string' || databaseUrl.length === 0) {
      throw new Error('DATABASE_URL is required to initialize PrismaClient');
    }

    super({
      adapter: new PrismaPg({ connectionString: databaseUrl, max: 5 }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async connectWithRetry(retries = 5, delayMs = 2000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connected');
        return;
      } catch (err) {
        this.logger.warn(
          `DB connection attempt ${attempt}/${retries} failed. Retrying in ${delayMs}ms…`,
        );
        if (attempt === retries) throw err;
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
}
