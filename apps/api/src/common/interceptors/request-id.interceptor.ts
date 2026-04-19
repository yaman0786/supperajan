import {
  Injectable,
  NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { generateRequestId } from '@supperajan/observability';

/**
 * Ensures every request has an X-Request-ID header.
 * If the client sends one, it is echoed back.
 * If not, one is generated and attached to both request and response.
 */
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();

    const id = (req.headers['x-request-id'] as string | undefined) ?? generateRequestId();
    req.headers['x-request-id'] = id;
    void reply.header('X-Request-ID', id);

    return next.handle();
  }
}
