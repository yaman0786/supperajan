import type { EmotionState } from './conversation.js';

export type AvatarAnimationState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'happy'
  | 'empathetic'
  | 'excited'
  | 'surprised'
  | 'alert'
  | 'curious'
  | 'sleeping'
  | 'waving';

export type EyeGlowState = 'normal' | 'bright' | 'dim' | 'pulsing' | 'off';
export type ChestLightState = 'idle' | 'active' | 'listening' | 'speaking' | 'thinking' | 'off';
export type HeadGestureType = 'nod' | 'shake' | 'tilt_left' | 'tilt_right' | 'look_up' | 'look_down' | 'center';
export type ArmGestureType = 'wave' | 'point' | 'open_arms' | 'folded' | 'idle';

export interface AvatarState {
  animationState: AvatarAnimationState;
  emotionState: EmotionState;
  eyeGlow: EyeGlowState;
  chestLight: ChestLightState;
  headGesture: HeadGestureType;
  armGesture: ArmGestureType;
  isBlinking: boolean;
  isBreathing: boolean;
  lipSyncActive: boolean;
  transitionDurationMs: number;
}

export interface AvatarBehaviorConfig {
  idleBlinkIntervalMs: [number, number];
  breathingCycleMs: number;
  microMovementEnabled: boolean;
  microMovementIntensity: number;
  emotionTransitionMs: number;
  lipSyncMode: 'phoneme' | 'amplitude' | 'off';
  eyeTrackingEnabled: boolean;
}

export interface LipSyncFrame {
  timestampMs: number;
  viseme: string;
  weight: number;
}

export interface AvatarEvent {
  type:
    | 'state_changed'
    | 'gesture_triggered'
    | 'blink'
    | 'lip_sync_frame'
    | 'eye_glow_changed'
    | 'chest_light_changed';
  payload: unknown;
  timestamp: number;
}

export interface AnimationTransitionRule {
  from: AvatarAnimationState | '*';
  to: AvatarAnimationState;
  durationMs: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  priority: number;
}

export const EMOTION_TO_AVATAR_STATE: Record<EmotionState, AvatarAnimationState> = {
  idle: 'idle',
  listening: 'listening',
  thinking: 'thinking',
  speaking: 'speaking',
  happy: 'happy',
  empathetic: 'empathetic',
  excited: 'excited',
  surprised: 'surprised',
  alert: 'alert',
  curious: 'curious',
  calm: 'idle',
  concerned: 'empathetic',
};
