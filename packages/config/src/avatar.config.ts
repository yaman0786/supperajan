import type { AvatarBehaviorConfig, AnimationTransitionRule, AvatarAnimationState } from '@supperajan/types';

export const DEFAULT_AVATAR_BEHAVIOR: AvatarBehaviorConfig = {
  idleBlinkIntervalMs: [2500, 5500],
  breathingCycleMs: 4000,
  microMovementEnabled: true,
  microMovementIntensity: 0.015,
  emotionTransitionMs: 350,
  lipSyncMode: 'amplitude',
  eyeTrackingEnabled: true,
};

export const ANIMATION_TRANSITIONS: AnimationTransitionRule[] = [
  { from: '*', to: 'idle', durationMs: 600, easing: 'ease-out', priority: 1 },
  { from: 'idle', to: 'listening', durationMs: 300, easing: 'ease-in-out', priority: 10 },
  { from: 'listening', to: 'thinking', durationMs: 250, easing: 'ease-in-out', priority: 10 },
  { from: 'thinking', to: 'speaking', durationMs: 300, easing: 'ease-in-out', priority: 10 },
  { from: 'speaking', to: 'idle', durationMs: 500, easing: 'ease-out', priority: 5 },
  { from: '*', to: 'happy', durationMs: 250, easing: 'ease-in', priority: 8 },
  { from: '*', to: 'surprised', durationMs: 150, easing: 'ease-in', priority: 15 },
  { from: '*', to: 'alert', durationMs: 150, easing: 'ease-in', priority: 20 },
  { from: '*', to: 'empathetic', durationMs: 400, easing: 'ease-in-out', priority: 7 },
  { from: '*', to: 'excited', durationMs: 200, easing: 'ease-in', priority: 8 },
  { from: '*', to: 'curious', durationMs: 350, easing: 'ease-in-out', priority: 6 },
];

// Eye glow intensities per state
export const EYE_GLOW_BY_STATE: Record<AvatarAnimationState, number> = {
  idle: 0.6,
  listening: 1.0,
  thinking: 0.7,
  speaking: 0.9,
  happy: 1.0,
  empathetic: 0.8,
  excited: 1.0,
  surprised: 1.0,
  alert: 1.0,
  curious: 0.85,
  sleeping: 0.1,
  waving: 0.9,
};

// Chest light pulse speeds per state (cycles per second)
export const CHEST_PULSE_SPEED_BY_STATE: Record<AvatarAnimationState, number> = {
  idle: 0.5,
  listening: 2.0,
  thinking: 1.0,
  speaking: 3.0,
  happy: 2.0,
  empathetic: 0.8,
  excited: 4.0,
  surprised: 3.5,
  alert: 5.0,
  curious: 1.5,
  sleeping: 0.2,
  waving: 1.5,
};
