export type DocumentStatus =
  | 'uploading'
  | 'processing'
  | 'ingesting'
  | 'ready'
  | 'failed'
  | 'deleted';

export type DocumentType = 'pdf' | 'docx' | 'txt' | 'md' | 'json' | 'csv' | 'html' | 'audio_transcript';

export interface Document {
  id: string;
  userId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  status: DocumentStatus;
  title?: string;
  description?: string;
  chunkCount: number;
  storageKey: string;
  processingError?: string;
  metadata: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface DocumentMetadata {
  pageCount?: number;
  wordCount?: number;
  language?: string;
  author?: string;
  createdDate?: string;
  extractedTitle?: string;
  tags?: string[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  embedding?: number[];
  metadata: ChunkMetadata;
  createdAt: Date;
}

export interface ChunkMetadata {
  pageNumber?: number;
  sectionTitle?: string;
  startOffset?: number;
  endOffset?: number;
}

export interface RetrievalQuery {
  userId: string;
  queryText: string;
  queryEmbedding?: number[];
  topK?: number;
  minScore?: number;
  documentIds?: string[];
  includeMetadata?: boolean;
}

export interface RetrievalResult {
  chunkId: string;
  documentId: string;
  userId: string;
  content: string;
  score: number;
  metadata: ChunkMetadata;
  documentTitle?: string;
  documentFileName?: string;
}

export interface IngestionJob {
  id: string;
  documentId: string;
  userId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  chunksProcessed: number;
  totalChunks?: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}
