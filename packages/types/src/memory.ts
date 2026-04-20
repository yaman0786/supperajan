export type MemoryType =
  | 'episodic'
  | 'semantic'
  | 'preference'
  | 'fact'
  | 'instruction'
  | 'relationship';

export type MemoryVisibility = 'private' | 'session' | 'permanent';
export type MemoryStatus = 'active' | 'archived' | 'deleted' | 'pending_review';

export interface Memory {
  id: string;
  userId: string;
  type: MemoryType;
  content: string;
  summary?: string;
  importance: number;
  confidence: number;
  visibility: MemoryVisibility;
  status: MemoryStatus;
  sourceSessionId?: string;
  sourceMessageId?: string;
  tags: string[];
  metadata: MemoryMetadata;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  lastAccessedAt?: Date;
  accessCount: number;
}

export interface MemoryMetadata {
  source: 'conversation' | 'explicit' | 'inferred' | 'admin';
  inferenceReason?: string;
  relatedMemoryIds?: string[];
  emotionalContext?: string;
  isVerified: boolean;
}

export interface MemoryEvent {
  id: string;
  memoryId: string;
  userId: string;
  operation: 'created' | 'updated' | 'accessed' | 'deleted' | 'archived';
  sessionId?: string;
  reason: string;
  previousValue?: string;
  newValue?: string;
  createdAt: Date;
}

export interface MemoryQuery {
  userId: string;
  queryText?: string;
  types?: MemoryType[];
  tags?: string[];
  minImportance?: number;
  minConfidence?: number;
  limit?: number;
  sessionId?: string;
}

export interface MemoryWriteRequest {
  userId: string;
  content: string;
  type: MemoryType;
  importance?: number;
  confidence?: number;
  visibility?: MemoryVisibility;
  tags?: string[];
  sourceSessionId?: string;
  sourceMessageId?: string;
  metadata?: Partial<MemoryMetadata>;
}

export interface MemoryRetrievalResult {
  memory: Memory;
  relevanceScore: number;
  retrievalReason: string;
}
