import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { LoggerService } from './logger.service.js';

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  avgMessagesPerSession: number;
  totalMessages: number;
}

export interface UsageStats {
  totalTokensUsed: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  messagesLast24h: number;
  sessionsLast24h: number;
}

export interface EmotionStats {
  distribution: Record<string, number>;
  mostCommon: string;
  totalSnapshots: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  async getSessionStats(userId?: string): Promise<SessionStats> {
    try {
      const where = userId ? { userId } : {};

      const [totalSessions, messages] = await Promise.all([
        this.db.chatSession.count({ where }),
        this.db.chatMessage.findMany({
          where: userId ? { session: { userId } } : {},
          select: { sessionId: true },
        }),
      ]);

      const totalMessages = messages.length;
      const uniqueSessions = new Set(messages.map((m) => m.sessionId)).size;
      const avgMessagesPerSession = uniqueSessions > 0 ? totalMessages / uniqueSessions : 0;

      return {
        totalSessions,
        activeSessions: uniqueSessions,
        avgMessagesPerSession: Math.round(avgMessagesPerSession * 10) / 10,
        totalMessages,
      };
    } catch (err) {
      this.logger.warn('AnalyticsService.getSessionStats failed', { error: String(err) });
      return { totalSessions: 0, activeSessions: 0, avgMessagesPerSession: 0, totalMessages: 0 };
    }
  }

  async getUsageStats(userId?: string): Promise<UsageStats> {
    try {
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const where = userId ? { session: { userId } } : {};

      const [allMessages, recentMessages, recentSessions] = await Promise.all([
        this.db.chatMessage.findMany({
          where: { ...where, role: 'ASSISTANT' },
          select: { tokensUsed: true, latencyMs: true },
        }),
        this.db.chatMessage.count({
          where: { ...where, createdAt: { gte: since24h } },
        }),
        this.db.chatSession.count({
          where: userId
            ? { userId, createdAt: { gte: since24h } }
            : { createdAt: { gte: since24h } },
        }),
      ]);

      const totalTokensUsed = allMessages.reduce((sum, m) => sum + (m.tokensUsed ?? 0), 0);
      const latencies = allMessages
        .map((m) => m.latencyMs ?? 0)
        .filter((l) => l > 0)
        .sort((a, b) => a - b);

      const avgLatencyMs =
        latencies.length > 0
          ? Math.round(latencies.reduce((s, v) => s + v, 0) / latencies.length)
          : 0;

      const p95Index = Math.floor(latencies.length * 0.95);
      const p95LatencyMs = latencies[p95Index] ?? 0;

      return {
        totalTokensUsed,
        avgLatencyMs,
        p95LatencyMs,
        messagesLast24h: recentMessages,
        sessionsLast24h: recentSessions,
      };
    } catch (err) {
      this.logger.warn('AnalyticsService.getUsageStats failed', { error: String(err) });
      return { totalTokensUsed: 0, avgLatencyMs: 0, p95LatencyMs: 0, messagesLast24h: 0, sessionsLast24h: 0 };
    }
  }

  async getEmotionStats(userId?: string): Promise<EmotionStats> {
    try {
      const snapshots = await this.db.assistantStateSnapshot.findMany({
        where: userId ? { session: { userId } } : {},
        select: { emotionState: true },
      });

      if (snapshots.length === 0) {
        return { distribution: {}, mostCommon: 'idle', totalSnapshots: 0 };
      }

      const distribution: Record<string, number> = {};
      for (const { emotionState } of snapshots) {
        if (emotionState) {
          distribution[emotionState] = (distribution[emotionState] ?? 0) + 1;
        }
      }

      const mostCommon = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'idle';

      return { distribution, mostCommon, totalSnapshots: snapshots.length };
    } catch (err) {
      this.logger.warn('AnalyticsService.getEmotionStats failed', { error: String(err) });
      return { distribution: {}, mostCommon: 'idle', totalSnapshots: 0 };
    }
  }
}
