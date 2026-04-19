import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { LoggerService } from '../common/logger.service.js';
import { MetricsService } from '../common/metrics.service.js';
import { METRICS } from '@supperajan/observability';
import { buildPaginationMeta, toPrismaSkipTake } from '../common/dto/pagination.dto.js';
import type { ChatMessage, Pagination } from '@supperajan/types';

@Injectable()
export class MessagesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
  ) {}

  async list(
    sessionId: string,
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{ items: ChatMessage[]; pagination: Pagination }> {
    // Verify session ownership
    const session = await this.db.chatSession.findFirst({ where: { id: sessionId, userId } });
    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

    const { skip, take } = toPrismaSkipTake(page, pageSize);
    const [rows, total] = await Promise.all([
      this.db.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      this.db.chatMessage.count({ where: { sessionId } }),
    ]);

    return {
      items: rows.map(this.toDomain),
      pagination: buildPaginationMeta(total, page, pageSize),
    };
  }

  async saveUserMessage(
    sessionId: string,
    userId: string,
    content: string,
    messageId?: string,
  ): Promise<ChatMessage> {
    const msg = await this.db.chatMessage.create({
      data: {
        id: messageId,
        sessionId,
        role: 'USER',
        content,
        status: 'COMPLETED',
      },
    });

    await this.db.chatSession.update({
      where: { id: sessionId },
      data: { messageCount: { increment: 1 }, updatedAt: new Date() },
    });

    this.metrics.increment(METRICS.MESSAGES_TOTAL, { role: 'user' });
    return this.toDomain(msg);
  }

  async saveAssistantMessage(
    sessionId: string,
    content: string,
    opts: {
      messageId?: string;
      emotionState?: string;
      tokensUsed?: number;
      latencyMs?: number;
      modelId?: string;
    } = {},
  ): Promise<ChatMessage> {
    const msg = await this.db.chatMessage.create({
      data: {
        id: opts.messageId,
        sessionId,
        role: 'ASSISTANT',
        content,
        status: 'COMPLETED',
        emotionState: opts.emotionState,
        tokensUsed: opts.tokensUsed,
        latencyMs: opts.latencyMs,
        modelId: opts.modelId,
      },
    });

    await this.db.chatSession.update({
      where: { id: sessionId },
      data: { messageCount: { increment: 1 }, updatedAt: new Date() },
    });

    this.metrics.increment(METRICS.MESSAGES_TOTAL, { role: 'assistant' });
    if (opts.latencyMs) {
      this.metrics.timing(METRICS.MESSAGE_LATENCY, opts.latencyMs);
    }

    return this.toDomain(msg);
  }

  async getRecentHistory(
    sessionId: string,
    limit = 20,
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
    const rows = await this.db.chatMessage.findMany({
      where: {
        sessionId,
        role: { in: ['USER', 'ASSISTANT'] },
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { role: true, content: true },
    });

    return rows
      .reverse()
      .map((r) => ({ role: r.role.toLowerCase() as 'user' | 'assistant', content: r.content }));
  }

  private toDomain(row: {
    id: string; sessionId: string; role: string; content: string;
    status: string; emotionState: string | null; tokensUsed: number | null;
    latencyMs: number | null; modelId: string | null;
    createdAt: Date; updatedAt: Date; metadata?: unknown;
  }): ChatMessage {
    return {
      id: row.id,
      sessionId: row.sessionId,
      role: row.role.toLowerCase() as ChatMessage['role'],
      content: row.content,
      status: row.status.toLowerCase() as ChatMessage['status'],
      metadata: {
        emotionState: (row.emotionState ?? undefined) as ChatMessage['metadata'] extends infer M ? M extends object ? M['emotionState'] : never : never,
        tokensUsed: row.tokensUsed ?? undefined,
        latencyMs: row.latencyMs ?? undefined,
        modelId: row.modelId ?? undefined,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
