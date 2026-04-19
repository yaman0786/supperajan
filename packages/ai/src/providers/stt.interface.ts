import type { STTConfig, TranscriptResult, STTStreamEvent } from '@supperajan/types';

/**
 * Provider-agnostic Speech-to-Text interface.
 * Supports both batch transcription and streaming partial results.
 */
export interface ISTTProvider {
  readonly providerId: string;

  /** Transcribe a complete audio buffer */
  transcribe(audioData: ArrayBuffer, config?: Partial<STTConfig>): Promise<TranscriptResult>;

  /** Stream transcription — yields events as audio arrives */
  streamTranscribe(
    audioStream: AsyncIterable<ArrayBuffer>,
    config?: Partial<STTConfig>,
  ): AsyncGenerator<STTStreamEvent>;

  /** Health check */
  healthCheck(): Promise<boolean>;
}
