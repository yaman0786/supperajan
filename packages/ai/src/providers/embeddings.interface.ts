import type { EmbeddingResult } from '@supperajan/types';

/**
 * Provider-agnostic embeddings interface.
 * Used by the knowledge/RAG subsystem for document ingestion and retrieval.
 */
export interface IEmbeddingsProvider {
  readonly providerId: string;
  readonly defaultModel: string;
  readonly dimensions: number;

  /** Embed a single string */
  embed(text: string): Promise<EmbeddingResult>;

  /** Batch embed — more efficient for ingestion pipelines */
  embedBatch(texts: string[]): Promise<EmbeddingResult[]>;

  /** Health check */
  healthCheck(): Promise<boolean>;
}
