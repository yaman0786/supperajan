import { Injectable } from '@nestjs/common';
import { NoopMetrics, InMemoryMetrics, type IMetrics } from '@supperajan/observability';

/**
 * Thin NestJS wrapper around the IMetrics interface.
 * Uses InMemoryMetrics in test/dev so call assertions work in tests.
 * In production, replace with a Prometheus or Datadog adapter.
 */
@Injectable()
export class MetricsService implements IMetrics {
  private readonly metrics: IMetrics =
    process.env['NODE_ENV'] === 'test' ? new InMemoryMetrics() : new NoopMetrics();

  increment(metric: string, tags?: Record<string, string>): void {
    this.metrics.increment(metric, tags);
  }

  decrement(metric: string, tags?: Record<string, string>): void {
    this.metrics.decrement(metric, tags);
  }

  gauge(metric: string, value: number, tags?: Record<string, string>): void {
    this.metrics.gauge(metric, value, tags);
  }

  histogram(metric: string, value: number, tags?: Record<string, string>): void {
    this.metrics.histogram(metric, value, tags);
  }

  timing(metric: string, durationMs: number, tags?: Record<string, string>): void {
    this.metrics.timing(metric, durationMs, tags);
  }
}
