import type {
  Memory,
  MemoryWriteRequest,
  MemoryQuery,
  MemoryRetrievalResult,
  MemoryEvent,
} from '@supperajan/types';

/**
 * Core memory store interface.
 * Implementations must be backed by the database layer.
 * Exposed to the orchestration layer via dependency injection.
 */
export interface IMemoryStore {
  write(request: MemoryWriteRequest): Promise<Memory>;
  retrieve(query: MemoryQuery): Promise<MemoryRetrievalResult[]>;
  getById(id: string, userId: string): Promise<Memory | null>;
  update(id: string, userId: string, patch: Partial<MemoryWriteRequest>): Promise<Memory>;
  delete(id: string, userId: string, reason: string): Promise<void>;
  archive(id: string, userId: string, reason: string): Promise<void>;
  getHistory(memoryId: string): Promise<MemoryEvent[]>;
}

/**
 * Memory manager — higher-level service used by the orchestration layer.
 * Applies write rules, retrieval ranking, and tracks audit events.
 */
export interface IMemoryManager {
  /**
   * Retrieve memories relevant to a conversation turn.
   * Applies importance/confidence thresholds and recency weighting.
   */
  retrieveForContext(userId: string, queryText: string, sessionId?: string): Promise<MemoryRetrievalResult[]>;

  /**
   * Conditionally write a memory extracted from a conversation turn.
   * Applies write rules — will refuse writes that violate policy.
   */
  maybeWrite(request: MemoryWriteRequest): Promise<Memory | null>;

  /**
   * Format memories as a string array for prompt injection.
   */
  formatForPrompt(memories: MemoryRetrievalResult[]): string[];

  /**
   * List all active memories for a user (for the memory management UI).
   */
  listUserMemories(userId: string, page: number, pageSize: number): Promise<Memory[]>;

  /**
   * Delete a memory (with audit trail).
   */
  deleteMemory(id: string, userId: string): Promise<void>;

  /**
   * Update memory content (with audit trail).
   */
  updateMemory(id: string, userId: string, patch: Partial<MemoryWriteRequest>): Promise<Memory>;
}
