export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  service?: string;
  operation?: string;
  durationMs?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  child(context: LogContext): ILogger;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Structured logger.
 * In production: outputs JSON to stdout for log aggregation systems.
 * In development: outputs pretty-printed colored text.
 */
export class Logger implements ILogger {
  private minLevel: LogLevel;
  private format: 'json' | 'pretty';
  private baseContext: LogContext;

  constructor(options: {
    level?: LogLevel;
    format?: 'json' | 'pretty';
    context?: LogContext;
  } = {}) {
    this.minLevel = options.level ?? 'info';
    this.format = options.format ?? 'json';
    this.baseContext = options.context ?? {};
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  child(context: LogContext): ILogger {
    return new Logger({
      level: this.minLevel,
      format: this.format,
      context: { ...this.baseContext, ...context },
    });
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.minLevel]) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.baseContext, ...context },
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (this.format === 'json') {
      process.stdout.write(JSON.stringify(entry) + '\n');
    } else {
      this.prettyPrint(entry);
    }
  }

  private prettyPrint(entry: LogEntry): void {
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    };
    const reset = '\x1b[0m';
    const gray = '\x1b[90m';
    const color = colors[entry.level] ?? reset;

    const time = new Date(entry.timestamp).toLocaleTimeString();
    const service = entry.context['service'] ? `[${entry.context['service']}]` : '';
    const op = entry.context['operation'] ? `.${String(entry.context['operation'])}` : '';
    const duration = entry.context['durationMs'] ? ` ${gray}(${String(entry.context['durationMs'])}ms)${reset}` : '';

    process.stdout.write(
      `${gray}${time}${reset} ${color}${entry.level.toUpperCase().padEnd(5)}${reset} ${service}${op} ${entry.message}${duration}\n`,
    );

    if (entry.error) {
      process.stderr.write(`${entry.error.stack ?? entry.error.message}\n`);
    }
  }
}

let _defaultLogger: ILogger | null = null;

export function getLogger(context?: LogContext): ILogger {
  if (!_defaultLogger) {
    _defaultLogger = new Logger({
      level: (process.env['LOG_LEVEL'] as LogLevel) ?? 'info',
      format: (process.env['LOG_FORMAT'] as 'json' | 'pretty') ?? 'json',
    });
  }
  return context ? _defaultLogger.child(context) : _defaultLogger;
}

export function setLogger(logger: ILogger): void {
  _defaultLogger = logger;
}
