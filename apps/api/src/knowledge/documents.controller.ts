import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { DocumentsService } from './documents.service.js';
import { IngestionService } from './ingestion.service.js';
import { UploadDocumentDto } from './dto/upload-document.dto.js';
import type { AuthenticatedUser as AuthUser } from '../auth/current-user.decorator.js';
import type { ApiResponse, Document } from '@supperajan/types';

@Controller('api/v1/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly ingestionService: IngestionService,
  ) {}

  /** List all documents for the authenticated user */
  @Get()
  async list(@CurrentUser() user: AuthUser): Promise<ApiResponse<Document[]>> {
    const items = await this.documentsService.list(user.id);
    return { success: true, data: items };
  }

  /**
   * Upload and ingest a document.
   * Content can be UTF-8 text or base64-encoded binary.
   * Ingestion runs synchronously for Phase 7; Phase 10 moves to background queue.
   */
  @Post()
  async upload(
    @CurrentUser() user: AuthUser,
    @Body() dto: UploadDocumentDto,
  ): Promise<ApiResponse<Document>> {
    if (!dto.fileName || !dto.content) {
      throw new BadRequestException('fileName ve content gereklidir');
    }

    // Create document record
    const doc = await this.documentsService.create(user.id, {
      fileName: dto.fileName,
      mimeType: dto.mimeType || 'text/plain',
      fileSize: dto.fileSize || Buffer.byteLength(dto.content, 'utf-8'),
      title: dto.title,
    });

    // Decode content to ArrayBuffer
    let buffer: ArrayBuffer;
    if (dto.encoding === 'base64') {
      const bytes = Buffer.from(dto.content, 'base64');
      buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    } else {
      const bytes = Buffer.from(dto.content, 'utf-8');
      buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    }

    // Run ingestion pipeline (async — don't await in request, respond immediately)
    this.ingestionService
      .ingestDocument(doc.id, user.id, buffer, dto.fileName)
      .catch(() => {}); // errors are logged in IngestionService

    const updated = await this.documentsService.findOne(doc.id, user.id);
    return { success: true, data: updated };
  }

  /** Get a single document */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ApiResponse<Document>> {
    const doc = await this.documentsService.findOne(id, user.id);
    return { success: true, data: doc };
  }

  /** Soft-delete a document and its chunks */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.documentsService.softDelete(id, user.id);
  }
}
