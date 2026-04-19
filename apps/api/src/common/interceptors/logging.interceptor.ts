import {
  Injectable,
  NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { FastifyRequest } from 'fastify';
import { LoggerService } from '../logger.service.js';
import { METRICS } from '@supperajan/observability';
import { MetricsService } from '../metrics.service.js';

/**
 * Logs every HTTP request/response with method, path, status, and latency.
 * Correlation ID is read from the request header and propagated through.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const start = Date.now();
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? '';
    const method = req.method;
    const url = req.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - start;
          this.logger.debug(`${method} ${url}`, { requestId, durationMs, operation: 'http_request' });
          this.metrics.timing('supperajan.http.latency_ms', durationMs, { method, path: url });
        },
        error: (err: unknown) => {
          const durationMs = Date.now() - start;
          const status = (err as { status?: number })?.status ?? 500;
          this.logger.warn(`${method} ${url} → ${status}`, { requestId, durationMs, status: String(status) });
          this.metrics.increment(METRICS.ERRORS_TOTAL, { method, path: url });
        },
      }),
    );
  }
}
