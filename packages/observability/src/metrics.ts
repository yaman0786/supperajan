/**
 * Lightweight metrics abstraction.
 * Wraps counters, gauges, and histograms behind a consistent interface.
 * In production, wire this to your metrics backend (Prometheus, Datadog, etc.)
 * via an adapter implementation.
 */

export interface IMetrics {
  increment(metric: string, tags?: Record<string, string>): void;
  decrement(metric: string, tags?: Record<string, string>): void;
  gauge(metric: string, value: number, tags?: Record<string, string>): void;
  histogram(metric: string, value: number, tags?: Record<string, string>): void;
  timing(metric: string, durationMs: number, tags?: Record<string, string>): void;
}

/**
 * No-op metrics implementation.
 * Safe default for packages that receive IMetrics via dependency injection
 * but don't always have a real metrics backend wired up.
 */
export class NoopMetrics implements IMetrics {
  increment(_metric: string, _tags?: Record<string, string>): void {}
  decrement(_metric: string, _tags?: Record<string, string>): void {}
  gauge(_metric: string, _value: number, _tags?: Record<string, string>): void {}
  histogram(_metric: string, _value: number, _tags?: Record<string, string>): void {}
  timing(_metric: string, _durationMs: number, _tags?: Record<string, string>): void {}
}

/**
 * In-memory metrics for testing — accumulates calls for assertions.
 */
export class InMemoryMetrics implements IMetrics {
  readonly calls: Array<{ type: string; metric: string; value?: number; tags?: Record<string, string> }> = [];

  increment(metric: string, tags?: Record<string, string>): void {
    this.calls.push({ type: 'increment', metric, tags });
  }
  decrement(metric: string, tags?: Record<string, string>): void {
    this.calls.push({ type: 'decrement', metric, tags });
  }
  gauge(metric: string, value: number, tags?: Record<string, string>): void {
    this.calls.push({ type: 'gauge', metric, value, tags });
  }
  histogram(metric: string, value: number, tags?: Record<string, string>): void {
    this.calls.push({ type: 'histogram', metric, value, tags });
  }
  timing(metric: string, durationMs: number, tags?: Record<string, string>): void {
    this.calls.push({ type: 'timing', metric, value: durationMs, tags });
  }
  reset(): void {
    this.calls.length = 0;
  }
}

// ─── Metric names (typed constants to prevent typos) ─────────────────────────

export const METRICS = {
  // Conversation
  MESSAGES_TOTAL: 'supperajan.messages.total',
  MESSAGE_LATENCY: 'supperajan.message.latency_ms',
  STREAM_CHUNKS: 'supperajan.stream.chunks',

  // LLM
  LLM_REQUESTS: 'supperajan.llm.requests',
  LLM_TOKENS_USED: 'supperajan.llm.tokens_used',
  LLM_LATENCY: 'supperajan.llm.latency_ms',
  LLM_ERRORS: 'supperajan.llm.errors',

  // Voice
  STT_REQUESTS: 'supperajan.stt.requests',
  STT_LATENCY: 'supperajan.stt.latency_ms',
  TTS_REQUESTS: 'supperajan.tts.requests',
  TTS_LATENCY: 'supperajan.tts.latency_ms',

  // Memory
  MEMORY_READS: 'supperajan.memory.reads',
  MEMORY_WRITES: 'supperajan.memory.writes',
  MEMORY_WRITE_DENIALS: 'supperajan.memory.write_denials',

  // Knowledge
  RETRIEVAL_REQUESTS: 'supperajan.retrieval.requests',
  RETRIEVAL_LATENCY: 'supperajan.retrieval.latency_ms',
  INGESTION_JOBS: 'supperajan.ingestion.jobs',

  // WebSocket
  WS_CONNECTIONS: 'supperajan.ws.connections',
  WS_MESSAGES_SENT: 'supperajan.ws.messages_sent',
  WS_MESSAGES_RECEIVED: 'supperajan.ws.messages_received',

  // Errors
  ERRORS_TOTAL: 'supperajan.errors.total',
} as const;

export type MetricName = (typeof METRICS)[keyof typeof METRICS];
