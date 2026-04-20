import type { ClientEvent, ServerEvent } from '@supperajan/types';

/**
 * WebSocket message envelope.
 * All messages over the wire are wrapped in this structure for versioning
 * and correlation ID propagation.
 */
export interface WireMessage<T extends ClientEvent | ServerEvent> {
  v: 1;
  id: string;
  ts: number;
  event: T;
}

export function encodeMessage<T extends ClientEvent | ServerEvent>(
  event: T,
  id?: string,
): string {
  const msg: WireMessage<T> = {
    v: 1,
    id: id ?? generateId(),
    ts: Date.now(),
    event,
  };
  return JSON.stringify(msg);
}

export function decodeMessage<T extends ClientEvent | ServerEvent>(
  raw: string,
): WireMessage<T> | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isWireMessage(parsed)) return null;
    return parsed as WireMessage<T>;
  } catch {
    return null;
  }
}

function isWireMessage(value: unknown): value is WireMessage<ClientEvent | ServerEvent> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'v' in value &&
    'id' in value &&
    'ts' in value &&
    'event' in value
  );
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Connection state ─────────────────────────────────────────────────────────

export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'authenticating'
  | 'authenticated'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

export interface ConnectionMeta {
  state: ConnectionState;
  sessionId?: string;
  userId?: string;
  connectedAt?: number;
  reconnectAttempts: number;
}

// ─── Reconnect strategy ───────────────────────────────────────────────────────

export interface ReconnectConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
}

export const DEFAULT_RECONNECT_CONFIG: ReconnectConfig = {
  maxAttempts: 10,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitter: true,
};

export function computeReconnectDelay(attempt: number, config: ReconnectConfig): number {
  const exponential = Math.min(config.baseDelayMs * 2 ** attempt, config.maxDelayMs);
  if (!config.jitter) return exponential;
  return exponential * (0.8 + Math.random() * 0.4);
}
