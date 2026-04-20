import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HealthModule } from './health/health.module.js';
import { CommonModule } from './common/common.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SessionsModule } from './sessions/sessions.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { AiModule } from './ai/ai.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { KnowledgeModule } from './knowledge/knowledge.module.js';
import { EmotionModule } from './emotion/emotion.module.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor.js';

/**
 * Root application module.
 * Phase 2: Full backend wiring — DB, Auth, Sessions, Messages, AI, Realtime gateway.
 * Phase 5–9 will add: MemoryModule, KnowledgeModule, VoiceModule, EmotionModule.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    DatabaseModule,
    AuthModule,
    HealthModule,
    SessionsModule,
    MessagesModule,
    AiModule,
    KnowledgeModule,
    EmotionModule,
    RealtimeModule,
  ],
  providers: [
    { provide: APP_FILTER,      useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestIdInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
