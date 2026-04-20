import { Test, type TestingModule } from '@nestjs/testing';
import { EmotionService } from './emotion.service.js';
import { DatabaseService } from '../database/database.service.js';
import { LoggerService } from '../common/logger.service.js';

const mockDb = {
  assistantStateSnapshot: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

describe('EmotionService', () => {
  let service: EmotionService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmotionService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<EmotionService>(EmotionService);
  });

  describe('snapshotEmotion', () => {
    it('creates a DB record with correct fields', async () => {
      mockDb.assistantStateSnapshot.create.mockResolvedValue({});

      await service.snapshotEmotion({
        sessionId: 'sess-1',
        messageId: 'msg-1',
        emotionState: 'happy',
        trigger: 'user:hello',
        timestamp: new Date(),
      });

      expect(mockDb.assistantStateSnapshot.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sessionId: 'sess-1',
          messageId: 'msg-1',
          emotionState: 'happy',
          trigger: 'user:hello',
        }),
      });
    });

    it('does not throw when DB create fails', async () => {
      mockDb.assistantStateSnapshot.create.mockRejectedValue(new Error('DB error'));

      await expect(
        service.snapshotEmotion({
          sessionId: 'sess-1',
          messageId: 'msg-1',
          emotionState: 'curious',
          trigger: 'user:test',
          timestamp: new Date(),
        }),
      ).resolves.toBeUndefined();

      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('getRecentEmotions', () => {
    it('returns emotion states in order', async () => {
      mockDb.assistantStateSnapshot.findMany.mockResolvedValue([
        { emotionState: 'happy' },
        { emotionState: 'curious' },
        { emotionState: 'excited' },
      ]);

      const result = await service.getRecentEmotions('sess-1', 3);
      expect(result).toEqual(['happy', 'curious', 'excited']);
    });

    it('returns empty array when no snapshots', async () => {
      mockDb.assistantStateSnapshot.findMany.mockResolvedValue([]);
      const result = await service.getRecentEmotions('sess-1');
      expect(result).toEqual([]);
    });

    it('returns empty array when DB throws', async () => {
      mockDb.assistantStateSnapshot.findMany.mockRejectedValue(new Error('DB error'));
      const result = await service.getRecentEmotions('sess-1');
      expect(result).toEqual([]);
    });
  });

  describe('analyzeConversationMood', () => {
    it('identifies dominant emotion correctly', async () => {
      mockDb.assistantStateSnapshot.findMany.mockResolvedValue([
        { emotionState: 'happy' },
        { emotionState: 'happy' },
        { emotionState: 'curious' },
        { emotionState: 'happy' },
      ]);

      const mood = await service.analyzeConversationMood('sess-1');
      expect(mood.dominant).toBe('happy');
    });

    it('returns idle dominant for empty history', async () => {
      mockDb.assistantStateSnapshot.findMany.mockResolvedValue([]);
      const mood = await service.analyzeConversationMood('sess-1');
      expect(mood.dominant).toBe('idle');
    });

    it('positivity score is between 0 and 1', async () => {
      mockDb.assistantStateSnapshot.findMany.mockResolvedValue([
        { emotionState: 'happy' },
        { emotionState: 'empathetic' },
        { emotionState: 'idle' },
      ]);

      const mood = await service.analyzeConversationMood('sess-1');
      expect(mood.positivityScore).toBeGreaterThanOrEqual(0);
      expect(mood.positivityScore).toBeLessThanOrEqual(1);
    });

    it('engagement score is between 0 and 1', async () => {
      mockDb.assistantStateSnapshot.findMany.mockResolvedValue([
        { emotionState: 'curious' },
        { emotionState: 'excited' },
      ]);

      const mood = await service.analyzeConversationMood('sess-1');
      expect(mood.engagementScore).toBeGreaterThanOrEqual(0);
      expect(mood.engagementScore).toBeLessThanOrEqual(1);
    });
  });

  describe('shouldTriggerReaction', () => {
    it('returns celebrate when transitioning to happy', () => {
      expect(service.shouldTriggerReaction('idle', 'happy')).toBe('celebrate');
    });

    it('returns energize when transitioning to excited', () => {
      expect(service.shouldTriggerReaction('idle', 'excited')).toBe('energize');
    });

    it('returns soften when transitioning to empathetic', () => {
      expect(service.shouldTriggerReaction('idle', 'empathetic')).toBe('soften');
    });

    it('returns startle when transitioning to surprised', () => {
      expect(service.shouldTriggerReaction('idle', 'surprised')).toBe('startle');
    });

    it('returns focus when transitioning to alert', () => {
      expect(service.shouldTriggerReaction('idle', 'alert')).toBe('focus');
    });

    it('returns null for same-state transition', () => {
      expect(service.shouldTriggerReaction('idle', 'idle')).toBeNull();
    });

    it('returns null for non-mapped target states', () => {
      expect(service.shouldTriggerReaction('happy', 'thinking')).toBeNull();
    });
  });
});
