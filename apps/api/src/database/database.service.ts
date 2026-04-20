import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from '../common/logger.service.js';

/**
 * NestJS-managed Prisma client.
 * Connects on module init, gracefully disconnects on shutdown.
 * Exposes the client via inheritance so any service can call `this.user.findMany(...)` etc.
 */
@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: LoggerService) {
    super({
      log:
        process.env['NODE_ENV'] === 'development'
          ? [{ level: 'query', emit: 'event' }, 'warn', 'error']
          : ['warn', 'error'],
    });

    if (process.env['NODE_ENV'] === 'development') {
      (this as PrismaClient).$on('query' as never, (e: { query: string; duration: number }) => {
        if (process.env['DEBUG_DB'] === 'true') {
          this.logger.debug('[prisma] query', { query: e.query, durationMs: e.duration });
        }
      });
    }
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.info('Database connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.info('Database disconnected');
  }
}
