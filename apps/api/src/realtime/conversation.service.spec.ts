import { Test, type TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { MessagesService } from '../messages/messages.service.js';
import { LLMService } from '../ai/llm.service.js';
import { AuthService } from '../auth/auth.service.js';
import { LoggerService } from '../common/logger.service.js';
import { MetricsService } from '../common/metrics.service.js';
import { InMemoryMetrics } from '@supperajan/observability';

const mockSessions = { ensureSession: jest.fn() };
const mockMessages = {
  saveUserMessage: jest.fn(),
  saveAssistantMessage: jest.fn(),
  getRecentHistory: jest.fn().mockResolvedValue([]),
};
const mockLLM = {
  generate: jest.fn(),
};
const mockAuth = { ensureUserExists: jest.fn() };
const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };

class TestMetricsService extends MetricsService {
  readonly inner = new InMemoryMetrics();
  override increment(m: string, t?: Record<string, string>) { this.inner.increment(m, t); }
  override timing(m: string, v: number, t?: Record<string, string>) { this.inner.timing(m, v, t); }
}

function makeEmit() {
  const events: Array<{ type: string }> = [];
  const emit = jest.fn((e: { type: string }) => events.push(e));
  return { emit, events };
}

describe('ConversationService', () => {
  let service: ConversationService;
  let metricsService: TestMetricsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    metricsService = new TestMetricsService();

    mockLLM.generate.mockResolvedValue({
      content: 'Hello! How can I help?',
      emotionState: 'happy',
      usage: { totalTokens: 42 },
      latencyMs: 200,
      modelId: 'stub',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: SessionsService, useValue: mockSessions },
        { provide: MessagesService, useValue: mockMessages },
        { provide: LLMService, useValue: mockLLM },
        { provide: AuthService, useValue: mockAuth },
        { provide: LoggerService, useValue: mockLogger },
        { provide: MetricsService, useValue: metricsService },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
  });

  describe('handleMessage — happy path', () => {
    it('emits thinking → response_started → chunks → response_completed → state_changed', async () => {
      const { emit, events } = makeEmit();

      await service.handleMessage({
        userId: 'u1',
        sessionId: 's1',
        messageId: 'm1',
        content: 'Hello!',
        assistantMode: 'friendly' as const,
        emit,
      });

      const types = events.map((e) => e.type);
      expect(types).toContain('assistant.thinking');
      expect(types).toContain('assistant.response_started');
      expect(types).toContain('assistant.response_completed');
      expect(types).toContain('assistant.state_changed');
    });

    it('saves user and assistant messages', async () => {
      const { emit } = makeEmit();

      await service.handleMessage({
        userId: 'u1',
        sessionId: 's1',
        messageId: 'm1',
        content: 'Hello!',
        assistantMode: 'friendly' as const,
        emit,
      });

      expect(mockMessages.saveUserMessage).toHaveBeenCalledWith('s1', 'u1', 'Hello!', 'm1');
      expect(mockMessages.saveAssistantMessage).toHaveBeenCalledWith(
        's1',
        'Hello! How can I help?',
        expect.objectContaining({ emotionState: 'happy' }),
      );
    });

    it('records timing metric', async () => {
      const { emit } = makeEmit();

      await service.handleMessage({
        userId: 'u1',
        sessionId: 's1',
        messageId: 'm1',
        content: 'ping',
        assistantMode: 'friendly' as const,
        emit,
      });

      const timingCalls = metricsService.inner.calls.filter((c) => c.type === 'timing');
      expect(timingCalls.length).toBeGreaterThan(0);
    });
  });

  describe('handleMessage — abort', () => {
    it('emits assistant.interrupted when aborted', async () => {
      const controller = new AbortController();
      const { emit, events } = makeEmit();

      mockLLM.generate.mockRejectedValueOnce(
        Object.assign(new Error('AbortError'), { name: 'AbortError' }),
      );
      controller.abort();

      await service.handleMessage({
        userId: 'u1',
        sessionId: 's1',
        messageId: 'm1',
        content: 'hi',
        assistantMode: 'friendly' as const,
        emit,
        abortSignal: controller.signal,
      });

      const types = events.map((e) => e.type);
      expect(types).toContain('assistant.interrupted');
      expect(types).not.toContain('error');
    });
  });

  describe('handleMessage — error', () => {
    it('emits error event on unexpected exception', async () => {
      const { emit, events } = makeEmit();

      mockLLM.generate.mockRejectedValueOnce(new Error('Network failure'));

      await service.handleMessage({
        userId: 'u1',
        sessionId: 's1',
        messageId: 'm1',
        content: 'hi',
        assistantMode: 'friendly' as const,
        emit,
      });

      const types = events.map((e) => e.type);
      expect(types).toContain('error');
      const errorEvent = events.find((e) => e.type === 'error') as { code: string } | undefined;
      expect(errorEvent?.code).toBe('CONVERSATION_ERROR');
    });
  });
});
