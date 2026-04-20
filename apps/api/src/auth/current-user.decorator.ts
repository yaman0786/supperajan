import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'DEVELOPER';
}

/**
 * Parameter decorator — extracts the authenticated user from the request.
 * Usage: @CurrentUser() user: AuthenticatedUser
 *
 * In Phase 1 of auth, this returns a development stub so the platform
 * is usable without a real auth provider wired up.
 * Phase 11 replaces the stub with a verified JWT claim.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest & { user?: AuthenticatedUser }>();

    // Return JWT-verified user if auth is wired, otherwise dev stub
    if (request.user) return request.user;

    // Dev stub — single-user mode during development
    return {
      id: process.env['DEV_USER_ID'] ?? 'dev-user-00000000',
      email: process.env['DEV_USER_EMAIL'] ?? 'dev@supperajan.local',
      role: 'USER',
    };
  },
);
