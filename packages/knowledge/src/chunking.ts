import type { IChunkingStrategy, ChunkCandidate } from './interfaces.js';

export interface ChunkingConfig {
  targetTokens: number;
  overlapTokens: number;
  minTokens: number;
  separators: string[];
}

export const DEFAULT_CHUNKING_CONFIG: ChunkingConfig = {
  targetTokens: 512,
  overlapTokens: 64,
  minTokens: 32,
  separators: ['\n\n', '\n', '. ', '! ', '? ', ', ', ' '],
};

/**
 * Recursive character-based chunking strategy.
 * Splits on separators in priority order, attempting to stay near targetTokens.
 * Adds overlap between chunks to preserve context across boundaries.
 *
 * This is a proven, simple approach suitable for Phase 1.
 * Phase 7 will extend this with semantic-aware chunking.
 */
export class RecursiveChunkingStrategy implements IChunkingStrategy {
  private config: ChunkingConfig;

  constructor(config: Partial<ChunkingConfig> = {}) {
    this.config = { ...DEFAULT_CHUNKING_CONFIG, ...config };
  }

  chunk(content: string, metadata: Record<string, unknown> = {}): ChunkCandidate[] {
    const raw = this.splitRecursive(content, this.config.separators);
    const merged = this.mergeSmallChunks(raw);
    const withOverlap = this.addOverlap(merged);

    return withOverlap
      .filter((c) => estimateTokens(c) >= this.config.minTokens)
      .map((c, i) => ({
        content: c.trim(),
        tokenCount: estimateTokens(c),
        metadata: { ...metadata, chunkIndex: i },
      }));
  }

  private splitRecursive(text: string, separators: string[]): string[] {
    if (!separators.length) return [text];

    const [sep, ...rest] = separators as [string, ...string[]];
    const parts = text.split(sep);

    const results: string[] = [];
    for (const part of parts) {
      if (estimateTokens(part) <= this.config.targetTokens) {
        results.push(part);
      } else {
        results.push(...this.splitRecursive(part, rest));
      }
    }
    return results.filter((p) => p.trim().length > 0);
  }

  private mergeSmallChunks(parts: string[]): string[] {
    const merged: string[] = [];
    let current = '';

    for (const part of parts) {
      const combined = current ? `${current}\n\n${part}` : part;
      if (estimateTokens(combined) <= this.config.targetTokens) {
        current = combined;
      } else {
        if (current) merged.push(current);
        current = part;
      }
    }
    if (current) merged.push(current);
    return merged;
  }

  private addOverlap(chunks: string[]): string[] {
    if (this.config.overlapTokens <= 0 || chunks.length <= 1) return chunks;

    return chunks.map((chunk, i) => {
      if (i === 0) return chunk;
      const prev = chunks[i - 1] ?? '';
      const overlapWords = prev.split(' ').slice(-this.config.overlapTokens);
      return `${overlapWords.join(' ')}\n${chunk}`;
    });
  }
}

/** Fast token count estimator (~4 chars per token for English). */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
