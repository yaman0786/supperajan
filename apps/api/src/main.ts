import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { loadEnv } from '@supperajan/config';
import { getLogger } from '@supperajan/observability';

async function bootstrap() {
  const env = loadEnv();
  const logger = getLogger({ service: 'api', operation: 'bootstrap' });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false, trustProxy: true }),
    { bufferLogs: true },
  );

  // ── Socket.IO adapter (must be before listen) ───────────────────────────
  app.useWebSocketAdapter(new IoAdapter(app));

  // ── Global validation pipe ──────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
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
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'health/live', 'health/ready'],
  });

  await app.listen(env.PORT, '0.0.0.0');
  logger.info(`🤖 Süpperajan API ready on :${env.PORT}`, {
    port: env.PORT,
    env: env.NODE_ENV,
    wsNamespace: '/realtime',
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start API server:', err);
  process.exit(1);
});
