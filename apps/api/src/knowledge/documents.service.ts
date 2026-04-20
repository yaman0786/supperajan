import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { LoggerService } from '../common/logger.service.js';
import type { Document, DocumentType } from '@supperajan/types';

const MIME_TO_TYPE: Record<string, DocumentType> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'text/x-markdown': 'md',
  'application/json': 'json',
  'text/csv': 'csv',
  'text/html': 'html',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class DocumentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  async create(
    userId: string,
    opts: {
      fileName: string;
      mimeType: string;
      fileSize: number;
      title?: string;
    },
  ): Promise<Document> {
    if (opts.fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException(`Dosya çok büyük (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`);
    }

    const docType: DocumentType = MIME_TO_TYPE[opts.mimeType] ?? 'txt';
    const storageKey = `user/${userId}/docs/${crypto.randomUUID()}-${opts.fileName}`;

    const doc = await this.db.document.create({
      data: {
        userId,
        fileName: opts.fileName,
        originalFileName: opts.fileName,
        fileSize: opts.fileSize,
        mimeType: opts.mimeType,
        documentType: docType.toUpperCase() as never,
        status: 'UPLOADING',
        title: opts.title ?? opts.fileName,
        storageKey,
        chunkCount: 0,
      },
    });

    return this.toDomain(doc);
  }

  async list(userId: string): Promise<Document[]> {
    const docs = await this.db.document.findMany({
      where: { userId, deletedAt: null, status: { not: 'DELETED' } },
      orderBy: { createdAt: 'desc' },
    });
    return docs.map(this.toDomain);
  }

  async findOne(id: string, userId: string): Promise<Document> {
    const doc = await this.db.document.findFirst({ where: { id, userId } });
    if (!doc) throw new NotFoundException(`Belge ${id} bulunamadı`);
    return this.toDomain(doc);
  }

  async updateStatus(id: string, status: string, error?: string): Promise<void> {
    await this.db.document.update({
      where: { id },
      data: {
        status: status.toUpperCase() as never,
        processingError: error ?? null,
      },
    });
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const doc = await this.db.document.findFirst({ where: { id, userId } });
    if (!doc) throw new NotFoundException(`Belge ${id} bulunamadı`);

    await this.db.document.update({
      where: { id },
      data: { status: 'DELETED', deletedAt: new Date() },
    });

    // Delete chunks
    await this.db.documentChunk.deleteMany({ where: { documentId: id } });
    this.logger.info('Document deleted', { documentId: id, userId });
  }

  private toDomain(row: {
    id: string; userId: string; fileName: string; originalFileName: string;
    fileSize: number; mimeType: string; documentType: string; status: string;
    title: string | null; description: string | null; chunkCount: number;
    storageKey: string; processingError: string | null;
    docMetadata: unknown; createdAt: Date; updatedAt: Date; deletedAt: Date | null;
  }): Document {
    return {
      id: row.id,
      userId: row.userId,
      fileName: row.fileName,
      originalFileName: row.originalFileName,
      fileSize: row.fileSize,
      mimeType: row.mimeType,
      documentType: row.documentType.toLowerCase() as DocumentType,
      status: row.status.toLowerCase() as Document['status'],
      title: row.title ?? undefined,
      description: row.description ?? undefined,
      chunkCount: row.chunkCount,
      storageKey: row.storageKey,
      processingError: row.processingError ?? undefined,
      metadata: (row.docMetadata as Document['metadata']) ?? {},
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
    };
  }
}
