import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service.js';
import { MetricsService } from './metrics.service.js';

/**
 * Global infrastructure module.
 * LoggerService and MetricsService are exported globally so all modules
 * can inject them without re-importing CommonModule.
 */
@Global()
@Module({
  providers: [LoggerService, MetricsService],
  exports: [LoggerService, MetricsService],
})
export class CommonModule {}
