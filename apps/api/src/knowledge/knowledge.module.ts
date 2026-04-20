import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { IngestionService } from './ingestion.service.js';
import { RetrievalService } from './retrieval.service.js';
import { PgVectorStore } from './pg-vector.store.js';
import { TextParserService } from './text-parser.service.js';
import { AiModule } from '../ai/ai.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AiModule, AuthModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    IngestionService,
    RetrievalService,
    PgVectorStore,
    TextParserService,
  ],
  exports: [RetrievalService, DocumentsService],
})
export class KnowledgeModule {}
