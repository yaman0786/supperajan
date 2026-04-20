import { Test, type TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service.js';
import { DatabaseService } from '../database/database.service.js';
import { LoggerService } from './logger.service.js';

const mockDb = {
  chatSession: { count: jest.fn() },
  chatMessage: { findMany: jest.fn(), count: jest.fn() },
  assistantStateSnapshot: { findMany: jest.fn() },
};

const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('getSessionStats', () => {
    it('returns correct aggregated stats', async () => {
      mockDb.chatSession.count.mockResolvedValue(5);
      mockDb.chatMessage.findMany.mockResolvedValue([
        { sessionId: 's1' }, { sessionId: 's1' }, { sessionId: 's2' }, { sessionId: 's2' }, { sessionId: 's2' },
      ]);

      const stats = await service.getSessionStats();
      expect(stats.totalSessions).toBe(5);
      expect(stats.totalMessages).toBe(5);
      expect(stats.activeSessions).toBe(2);
      expect(stats.avgMessagesPerSession).toBe(2.5);
    });

    it('returns zero stats when DB throws', async () => {
      mockDb.chatSession.count.mockRejectedValue(new Error('DB error'));
      const stats = await service.getSessionStats();
      expect(stats.totalSessions).toBe(0);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('getUsageStats', () => {
    it('calculates avg and p95 latency correctly', async () => {
      const messages = Array.from({ length: 10 }, (_, i) => ({
        tokensUsed: 100,
        latencyMs: (i + 1) * 100, // 100, 200, ..., 1000
      }));
      mockDb.chatMessage.findMany.mockResolvedValue(messages);
      mockDb.chatMessage.count.mockResolvedValue(8);
      mockDb.chatSession.count.mockResolvedValue(3);

      const stats = await service.getUsageStats();
      expect(stats.totalTokensUsed).toBe(1000);
      expect(stats.avgLatencyMs).toBe(550);
      expect(stats.p95LatencyMs).toBeGreaterThan(0);
      expect(stats.messagesLast24h).toBe(8);
      expect(stats.sessionsLast24h).toBe(3);
    });

    it('handles empty message list', async () => {
      mockDb.chatMessage.findMany.mockResolvedValue([]);
      mockDb.chatMessage.count.mockResolvedValue(0);
      mockDb.chatSession.count.mockResolvedValue(0);

      const stats = await service.getUsageStats();
      expect(stats.totalTokensUsed).toBe(0);
      expect(stats.avgLatencyMs).toBe(0);
    });
  });

  describe('getEmotionStats', () => {
    it('calculates correct distribution and most common', async () => {
      mockDb.assistantStateSnapshot.findMany.mockResolvedValue([
        { emotionState: 'happy' },
        { emotionState: 'happy' },
        { emotionState: 'curious' },
        { emotionState: 'happy' },
        { emotionState: 'idle' },
      ]);

      const stats = await service.getEmotionStats();
      expect(stats.mostCommon).toBe('happy');
      expect(stats.distribution['happy']).toBe(3);
      expect(stats.distribution['curious']).toBe(1);
      expect(stats.totalSnapshots).toBe(5);
    });

    it('returns idle as mostCommon for empty snapshots', async () => {
      mockDb.assistantStateSnapshot.findMany.mockResolvedValue([]);
      const stats = await service.getEmotionStats();
      expect(stats.mostCommon).toBe('idle');
      expect(stats.totalSnapshots).toBe(0);
    });
  });
});
