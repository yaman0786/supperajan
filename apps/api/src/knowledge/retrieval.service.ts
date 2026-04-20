import { Injectable } from '@nestjs/common';
import type { RetrievalResult } from '@supperajan/types';
import { DatabaseService } from '../database/database.service.js';
import { LLMService } from '../ai/llm.service.js';
import { LoggerService } from '../common/logger.service.js';
import { PgVectorStore } from './pg-vector.store.js';

export interface RetrieveOptions {
  topK?: number;
  minScore?: number;
  documentIds?: string[];
  sessionId?: string;
  messageId?: string;
}

/**
 * RAG retrieval service.
 * Embeds the query, searches pgvector, formats context for prompt injection,
 * and logs the retrieval event for analytics.
 */
@Injectable()
export class RetrievalService {
  constructor(
    private readonly db: DatabaseService,
    private readonly vectorStore: PgVectorStore,
    private readonly llm: LLMService,
    private readonly logger: LoggerService,
  ) {}

  async retrieve(
    userId: string,
    queryText: string,
    opts: RetrieveOptions = {},
  ): Promise<RetrievalResult[]> {
    const start = Date.now();
    const topK = opts.topK ?? 5;

    try {
      // 1. Embed the query
      const { embedding } = await this.llm.embed(queryText);
      if (embedding.length === 0) {
        this.logger.warn('Empty embedding returned for retrieval query');
        return [];
      }

      // 2. Vector search
      const results = await this.vectorStore.search({
        userId,
        queryText,
        queryEmbedding: embedding,
        topK,
        minScore: opts.minScore ?? 0.3,
        documentIds: opts.documentIds,
      });

      // 3. Log retrieval event
      const latencyMs = Date.now() - start;
      if (opts.sessionId) {
        this.db.retrievalLog.create({
          data: {
            sessionId: opts.sessionId,
            userId,
            queryText: queryText.slice(0, 500),
            resultsCount: results.length,
            topScore: results[0]?.score ?? 0,
            latencyMs,
          },
        }).catch(() => {}); // fire-and-forget
      }

      this.logger.debug('Retrieval completed', {
        userId,
        resultsCount: String(results.length),
        topScore: String(results[0]?.score ?? 0),
        latencyMs: String(latencyMs),
      });

      return results;
    } catch (err) {
      this.logger.warn('Retrieval failed — returning empty context', {
        error: String(err),
      });
      return [];
    }
  }

  /** Format retrieval results into a context block for prompt injection. */
  formatForPrompt(results: RetrievalResult[]): string {
    if (results.length === 0) return '';

    const sections = results.map((r, i) => {
      const source = r.documentTitle ?? r.documentFileName ?? `Source ${i + 1}`;
      const score = (r.score * 100).toFixed(0);
      return `[${source} — ${score}% relevance]\n${r.content}`;
    });

    return sections.join('\n\n---\n\n');
  }

  /** Check if user has any ready documents to enable RAG. */
  async hasReadyDocuments(userId: string): Promise<boolean> {
    const count = await this.db.document.count({
      where: { userId, status: 'READY' },
    });
    return count > 0;
  }
}
