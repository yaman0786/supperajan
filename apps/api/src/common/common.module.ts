import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service.js';
import { MetricsService } from './metrics.service.js';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsController } from './analytics.controller.js';
import { DatabaseModule } from '../database/database.module.js';

/**
 * Global infrastructure module.
 * LoggerService, MetricsService, and AnalyticsService are exported globally.
 */
@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [AnalyticsController],
  providers: [LoggerService, MetricsService, AnalyticsService],
  exports: [LoggerService, MetricsService, AnalyticsService],
})
export class CommonModule {}
