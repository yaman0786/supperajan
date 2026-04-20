import { Injectable } from '@nestjs/common';
import type { IVectorStore } from '@supperajan/knowledge';
import type { RetrievalQuery, RetrievalResult } from '@supperajan/types';
import { DatabaseService } from '../database/database.service.js';
import { LoggerService } from '../common/logger.service.js';

interface ChunkRow {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  chunk_index: number;
  chunk_metadata: unknown;
  document_title: string | null;
  document_file_name: string;
  score: number;
}

/**
 * pgvector implementation of IVectorStore.
 * Uses Prisma $queryRaw/$executeRaw for embedding operations since
 * Prisma doesn't natively support the vector column type.
 *
 * Requires the pgvector extension and a migration that adds:
 *   ALTER TABLE "DocumentChunk" ADD COLUMN embedding vector(1536);
 *   CREATE INDEX ON "DocumentChunk" USING ivfflat (embedding vector_cosine_ops);
 */
@Injectable()
export class PgVectorStore implements IVectorStore {
  readonly providerId = 'pgvector';

  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  async upsertChunk(
    chunkId: string,
    _userId: string,
    embedding: number[],
    _metadata: Record<string, unknown>,
  ): Promise<void> {
    const vectorStr = `[${embedding.join(',')}]`;

    await this.db.$executeRaw`
      UPDATE "DocumentChunk"
      SET embedding = ${vectorStr}::vector
      WHERE id = ${chunkId}
    `;
  }

  async search(query: RetrievalQuery): Promise<RetrievalResult[]> {
    if (!query.queryEmbedding?.length) {
      this.logger.warn('PgVectorStore.search called without queryEmbedding');
      return [];
    }

    const vectorStr = `[${query.queryEmbedding.join(',')}]`;
    const topK = query.topK ?? 5;
    const minScore = query.minScore ?? 0.0;
    const userId = query.userId;

    let rows: ChunkRow[];

    if (query.documentIds?.length) {
      rows = await this.db.$queryRaw<ChunkRow[]>`
        SELECT
          dc.id,
          dc.document_id,
          dc.user_id,
          dc.content,
          dc.chunk_index,
          dc.chunk_metadata,
          d.title          AS document_title,
          d.file_name      AS document_file_name,
          1 - (dc.embedding <=> ${vectorStr}::vector) AS score
        FROM "DocumentChunk" dc
        JOIN "Document" d ON d.id = dc.document_id
        WHERE dc.user_id = ${userId}
          AND dc.document_id = ANY(${query.documentIds})
          AND dc.embedding IS NOT NULL
          AND 1 - (dc.embedding <=> ${vectorStr}::vector) >= ${minScore}
        ORDER BY dc.embedding <=> ${vectorStr}::vector
        LIMIT ${topK}
      `;
    } else {
      rows = await this.db.$queryRaw<ChunkRow[]>`
        SELECT
          dc.id,
          dc.document_id,
          dc.user_id,
          dc.content,
          dc.chunk_index,
          dc.chunk_metadata,
          d.title          AS document_title,
          d.file_name      AS document_file_name,
          1 - (dc.embedding <=> ${vectorStr}::vector) AS score
        FROM "DocumentChunk" dc
        JOIN "Document" d ON d.id = dc.document_id
        WHERE dc.user_id = ${userId}
          AND dc.embedding IS NOT NULL
          AND 1 - (dc.embedding <=> ${vectorStr}::vector) >= ${minScore}
        ORDER BY dc.embedding <=> ${vectorStr}::vector
        LIMIT ${topK}
      `;
    }

    return rows.map((row) => ({
      chunkId: row.id,
      documentId: row.document_id,
      userId: row.user_id,
      content: row.content,
      score: Number(row.score),
      metadata: (row.chunk_metadata as RetrievalResult['metadata']) ?? {},
      documentTitle: row.document_title ?? undefined,
      documentFileName: row.document_file_name,
    }));
  }

  async deleteByDocument(documentId: string, _userId: string): Promise<void> {
    await this.db.$executeRaw`
      UPDATE "DocumentChunk" SET embedding = NULL WHERE document_id = ${documentId}
    `;
  }

  async deleteChunk(chunkId: string): Promise<void> {
    await this.db.$executeRaw`
      UPDATE "DocumentChunk" SET embedding = NULL WHERE id = ${chunkId}
    `;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.db.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
