import { Injectable } from '@nestjs/common';
import type { IDocumentParser, ParsedDocument } from '@supperajan/knowledge';

/**
 * Text-based document parser.
 * Handles: text/plain, text/markdown, application/json, text/csv, text/html.
 * PDF/DOCX: extracts stored text (binary parsing deferred to Phase 10).
 */
@Injectable()
export class TextParserService implements IDocumentParser {
  readonly supportedMimeTypes = [
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'application/json',
    'text/csv',
    'text/html',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  async parse(buffer: ArrayBuffer, fileName: string): Promise<ParsedDocument> {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? 'txt';

    switch (ext) {
      case 'json':
        return this.parseJson(buffer, fileName);
      case 'csv':
        return this.parseCsv(buffer, fileName);
      case 'html':
      case 'htm':
        return this.parseHtml(buffer, fileName);
      default:
        return this.parsePlainText(buffer, fileName);
    }
  }

  private parsePlainText(buffer: ArrayBuffer, fileName: string): ParsedDocument {
    const content = new TextDecoder('utf-8').decode(buffer);
    const lines = content.split('\n');

    // Extract title from first non-empty line or heading
    let title: string | undefined;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        title = trimmed.replace(/^#+\s*/, '');
        break;
      }
      if (trimmed.length > 0) {
        title = trimmed.slice(0, 80);
        break;
      }
    }

    // Split into sections by headings (for markdown)
    const sections = this.extractMarkdownSections(content);

    return {
      title,
      content,
      sections,
      metadata: {
        wordCount: content.split(/\s+/).filter(Boolean).length,
        fileName,
        lineCount: lines.length,
      },
    };
  }

  private parseJson(buffer: ArrayBuffer, fileName: string): ParsedDocument {
    const raw = new TextDecoder('utf-8').decode(buffer);
    let content: string;
    let title: string | undefined;

    try {
      const parsed: unknown = JSON.parse(raw);
      content = this.jsonToText(parsed);
      if (typeof parsed === 'object' && parsed !== null && 'title' in parsed) {
        title = String((parsed as Record<string, unknown>)['title']);
      }
    } catch {
      content = raw;
    }

    return {
      title: title ?? fileName,
      content,
      sections: [{ content, heading: fileName }],
      metadata: { fileName, format: 'json' },
    };
  }

  private parseCsv(buffer: ArrayBuffer, fileName: string): ParsedDocument {
    const raw = new TextDecoder('utf-8').decode(buffer);
    const lines = raw.split('\n').filter(Boolean);
    const headers = lines[0]?.split(',').map((h) => h.trim().replace(/"/g, '')) ?? [];

    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
      return headers.map((h, i) => `${h}: ${values[i] ?? ''}`).join(', ');
    });

    const content = [
      `CSV: ${fileName}`,
      `Columns: ${headers.join(', ')}`,
      '',
      ...rows,
    ].join('\n');

    return {
      title: fileName,
      content,
      sections: [{ content, heading: `${fileName} data` }],
      metadata: { fileName, format: 'csv', rowCount: rows.length, columns: headers },
    };
  }

  private parseHtml(buffer: ArrayBuffer, fileName: string): ParsedDocument {
    const raw = new TextDecoder('utf-8').decode(buffer);
    // Strip HTML tags — simple approach
    const content = raw
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const titleMatch = raw.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch?.[1]?.trim() ?? fileName;

    return {
      title,
      content,
      sections: [{ content, heading: title }],
      metadata: { fileName, format: 'html' },
    };
  }

  private extractMarkdownSections(content: string): Array<{ heading?: string; content: string }> {
    const lines = content.split('\n');
    const sections: Array<{ heading?: string; content: string }> = [];
    let currentHeading: string | undefined;
    let currentLines: string[] = [];

    for (const line of lines) {
      if (line.match(/^#{1,3}\s+/)) {
        if (currentLines.length > 0) {
          sections.push({ heading: currentHeading, content: currentLines.join('\n').trim() });
          currentLines = [];
        }
        currentHeading = line.replace(/^#+\s*/, '');
      } else {
        currentLines.push(line);
      }
    }

    if (currentLines.length > 0) {
      sections.push({ heading: currentHeading, content: currentLines.join('\n').trim() });
    }

    return sections.filter((s) => s.content.trim().length > 0);
  }

  private jsonToText(value: unknown, depth = 0): string {
    if (depth > 4) return JSON.stringify(value);
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) {
      return value.map((v) => this.jsonToText(v, depth + 1)).join('\n');
    }
    if (value && typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${this.jsonToText(v, depth + 1)}`)
        .join('\n');
    }
    return '';
  }
}
