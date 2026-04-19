import { Injectable, OnModuleInit } from '@nestjs/common';
import type { ILLMProvider, LLMMessage, LLMGenerationOptions, LLMStreamChunk } from '@supperajan/ai/providers';
import { buildPrompt, inferEmotion } from '@supperajan/ai/orchestration';
import type { EmotionState, AssistantMode, LLMResponse, LLMUsage } from '@supperajan/types';
import { OpenAIProvider } from './openai.provider.js';
import { LoggerService } from '../common/logger.service.js';
import { MetricsService } from '../common/metrics.service.js';
import { METRICS } from '@supperajan/observability';

export interface GenerateOptions {
  userId: string;
  sessionId: string;
  messageId: string;
  userMessage: string;
  assistantMode: AssistantMode;
  memories?: string[];
  retrievedContext?: string;
  recentHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  onChunk?: (chunk: LLMStreamChunk) => void;
}

export interface GenerateResult {
  content: string;
  emotionState: EmotionState;
  usage: LLMUsage;
  latencyMs: number;
  modelId: string;
}

@Injectable()
export class LLMService implements OnModuleInit {
  private provider!: ILLMProvider;

  constructor(
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
  ) {}

  onModuleInit(): void {
    const providerType = process.env['LLM_PROVIDER'] ?? 'openai';

    if (providerType === 'openai') {
      this.provider = new OpenAIProvider({
        apiKey: process.env['OPENAI_API_KEY'] ?? '',
        baseUrl: process.env['OPENAI_BASE_URL'] ?? 'https://api.openai.com/v1',
        model: process.env['OPENAI_MODEL'] ?? 'gpt-4o',
      });
    } else {
      // Future: Anthropic, Google, local — same interface
      this.logger.warn(`Unknown LLM provider "${providerType}", falling back to stub`);
      this.provider = this.buildStubProvider();
    }

    this.logger.info(`LLM provider initialized: ${this.provider.providerId}`);
  }

  async generate(opts: GenerateOptions): Promise<GenerateResult> {
    const start = Date.now();
    const messages = buildPrompt(opts.userMessage, {
      assistantMode: opts.assistantMode,
      memories: opts.memories,
      retrievedContext: opts.retrievedContext,
      recentHistory: opts.recentHistory,
      currentDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      }),
    });

    this.metrics.increment(METRICS.LLM_REQUESTS, { provider: this.provider.providerId });

    let fullContent = '';

    if (opts.onChunk) {
      // Streaming mode
      for await (const chunk of this.provider.generateStream(messages, { stream: true }, opts.onChunk)) {
        fullContent += chunk.delta;
      }

      const latencyMs = Date.now() - start;
      const emotionState = inferEmotion({ userMessage: opts.userMessage, assistantResponse: fullContent });

      this.metrics.timing(METRICS.LLM_LATENCY, latencyMs, { provider: this.provider.providerId });

      return {
        content: fullContent,
        emotionState,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        latencyMs,
        modelId: this.provider.providerId,
      };
    }

    // Non-streaming mode
    const response = await this.provider.generate(messages);
    const latencyMs = Date.now() - start;
    const emotionState = inferEmotion({ userMessage: opts.userMessage, assistantResponse: response.content });

    this.metrics.timing(METRICS.LLM_LATENCY, latencyMs, { provider: this.provider.providerId });
    this.metrics.histogram(METRICS.LLM_TOKENS_USED, response.usage.totalTokens, { provider: this.provider.providerId });

    return {
      content: response.content,
      emotionState,
      usage: response.usage,
      latencyMs,
      modelId: response.model,
    };
  }

  async healthCheck(): Promise<boolean> {
    return this.provider.healthCheck();
  }

  private buildStubProvider(): ILLMProvider {
    return {
      providerId: 'stub',
      supportedModels: [],
      async generate(_messages: LLMMessage[], _opts?: LLMGenerationOptions): Promise<LLMResponse> {
        return {
          content: 'Merhaba! Ben Süpperajan. LLM sağlayıcısı henüz yapılandırılmadı. Lütfen OPENAI_API_KEY ortam değişkenini ayarlayın.',
          finishReason: 'stop',
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          model: 'stub',
          latencyMs: 10,
        };
      },
      async *generateStream(_messages: LLMMessage[], _opts?: LLMGenerationOptions, onChunk?: (c: LLMStreamChunk) => void): AsyncGenerator<LLMStreamChunk> {
        const text = 'LLM sağlayıcısı yapılandırılmadı. .env dosyasına OPENAI_API_KEY ekleyin.';
        for (let i = 0; i < text.length; i++) {
          const chunk: LLMStreamChunk = { delta: text[i] ?? '', index: i };
          onChunk?.(chunk);
          yield chunk;
          await new Promise(r => setTimeout(r, 20));
        }
      },
      async embed(_text: string): Promise<import('@supperajan/types').EmbeddingResult> {
        return { embedding: [], model: 'stub', tokenCount: 0 };
      },
      async healthCheck(): Promise<boolean> { return true; },
    };
  }
}
