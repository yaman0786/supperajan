import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';
import { DbHealthIndicator } from './db.health-indicator.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [TerminusModule, DatabaseModule],
  controllers: [HealthController],
  providers: [DbHealthIndicator],
})
export class HealthModule {}
