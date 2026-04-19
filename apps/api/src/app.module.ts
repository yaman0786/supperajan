import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module.js';
import { CommonModule } from './common/common.module.js';

/**
 * Root application module.
 *
 * Phase 1: Health + common infrastructure only.
 * Phase 2: Adds SessionModule, MessageModule, AuthModule, RealtimeGateway.
 * Phase 5–9: Adds MemoryModule, KnowledgeModule, VoiceModule, EmotionModule.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      expandVariables: false,
    }),
    CommonModule,
    HealthModule,
  ],
})
export class AppModule {}
