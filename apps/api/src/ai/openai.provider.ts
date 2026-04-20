import type { ILLMProvider } from '@supperajan/ai';
import type {
  LLMMessage,
  LLMGenerationOptions,
  LLMResponse,
  LLMStreamChunk,
  EmbeddingResult,
} from '@supperajan/types';

/**
 * OpenAI LLM provider implementation.
 * Uses the OpenAI REST API directly (no SDK dependency) for minimal bundle impact.
 * Implements ILLMProvider — swap with Anthropic/Google/local by injecting a different class.
 */
export class OpenAIProvider implements ILLMProvider {
  readonly providerId = 'openai';
  readonly supportedModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor(opts: { apiKey: string; baseUrl?: string; model?: string }) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl ?? 'https://api.openai.com/v1';
    this.defaultModel = opts.model ?? 'gpt-4o';
  }

  async generate(messages: LLMMessage[], options: LLMGenerationOptions = {}): Promise<LLMResponse> {
    const start = Date.now();
    const body = {
      model: options.model ?? this.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      stream: false,
      ...(options.tools ? { tools: options.tools } : {}),
    };

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${err}`);
    }

    const json = await res.json() as {
      choices: Array<{
        message: { content: string; tool_calls?: unknown[] };
        finish_reason: string;
      }>;
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      model: string;
    };

    const choice = json.choices[0];
    if (!choice) throw new Error('No choices returned from OpenAI');

    return {
      content: choice.message.content ?? '',
      finishReason: choice.finish_reason as LLMResponse['finishReason'],
      usage: {
        promptTokens: json.usage.prompt_tokens,
        completionTokens: json.usage.completion_tokens,
        totalTokens: json.usage.total_tokens,
      },
      model: json.model,
      latencyMs: Date.now() - start,
    };
  }

  async *generateStream(
    messages: LLMMessage[],
    options: LLMGenerationOptions = {},
    onChunk?: (chunk: LLMStreamChunk) => void,
    abortSignal?: AbortSignal,
  ): AsyncGenerator<LLMStreamChunk> {
    const body = {
      model: options.model ?? this.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      stream: true,
    };

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: abortSignal,
    });

    if (!res.ok || !res.body) {
      throw new Error(`OpenAI stream error ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let index = 0;
    let buffer = '';

    try {
      while (true) {
        if (abortSignal?.aborted) break;

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data) as {
              choices: Array<{
                delta?: { content?: string };
                finish_reason?: string;
              }>;
            };
            const delta = parsed.choices[0]?.delta?.content ?? '';
            const finishReason = parsed.choices[0]?.finish_reason ?? undefined;

            if (delta || finishReason) {
              const chunk: LLMStreamChunk = { delta, index: index++, finishReason };
              onChunk?.(chunk);
              yield chunk;
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch (err) {
      // Swallow abort errors — barge-in is expected
      if ((err as Error).name !== 'AbortError') throw err;
    } finally {
      reader.releaseLock();
    }
  }

  async embed(text: string, _model?: string): Promise<EmbeddingResult> {
    const res = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI embeddings error ${res.status}`);
    const json = await res.json() as {
      data: Array<{ embedding: number[] }>;
      usage: { total_tokens: number };
      model: string;
    };

    return {
      embedding: json.data[0]?.embedding ?? [],
      model: json.model,
      tokenCount: json.usage.total_tokens,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
