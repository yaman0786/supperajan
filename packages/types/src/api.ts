export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

export interface ApiMeta {
  requestId: string;
  timestamp: number;
  version: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

export interface SortQuery {
  field: string;
  direction: 'asc' | 'desc';
}

// ─── HTTP Error Codes ────────────────────────────────────────────────────────

export const API_ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  MEMORY_WRITE_DENIED: 'MEMORY_WRITE_DENIED',
  DOCUMENT_TOO_LARGE: 'DOCUMENT_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

// ─── DTO types used across API and frontend ──────────────────────────────────

export interface CreateSessionDto {
  assistantMode?: string;
  title?: string;
}

export interface SendMessageDto {
  content: string;
  sessionId: string;
}

export interface UploadDocumentDto {
  fileName: string;
  fileSize: number;
  mimeType: string;
  description?: string;
}

export interface UpdateMemoryDto {
  content?: string;
  importance?: number;
  status?: string;
  tags?: string[];
}

export interface UpdatePreferencesDto {
  preferredName?: string;
  timezone?: string;
  locale?: string;
  assistantMode?: string;
  voiceEnabled?: boolean;
  memoryEnabled?: boolean;
}
