import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Singleton PrismaClient factory.
 * In development, reuses the global instance to prevent connection pool exhaustion
 * during hot-reload cycles (Next.js dev, Vite HMR, etc.).
 * In production, creates a single instance per process.
 */
export function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? [{ level: 'query', emit: 'event' }, 'warn', 'error']
        : ['warn', 'error'],
  });

  if (process.env['NODE_ENV'] === 'development') {
    client.$on('query' as never, (e: { query: string; duration: number }) => {
      if (process.env['DEBUG_DB'] === 'true') {
        console.debug(`[prisma] ${e.query} (${e.duration}ms)`);
      }
    });
  }

  return client;
}

export function getPrismaClient(): PrismaClient {
  if (process.env['NODE_ENV'] === 'production') {
    return createPrismaClient();
  }

  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  return global.__prisma;
}

export { PrismaClient };
export type { Prisma } from '@prisma/client';
