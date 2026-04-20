import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { loadEnv } from '@supperajan/config';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Simple in-process rate limiter per IP.
 * For production at scale, replace with Redis-backed sliding window.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor() {
    const env = loadEnv();
    this.windowMs = env.RATE_LIMIT_WINDOW_MS;
    this.maxRequests = env.RATE_LIMIT_MAX_REQUESTS;
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const ip = req.ip ?? 'unknown';
    const now = Date.now();

    let entry = this.store.get(ip);
    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + this.windowMs };
      this.store.set(ip, entry);
      return true;
    }

    entry.count++;
    if (entry.count > this.maxRequests) {
      throw new HttpException(
        { message: 'Çok fazla istek gönderildi. Lütfen bekleyin.', retryAfter: Math.ceil((entry.resetAt - now) / 1000) },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
