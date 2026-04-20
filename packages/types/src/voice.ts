export type STTProvider = 'openai' | 'deepgram' | 'google' | 'azure' | 'whisper_local';
export type TTSProvider = 'openai' | 'elevenlabs' | 'google' | 'azure' | 'piper_local';
export type VoiceStyle = 'neutral' | 'warm' | 'excited' | 'calm' | 'empathetic' | 'professional';

export interface STTConfig {
  provider: STTProvider;
  model?: string;
  language?: string;
  sampleRate?: number;
  encoding?: 'pcm' | 'webm' | 'mp3' | 'ogg';
  enableInterimResults: boolean;
  enablePunctuation: boolean;
  enableSpeakerDiarization: boolean;
}

export interface TTSConfig {
  provider: TTSProvider;
  voiceId?: string;
  model?: string;
  speed?: number;
  pitch?: number;
  format?: 'mp3' | 'wav' | 'ogg' | 'pcm';
}

export interface AudioChunk {
  data: ArrayBuffer;
  sequenceNumber: number;
  timestampMs: number;
  isFinal: boolean;
}

export interface TranscriptResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  words?: TranscriptWord[];
  timestampMs: number;
  durationMs?: number;
}

export interface TranscriptWord {
  word: string;
  startMs: number;
  endMs: number;
  confidence: number;
}

export interface SpeechSynthesisResult {
  audioData: ArrayBuffer;
  format: string;
  durationMs: number;
  visemes?: VisemeFrame[];
}

export interface VisemeFrame {
  timestampMs: number;
  viseme: string;
  duration: number;
}

export interface VoiceActivityState {
  isCapturing: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  audioLevel: number;
  silenceDurationMs: number;
}

export interface STTStreamEvent {
  type: 'transcript' | 'error' | 'end';
  transcript?: TranscriptResult;
  error?: string;
}
