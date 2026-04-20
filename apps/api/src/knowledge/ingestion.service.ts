import { Injectable } from '@nestjs/common';
import { RecursiveChunkingStrategy } from '@supperajan/knowledge';
import type { IngestionJob } from '@supperajan/types';
import { DatabaseService } from '../database/database.service.js';
import { LLMService } from '../ai/llm.service.js';
import { LoggerService } from '../common/logger.service.js';
import { MetricsService } from '../common/metrics.service.js';
import { PgVectorStore } from './pg-vector.store.js';
import { TextParserService } from './text-parser.service.js';
import { METRICS } from '@supperajan/observability';

/**
 * Ingestion pipeline: parse → chunk → embed → store in pgvector.
 *
 * Pipeline per document:
 *  1. Update document status → PROCESSING
 *  2. Parse file content to text sections
 *  3. Chunk with RecursiveChunkingStrategy
 *  4. Upsert DocumentChunk rows in DB (without embedding)
 *  5. Embed each chunk via LLMService.embed()
 *  6. Update embedding in pgvector via PgVectorStore.upsertChunk()
 *  7. Update document status → READY, chunkCount
 */
@Injectable()
export class IngestionService {
  private readonly chunker = new RecursiveChunkingStrategy({ targetTokens: 400, overlapTokens: 50 });

  constructor(
    private readonly db: DatabaseService,
    private readonly parser: TextParserService,
    private readonly vectorStore: PgVectorStore,
    private readonly llm: LLMService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
  ) {}

  /**
   * Ingest a document from raw file buffer.
   * Runs synchronously in the request cycle for Phase 7 simplicity.
   * Phase 10 will move this to a background job queue.
   */
  async ingestDocument(
    documentId: string,
    userId: string,
    buffer: ArrayBuffer,
    fileName: string,
  ): Promise<void> {
    const start = Date.now();

    await this.db.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    });

    try {
      // 1. Parse
      const parsed = await this.parser.parse(buffer, fileName);
      const wordCount = parsed.content.split(/\s+/).filter(Boolean).length;

      // 2. Chunk
      const candidates = this.chunker.chunk(parsed.content, { documentId, fileName });

      if (candidates.length === 0) {
        throw new Error('No chunks produced — document may be empty');
      }

      // 3. Delete stale chunks from a previous ingestion
      await this.db.documentChunk.deleteMany({ where: { documentId } });

      // 4. Create chunk DB records
      const chunkRecords = await Promise.all(
        candidates.map((c, i) =>
          this.db.documentChunk.create({
            data: {
              documentId,
              userId,
              content: c.content,
              chunkIndex: i,
              tokenCount: c.tokenCount,
              chunkMetadata: c.metadata as never,
            },
          }),
        ),
      );

      await this.db.document.update({
        where: { id: documentId },
        data: { status: 'INGESTING', chunkCount: chunkRecords.length },
      });

      // 5. Embed + store — per chunk
      let embeddedCount = 0;
      for (const chunk of chunkRecords) {
        try {
          const result = await this.llm.embed(chunk.content);
          if (result.embedding.length > 0) {
            await this.vectorStore.upsertChunk(chunk.id, userId, result.embedding, {
              documentId,
              chunkIndex: chunk.chunkIndex,
            });
            embeddedCount++;
          }
        } catch (embedErr) {
          this.logger.warn('Chunk embedding failed', {
            chunkId: chunk.id,
            error: String(embedErr),
          });
        }
      }

      // 6. Mark ready
      await this.db.document.update({
        where: { id: documentId },
        data: {
          status: 'READY',
          chunkCount: chunkRecords.length,
          docMetadata: {
            wordCount,
            extractedTitle: parsed.title ?? fileName,
          },
        },
      });

      const latencyMs = Date.now() - start;
      this.metrics.timing(METRICS.MESSAGE_LATENCY, latencyMs, { type: 'ingestion' });
      this.logger.info('Document ingested', {
        documentId,
        userId,
        chunks: String(chunkRecords.length),
        embedded: String(embeddedCount),
        latencyMs: String(latencyMs),
      });
    } catch (err) {
      await this.db.document.update({
        where: { id: documentId },
        data: {
          status: 'FAILED',
          processingError: err instanceof Error ? err.message : String(err),
        },
      });
      this.logger.error(
        'Document ingestion failed',
        err instanceof Error ? err : new Error(String(err)),
        { documentId, userId },
      );
      throw err;
    }
  }
}
