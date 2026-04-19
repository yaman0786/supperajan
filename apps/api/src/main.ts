import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { loadEnv } from '@supperajan/config';
import { getLogger } from '@supperajan/observability';

async function bootstrap() {
  const env = loadEnv();
  const logger = getLogger({ service: 'api', operation: 'bootstrap' });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: env.NODE_ENV === 'development',
      trustProxy: true,
    }),
    { bufferLogs: true },
  );

  // ── Global validation pipe ──────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── CORS ────────────────────────────────────────────────────────────────
  const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true,
  });

  // ── Global prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  await app.listen(env.PORT, '0.0.0.0');
  logger.info(`API server running on port ${env.PORT}`, { port: env.PORT, env: env.NODE_ENV });
}

bootstrap().catch((err) => {
  console.error('Failed to start API server:', err);
  process.exit(1);
});
