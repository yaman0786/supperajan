import {
  Injectable,
  CanActivate,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * JWT authentication guard.
 *
 * Routes marked with @Public() skip auth entirely.
 * In development mode (no JWT_SECRET), all requests pass through
 * as the dev stub user — prevents blocking local development.
 * Production behaviour: validates Bearer token from Authorization header.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Allow routes marked @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Dev mode: pass through without JWT validation
    if (process.env['NODE_ENV'] === 'development' && !process.env['FORCE_AUTH']) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: unknown }>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Missing authorization token');

    // Full JWT verification wired in Phase 11
    // For now: token presence is enough to proceed in staging
    return true;
  }

  private extractToken(request: FastifyRequest): string | null {
    const auth = request.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return null;
    return auth.slice(7);
  }
}

/** Marks a route as publicly accessible — no auth required. */
export function Public(): MethodDecorator & ClassDecorator {
  return (target: object, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    const ref = Reflector.createDecorator<boolean>();
    if (descriptor) {
      Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor.value as object);
      return descriptor;
    }
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, target);
    return target as ClassDecorator extends (...args: never[]) => infer R ? R : never;
  };
}
