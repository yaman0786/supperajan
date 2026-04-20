import type { TTSConfig, SpeechSynthesisResult } from '@supperajan/types';

/**
 * Provider-agnostic Text-to-Speech interface.
 * Implementations handle voice rendering and optionally return viseme data
 * for lip sync integration.
 */
export interface ITTSProvider {
  readonly providerId: string;
  readonly supportedVoices: string[];

  /** Synthesize full speech from text */
  synthesize(text: string, config?: Partial<TTSConfig>): Promise<SpeechSynthesisResult>;

  /** Stream synthesis — yields audio chunks as they become available */
  synthesizeStream(
    text: string,
    config?: Partial<TTSConfig>,
  ): AsyncGenerator<ArrayBuffer>;

  /** Health check */
  healthCheck(): Promise<boolean>;
}
