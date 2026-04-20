import type {
  LLMMessage,
  LLMGenerationOptions,
  LLMResponse,
  LLMStreamChunk,
  EmbeddingResult,
} from '@supperajan/types';

/**
 * Provider-agnostic LLM interface.
 * All provider implementations (OpenAI, Anthropic, Google, local) must satisfy this contract.
 * Swap providers by injecting a different implementation — no call-site changes needed.
 */
export interface ILLMProvider {
  readonly providerId: string;
  readonly supportedModels: string[];

  /** Non-streaming generation */
  generate(messages: LLMMessage[], options?: LLMGenerationOptions): Promise<LLMResponse>;

  /** Streaming generation — yields chunks until done or signal aborted */
  generateStream(
    messages: LLMMessage[],
    options?: LLMGenerationOptions,
    onChunk?: (chunk: LLMStreamChunk) => void,
    abortSignal?: AbortSignal,
  ): AsyncGenerator<LLMStreamChunk>;

  /** Generate embeddings for text */
  embed(text: string, model?: string): Promise<EmbeddingResult>;

  /** Health check — returns true if provider is reachable */
  healthCheck(): Promise<boolean>;
}

export interface LLMProviderFactory {
  create(config: Record<string, unknown>): ILLMProvider;
}
