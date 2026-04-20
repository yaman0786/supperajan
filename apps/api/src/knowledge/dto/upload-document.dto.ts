/**
 * Document upload DTO.
 * Content is sent as base64-encoded string for binary files (PDF, DOCX)
 * or as plain UTF-8 text for text files (txt, md, csv, json).
 */
export class UploadDocumentDto {
  /** Original file name including extension */
  fileName!: string;

  /** MIME type of the file */
  mimeType!: string;

  /** File size in bytes */
  fileSize!: number;

  /**
   * File content.
   * Encoding determines how the content string is interpreted.
   */
  content!: string;

  /** How `content` is encoded */
  encoding!: 'utf8' | 'base64';

  /** Optional human-readable title */
  title?: string;
}
