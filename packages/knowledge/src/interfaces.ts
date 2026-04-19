import type {
  Document,
  DocumentChunk,
  RetrievalQuery,
  RetrievalResult,
  IngestionJob,
} from '@supperajan/types';

/**
 * Vector store interface — provider-agnostic.
 * Implementations: pgvector (default), Qdrant (production scale).
 */
export interface IVectorStore {
  readonly providerId: string;

  /** Upsert a chunk with its embedding vector */
  upsertChunk(
    chunkId: string,
    userId: string,
    embedding: number[],
    metadata: Record<string, unknown>,
  ): Promise<void>;

  /** Similarity search by embedding vector */
  search(query: RetrievalQuery): Promise<RetrievalResult[]>;

  /** Delete all chunks for a document */
  deleteByDocument(documentId: string, userId: string): Promise<void>;

  /** Delete a single chunk */
  deleteChunk(chunkId: string): Promise<void>;

  /** Health check */
  healthCheck(): Promise<boolean>;
}

/**
 * Document parser interface.
 * One implementation per supported file type.
 */
export interface IDocumentParser {
  readonly supportedMimeTypes: string[];
  parse(buffer: ArrayBuffer, fileName: string): Promise<ParsedDocument>;
}

export interface ParsedDocument {
  title?: string;
  content: string;
  sections: ParsedSection[];
  metadata: Record<string, unknown>;
}

export interface ParsedSection {
  heading?: string;
  content: string;
  pageNumber?: number;
}

/**
 * Chunking strategy interface.
 * Determines how parsed document content is split into retrieval units.
 */
export interface IChunkingStrategy {
  chunk(content: string, metadata?: Record<string, unknown>): ChunkCandidate[];
}

export interface ChunkCandidate {
  content: string;
  tokenCount: number;
  metadata: Record<string, unknown>;
}

/**
 * Knowledge manager — high-level service used by the orchestration layer.
 */
export interface IKnowledgeManager {
  /** Submit a document for ingestion */
  ingestDocument(documentId: string, userId: string): Promise<IngestionJob>;

  /** Retrieve chunks relevant to a query */
  retrieve(userId: string, queryText: string, options?: RetrievalOptions): Promise<RetrievalResult[]>;

  /** Format retrieval results into a context string for prompt injection */
  formatForPrompt(results: RetrievalResult[]): string;

  /** Delete all knowledge for a document */
  deleteDocument(documentId: string, userId: string): Promise<void>;

  /** Get ingestion job status */
  getJobStatus(jobId: string): Promise<IngestionJob | null>;
}

export interface RetrievalOptions {
  topK?: number;
  minScore?: number;
  documentIds?: string[];
}
