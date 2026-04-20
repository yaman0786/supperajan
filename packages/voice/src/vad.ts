import type { VoiceActivityState } from '@supperajan/types';

export interface VADConfig {
  silenceThresholdMs: number;
  speechThresholdAmplitude: number;
  sampleRate: number;
  fftSize: number;
}

export const DEFAULT_VAD_CONFIG: VADConfig = {
  silenceThresholdMs: 800,
  speechThresholdAmplitude: 0.02,
  sampleRate: 16000,
  fftSize: 256,
};

/**
 * Voice Activity Detector.
 * Browser-side implementation using Web Audio API AnalyserNode.
 * Tracks speech start/end transitions and exposes current amplitude.
 */
export class VoiceActivityDetector {
  private config: VADConfig;
  private analyser: AnalyserNode | null = null;
  private dataArray: Float32Array | null = null;
  private silenceStartMs = 0;
  private isSpeaking = false;
  private animationFrameId: number | null = null;
  private onSpeechStart?: () => void;
  private onSpeechEnd?: () => void;
  private onAmplitude?: (amplitude: number) => void;

  constructor(
    config: Partial<VADConfig> = {},
    callbacks: {
      onSpeechStart?: () => void;
      onSpeechEnd?: () => void;
      onAmplitude?: (amplitude: number) => void;
    } = {},
  ) {
    this.config = { ...DEFAULT_VAD_CONFIG, ...config };
    this.onSpeechStart = callbacks.onSpeechStart;
    this.onSpeechEnd = callbacks.onSpeechEnd;
    this.onAmplitude = callbacks.onAmplitude;
  }

  connect(analyser: AnalyserNode): void {
    this.analyser = analyser;
    this.analyser.fftSize = this.config.fftSize;
    this.dataArray = new Float32Array(this.analyser.frequencyBinCount);
    this.startLoop();
  }

  disconnect(): void {
    this.stopLoop();
    this.analyser = null;
    this.dataArray = null;
    this.isSpeaking = false;
  }

  getState(): VoiceActivityState {
    return {
      isCapturing: this.analyser !== null,
      isSpeaking: this.isSpeaking,
      isProcessing: false,
      audioLevel: this.getCurrentAmplitude(),
      silenceDurationMs: this.isSpeaking ? 0 : Date.now() - this.silenceStartMs,
    };
  }

  private startLoop(): void {
    const tick = () => {
      this.processFrame();
      this.animationFrameId = requestAnimationFrame(tick);
    };
    this.animationFrameId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private processFrame(): void {
    if (!this.analyser || !this.dataArray) return;
    this.analyser.getFloatTimeDomainData(this.dataArray);
    const amplitude = this.computeRMS(this.dataArray);
    this.onAmplitude?.(amplitude);

    const isSpeechActive = amplitude > this.config.speechThresholdAmplitude;
    const now = Date.now();

    if (isSpeechActive) {
      if (!this.isSpeaking) {
        this.isSpeaking = true;
        this.onSpeechStart?.();
      }
      this.silenceStartMs = now;
    } else if (this.isSpeaking) {
      const silenceDuration = now - this.silenceStartMs;
      if (silenceDuration >= this.config.silenceThresholdMs) {
        this.isSpeaking = false;
        this.onSpeechEnd?.();
      }
    }
  }

  private computeRMS(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += (data[i] ?? 0) ** 2;
    }
    return Math.sqrt(sum / data.length);
  }

  private getCurrentAmplitude(): number {
    if (!this.analyser || !this.dataArray) return 0;
    this.analyser.getFloatTimeDomainData(this.dataArray);
    return this.computeRMS(this.dataArray);
  }
}
