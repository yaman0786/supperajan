import { Injectable } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service.js';
import { MessagesService } from '../messages/messages.service.js';
import { LLMService } from '../ai/llm.service.js';
import { AuthService } from '../auth/auth.service.js';
import { LoggerService } from '../common/logger.service.js';
import { MetricsService } from '../common/metrics.service.js';
import { METRICS } from '@supperajan/observability';
import type { LLMStreamChunk } from '@supperajan/types';
import type {
  AssistantThinkingEvent,
  AssistantResponseStartedEvent,
  AssistantResponseChunkEvent,
  AssistantResponseCompletedEvent,
  AssistantStateChangedEvent,
  ErrorEvent,
  ServerEvent,
} from '@supperajan/types';
import type { AssistantMode } from '@supperajan/types';

type EmitFn = (event: ServerEvent) => void;

export interface HandleMessageInput {
  userId: string;
  sessionId: string;
  messageId: string;
  content: string;
  assistantMode: AssistantMode;
  emit: EmitFn;
  abortSignal?: AbortSignal;
}

/**
 * Core conversation orchestrator for realtime interactions.
 *
 * Flow per user message:
 *  1. Ensure user exists (auto-bootstrap)
 *  2. Save user message to DB
 *  3. Emit assistant.thinking
 *  4. Fetch conversation history + memories (Phase 6)
 *  5. Stream LLM response — emit response_chunk per delta
 *  6. Save assistant message to DB
 *  7. Emit response_completed + state_changed
 *  8. Queue TTS (Phase 8)
 */
@Injectable()
export class ConversationService {
  constructor(
    private readonly sessions: SessionsService,
    private readonly messages: MessagesService,
    private readonly llm: LLMService,
    private readonly auth: AuthService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
  ) {}

  async handleMessage(input: HandleMessageInput): Promise<void> {
    const { userId, sessionId, messageId, content, assistantMode, emit, abortSignal } = input;
    const start = Date.now();

    try {
      // 1. Ensure user row exists
      await this.auth.ensureUserExists({ id: userId, email: `${userId}@dev.local`, role: 'USER' });

      // 2. Save user message
      await this.messages.saveUserMessage(sessionId, userId, content, messageId);

      // 3. Signal thinking
      const thinkingEvent: AssistantThinkingEvent = {
        type: 'assistant.thinking',
        sessionId,
        messageId,
        timestamp: Date.now(),
      };
      emit(thinkingEvent);

      const stateThinking: AssistantStateChangedEvent = {
        type: 'assistant.state_changed',
        sessionId,
        previousState: 'listening',
        newState: 'thinking',
        emotionState: 'thinking',
        timestamp: Date.now(),
      };
      emit(stateThinking);

      // 4. Fetch conversation history
      const recentHistory = await this.messages.getRecentHistory(sessionId, 20);

      // 5. Generate response (streaming)
      const assistantMessageId = crypto.randomUUID();
      let chunkIndex = 0;
      let fullContent = '';

      const responseStarted: AssistantResponseStartedEvent = {
        type: 'assistant.response_started',
        sessionId,
        messageId: assistantMessageId,
        timestamp: Date.now(),
      };
      emit(responseStarted);

      const stateSpeaking: AssistantStateChangedEvent = {
        type: 'assistant.state_changed',
        sessionId,
        previousState: 'thinking',
        newState: 'speaking',
        emotionState: 'speaking',
        timestamp: Date.now(),
      };
      emit(stateSpeaking);

      const result = await this.llm.generate({
        userId,
        sessionId,
        messageId: assistantMessageId,
        userMessage: content,
        assistantMode,
        recentHistory,
        abortSignal,
        onChunk: (chunk: LLMStreamChunk) => {
          fullContent += chunk.delta;
          const chunkEvent: AssistantResponseChunkEvent = {
            type: 'assistant.response_chunk',
            sessionId,
            messageId: assistantMessageId,
            chunk: chunk.delta,
            index: chunkIndex++,
            timestamp: Date.now(),
          };
          emit(chunkEvent);
          this.metrics.increment(METRICS.STREAM_CHUNKS);
        },
      });

      // 6. Save assistant message
      await this.messages.saveAssistantMessage(sessionId, result.content, {
        messageId: assistantMessageId,
        emotionState: result.emotionState,
        tokensUsed: result.usage.totalTokens,
        latencyMs: result.latencyMs,
        modelId: result.modelId,
      });

      // 7. Emit completion + state
      const latencyMs = Date.now() - start;

      const completed: AssistantResponseCompletedEvent = {
        type: 'assistant.response_completed',
        sessionId,
        messageId: assistantMessageId,
        fullContent: result.content,
        emotionState: result.emotionState,
        tokensUsed: result.usage.totalTokens,
        latencyMs,
        timestamp: Date.now(),
      };
      emit(completed);

      const stateIdle: AssistantStateChangedEvent = {
        type: 'assistant.state_changed',
        sessionId,
        previousState: 'speaking',
        newState: result.emotionState === 'happy' ? 'happy' : 'idle',
        emotionState: result.emotionState,
        timestamp: Date.now(),
      };
      emit(stateIdle);

      this.metrics.timing(METRICS.MESSAGE_LATENCY, latencyMs);
      this.logger.info('Conversation turn completed', { userId, sessionId, latencyMs });
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';

      if (isAbort) {
        const interrupted: import('@supperajan/types').AssistantInterruptedEvent = {
          type: 'assistant.interrupted',
          sessionId,
          messageId,
          timestamp: Date.now(),
        };
        emit(interrupted);

        const stateIdle: AssistantStateChangedEvent = {
          type: 'assistant.state_changed',
          sessionId,
          previousState: 'speaking',
          newState: 'idle',
          emotionState: 'idle',
          timestamp: Date.now(),
        };
        emit(stateIdle);
        return;
      }

      this.logger.error('Conversation error', err instanceof Error ? err : new Error(String(err)), {
        userId, sessionId,
      });

      const errorEvent: ErrorEvent = {
        type: 'error',
        sessionId,
        code: 'CONVERSATION_ERROR',
        message: 'Bir sorun oluştu. Lütfen tekrar deneyin.',
        retryable: true,
        timestamp: Date.now(),
      };
      emit(errorEvent);

      this.metrics.increment(METRICS.ERRORS_TOTAL, { type: 'conversation' });
    }
  }
}
