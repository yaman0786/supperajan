import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class DbHealthIndicator extends HealthIndicator {
  constructor(private readonly db: DatabaseService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.db.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (err) {
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, { error: String(err) }),
      );
    }
  }
}
