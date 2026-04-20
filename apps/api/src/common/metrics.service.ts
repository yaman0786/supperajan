import { Injectable } from '@nestjs/common';
import { NoopMetrics, type IMetrics } from '@supperajan/observability';

/**
 * Thin NestJS wrapper around the IMetrics interface.
 * In production, replace NoopMetrics with a Prometheus or Datadog adapter.
 */
@Injectable()
export class MetricsService implements IMetrics {
  private readonly metrics: IMetrics = new NoopMetrics();

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
