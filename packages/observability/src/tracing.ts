/**
 * Distributed tracing abstraction.
 * Wraps span creation and context propagation behind a simple interface.
 * Wire to OpenTelemetry in production via an adapter.
 */

export interface ITracer {
  startSpan(name: string, attributes?: Record<string, string | number | boolean>): ISpan;
  withSpan<T>(name: string, fn: (span: ISpan) => Promise<T>): Promise<T>;
}

export interface ISpan {
  setAttribute(key: string, value: string | number | boolean): void;
  setStatus(code: 'ok' | 'error', message?: string): void;
  end(): void;
  recordException(error: Error): void;
}

export class NoopSpan implements ISpan {
  setAttribute(_key: string, _value: string | number | boolean): void {}
  setStatus(_code: 'ok' | 'error', _message?: string): void {}
  end(): void {}
  recordException(_error: Error): void {}
}

export class NoopTracer implements ITracer {
  startSpan(_name: string, _attributes?: Record<string, string | number | boolean>): ISpan {
    return new NoopSpan();
  }

  async withSpan<T>(_name: string, fn: (span: ISpan) => Promise<T>): Promise<T> {
    return fn(new NoopSpan());
  }
}

// ─── Request ID ───────────────────────────────────────────────────────────────

export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateCorrelationId(): string {
  return `cor_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
