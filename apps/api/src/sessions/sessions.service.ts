import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { LoggerService } from '../common/logger.service.js';
import type { CreateSessionDto } from './dto/create-session.dto.js';
import type { ChatSession } from '@supperajan/types';
import { buildPaginationMeta, toPrismaSkipTake } from '../common/dto/pagination.dto.js';
import type { Pagination } from '@supperajan/types';

@Injectable()
export class SessionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  async create(userId: string, dto: CreateSessionDto): Promise<ChatSession> {
    const session = await this.db.chatSession.create({
      data: {
        userId,
        title: dto.title,
        assistantMode: dto.assistantMode ?? 'friendly',
      },
    });

    this.logger.info('Session created', { userId, sessionId: session.id });
    return this.toDomain(session);
  }

  async list(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{ items: ChatSession[]; pagination: Pagination }> {
    const { skip, take } = toPrismaSkipTake(page, pageSize);

    const [items, total] = await Promise.all([
      this.db.chatSession.findMany({
        where: { userId, endedAt: null },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
      this.db.chatSession.count({ where: { userId, endedAt: null } }),
    ]);

    return {
      items: items.map(this.toDomain),
      pagination: buildPaginationMeta(total, page, pageSize),
    };
  }

  async findOne(sessionId: string, userId: string): Promise<ChatSession> {
    const session = await this.db.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);
    return this.toDomain(session);
  }

  async end(sessionId: string, userId: string): Promise<void> {
    await this.findOne(sessionId, userId);
    await this.db.chatSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });
    this.logger.info('Session ended', { userId, sessionId });
  }

  async updateTitle(sessionId: string, userId: string, title: string): Promise<ChatSession> {
    await this.findOne(sessionId, userId);
    const updated = await this.db.chatSession.update({
      where: { id: sessionId },
      data: { title },
    });
    return this.toDomain(updated);
  }

  private toDomain(row: {
    id: string; userId: string; title: string | null;
    assistantMode: string; messageCount: number;
    createdAt: Date; updatedAt: Date; endedAt: Date | null;
  }): ChatSession {
    return {
      id: row.id,
      userId: row.userId,
      title: row.title ?? undefined,
      assistantMode: row.assistantMode,
      messageCount: row.messageCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      endedAt: row.endedAt ?? undefined,
    };
  }
}
