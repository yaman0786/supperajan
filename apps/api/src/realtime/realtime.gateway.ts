import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { SessionManagerService } from './session-manager.service.js';
import { ConversationService } from './conversation.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { LoggerService } from '../common/logger.service.js';
import { MetricsService } from '../common/metrics.service.js';
import { METRICS } from '@supperajan/observability';
import type {
  SessionStartEvent,
  UserMessageEvent,
  AssistantInterruptEvent,
  FeedbackEvent,
  ServerEvent,
  SessionCreatedEvent,
} from '@supperajan/types';

/**
 * WebSocket Gateway — implements the full Supperajan realtime event protocol.
 *
 * Namespace: /realtime
 * Transport: Socket.IO (WebSocket with polling fallback)
 *
 * Client lifecycle:
 *  1. connect → (authenticated automatically in dev mode)
 *  2. emit session.start → receives session.created
 *  3. emit user.message → receives thinking/response_started/chunks/completed/state_changed
 *  4. emit user.barge_in → interrupts current generation
 *  5. disconnect → session unregistered
 */
@WebSocketGateway({
  namespace: '/realtime',
  cors: {
    origin: (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000').split(','),
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  /** Active generation AbortControllers per socketId */
  private activeGenerations = new Map<string, AbortController>();

  constructor(
    private readonly sessionManager: SessionManagerService,
    private readonly conversation: ConversationService,
    private readonly sessions: SessionsService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
  ) {}

  afterInit(_server: Server): void {
    this.logger.info('RealtimeGateway initialized');
  }

  handleConnection(client: Socket): void {
    this.metrics.increment(METRICS.WS_CONNECTIONS, { event: 'connect' });
    this.logger.debug('Client connected', { socketId: client.id });
  }

  handleDisconnect(client: Socket): void {
    const session = this.sessionManager.unregister(client.id);
    this.activeGenerations.delete(client.id);
    this.metrics.increment(METRICS.WS_CONNECTIONS, { event: 'disconnect' });
    this.logger.debug('Client disconnected', {
      socketId: client.id,
      userId: session?.userId,
    });
  }

  // ─── session.start ─────────────────────────────────────────────────────────

  @SubscribeMessage('session.start')
  async handleSessionStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionStartEvent,
  ): Promise<void> {
    try {
      // Dev mode: derive userId from socket handshake query or use default
      const userId =
        (client.handshake.query['userId'] as string | undefined) ??
        process.env['DEV_USER_ID'] ?? 'dev-user-00000000';

      const assistantMode = payload.assistantMode ?? 'friendly';

      // Create or reuse session
      let sessionId = payload.sessionId;
      if (!sessionId) {
        const session = await this.sessions.create(userId, { assistantMode });
        sessionId = session.id;
      }

      this.sessionManager.register(client, userId, sessionId, assistantMode);

      // Join a Socket.IO room scoped to this session
      await client.join(`session:${sessionId}`);

      const created: SessionCreatedEvent = {
        type: 'session.created',
        sessionId,
        userId,
        timestamp: Date.now(),
      };
      this.emit(client, created);

      this.metrics.increment(METRICS.WS_MESSAGES_SENT, { type: 'session.created' });
    } catch (err) {
      this.logger.error('session.start error', err instanceof Error ? err : new Error(String(err)));
      this.emitError(client, undefined, 'SESSION_START_ERROR', 'Oturum başlatılamadı');
    }
  }

  // ─── user.message ──────────────────────────────────────────────────────────

  @SubscribeMessage('user.message')
  async handleUserMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UserMessageEvent,
  ): Promise<void> {
    const session = this.sessionManager.getBySocketId(client.id);
    if (!session) {
      this.emitError(client, payload.sessionId, 'SESSION_NOT_FOUND', 'Önce session.start gönderin');
      return;
    }

    this.metrics.increment(METRICS.WS_MESSAGES_RECEIVED, { type: 'user.message' });

    // Abort any in-progress generation
    this.activeGenerations.get(client.id)?.abort();
    const controller = new AbortController();
    this.activeGenerations.set(client.id, controller);

    await this.conversation.handleMessage({
      userId: session.userId,
      sessionId: session.sessionId,
      messageId: payload.messageId,
      content: payload.content,
      assistantMode: session.assistantMode as import('@supperajan/types').AssistantMode,
      emit: (event) => this.emit(client, event),
    });

    this.activeGenerations.delete(client.id);
  }

  // ─── user.barge_in / assistant.interrupt ──────────────────────────────────

  @SubscribeMessage('user.barge_in')
  handleBargeIn(@ConnectedSocket() client: Socket): void {
    this.activeGenerations.get(client.id)?.abort();
    this.logger.debug('Barge-in received', { socketId: client.id });
  }

  @SubscribeMessage('assistant.interrupt')
  handleInterrupt(@ConnectedSocket() client: Socket): void {
    this.activeGenerations.get(client.id)?.abort();
  }

  // ─── assistant.feedback ────────────────────────────────────────────────────

  @SubscribeMessage('assistant.feedback')
  async handleFeedback(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: FeedbackEvent,
  ): Promise<void> {
    const session = this.sessionManager.getBySocketId(client.id);
    if (!session) return;
    // Feedback persistence wired in Phase 10 (analytics)
    this.logger.info('Feedback received', {
      userId: session.userId,
      messageId: payload.messageId,
      rating: String(payload.rating),
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private emit(client: Socket, event: ServerEvent): void {
    client.emit(event.type, event);
    this.metrics.increment(METRICS.WS_MESSAGES_SENT, { type: event.type });
  }

  private emitError(
    client: Socket,
    sessionId: string | undefined,
    code: string,
    message: string,
  ): void {
    const event: import('@supperajan/types').ErrorEvent = {
      type: 'error',
      sessionId,
      code,
      message,
      retryable: true,
      timestamp: Date.now(),
    };
    client.emit('error', event);
  }

  /** Broadcast an event to all clients in a session room. */
  broadcastToSession(sessionId: string, event: ServerEvent): void {
    this.server.to(`session:${sessionId}`).emit(event.type, event);
  }
}
