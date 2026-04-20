import type { VisemeFrame, LipSyncFrame } from '@supperajan/types';

/**
 * Lip sync controller for amplitude-based and phoneme-based modes.
 * Amplitude mode: drives mouth openness from audio analysis data.
 * Phoneme mode: drives specific viseme shapes from TTS timing data.
 */
export class LipSyncController {
  private mode: 'amplitude' | 'phoneme' | 'off';
  private currentViseme = 'sil';
  private mouthOpenness = 0;
  private frames: LipSyncFrame[] = [];
  private frameIndex = 0;
  private startTimeMs = 0;

  constructor(mode: 'amplitude' | 'phoneme' | 'off') {
    this.mode = mode;
  }

  loadPhonemeFrames(frames: VisemeFrame[], startTimeMs: number): void {
    this.frames = frames.map((f) => ({
      timestampMs: f.timestampMs,
      viseme: f.viseme,
      weight: 1.0,
    }));
    this.frameIndex = 0;
    this.startTimeMs = startTimeMs;
  }

  updateFromAmplitude(amplitude: number): void {
    if (this.mode !== 'amplitude') return;
    // Smooth amplitude to mouth openness with slight lag
    this.mouthOpenness = this.mouthOpenness * 0.7 + amplitude * 0.3;
    this.currentViseme = amplitude > 0.05 ? 'aa' : 'sil';
  }

  updateFromTime(nowMs: number): void {
    if (this.mode !== 'phoneme' || this.frames.length === 0) return;
    const elapsed = nowMs - this.startTimeMs;
    while (
      this.frameIndex < this.frames.length - 1 &&
      (this.frames[this.frameIndex + 1]?.timestampMs ?? Infinity) <= elapsed
    ) {
      this.frameIndex++;
    }
    const frame = this.frames[this.frameIndex];
    if (frame) {
      this.currentViseme = frame.viseme;
      this.mouthOpenness = frame.weight;
    }
  }

  getCurrentState(): { viseme: string; openness: number } {
    return { viseme: this.currentViseme, openness: this.mouthOpenness };
  }

  reset(): void {
    this.currentViseme = 'sil';
    this.mouthOpenness = 0;
    this.frames = [];
    this.frameIndex = 0;
  }

  setMode(mode: 'amplitude' | 'phoneme' | 'off'): void {
    this.mode = mode;
    this.reset();
  }
}
