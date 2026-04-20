import { Injectable } from '@nestjs/common';
import { Logger, type ILogger, type LogContext } from '@supperajan/observability';

@Injectable()
export class LoggerService implements ILogger {
  private readonly logger: ILogger;

  constructor() {
    this.logger = new Logger({
      level: (process.env['LOG_LEVEL'] as 'debug' | 'info' | 'warn' | 'error') ?? 'info',
      format: (process.env['LOG_FORMAT'] as 'json' | 'pretty') ?? 'json',
      context: { service: 'api' },
    });
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logger.error(message, error, context);
  }

  child(context: LogContext): ILogger {
    return this.logger.child(context);
  }
}
