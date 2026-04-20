import { describe, it, expect } from 'vitest';
import { RecursiveChunkingStrategy } from './chunking.js';

describe('RecursiveChunkingStrategy', () => {
  const chunker = new RecursiveChunkingStrategy({ targetTokens: 100, overlapTokens: 10, minTokens: 5 });

  it('returns a single chunk for short text', () => {
    const text = 'Short text that fits in one chunk.';
    const chunks = chunker.chunk(text);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.content).toContain('Short text');
  });

  it('splits long text into multiple chunks', () => {
    const paragraph = 'word '.repeat(200);
    const chunks = chunker.chunk(paragraph);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it('each chunk has tokenCount > 0', () => {
    const text = 'Hello world. '.repeat(50);
    const chunks = chunker.chunk(text);
    for (const chunk of chunks) {
      expect(chunk.tokenCount).toBeGreaterThan(0);
    }
  });

  it('injects chunkIndex into metadata', () => {
    const text = 'Paragraph one.\n\nParagraph two.\n\nParagraph three.';
    const chunks = chunker.chunk(text, { source: 'test' });
    chunks.forEach((c, i) => {
      expect(c.metadata.chunkIndex).toBe(i);
      expect(c.metadata.source).toBe('test');
    });
  });

  it('filters out chunks below minTokens threshold', () => {
    const strictChunker = new RecursiveChunkingStrategy({ minTokens: 50, targetTokens: 100, overlapTokens: 0 });
    const text = 'Hi.\n\nThis is a much longer paragraph that definitely exceeds the minimum token count threshold for valid chunks.';
    const chunks = strictChunker.chunk(text);
    for (const chunk of chunks) {
      expect(chunk.tokenCount).toBeGreaterThanOrEqual(50);
    }
  });

  it('adds overlap content from previous chunk', () => {
    const overlapChunker = new RecursiveChunkingStrategy({ targetTokens: 20, overlapTokens: 5, minTokens: 2 });
    const text = 'alpha beta gamma delta epsilon.\n\nomega sigma theta lambda kappa phi psi.';
    const chunks = overlapChunker.chunk(text);
    if (chunks.length >= 2) {
      // Second chunk should include some words from the first
      const firstChunkWords = chunks[0]!.content.split(' ').slice(-5).join(' ');
      expect(chunks[1]!.content).toContain(firstChunkWords.split(' ')[0]!);
    }
  });

  it('handles empty string gracefully', () => {
    const chunks = chunker.chunk('');
    expect(chunks).toHaveLength(0);
  });

  it('handles text with only whitespace', () => {
    const chunks = chunker.chunk('   \n\n   ');
    expect(chunks).toHaveLength(0);
  });

  it('preserves metadata fields across all chunks', () => {
    const text = 'sentence '.repeat(100);
    const chunks = chunker.chunk(text, { docId: 'abc', userId: 'u1' });
    for (const chunk of chunks) {
      expect(chunk.metadata.docId).toBe('abc');
      expect(chunk.metadata.userId).toBe('u1');
    }
  });
});
