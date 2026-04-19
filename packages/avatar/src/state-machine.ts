import type {
  AvatarAnimationState,
  AvatarState,
  EmotionState,
  EyeGlowState,
  ChestLightState,
  HeadGestureType,
  ArmGestureType,
  AnimationTransitionRule,
  EMOTION_TO_AVATAR_STATE,
} from '@supperajan/types';
import { ANIMATION_TRANSITIONS, EYE_GLOW_BY_STATE } from '@supperajan/config';

type EmotionToAvatarMap = typeof EMOTION_TO_AVATAR_STATE;

export interface StateMachineOptions {
  onStateChange?: (prev: AvatarAnimationState, next: AvatarAnimationState) => void;
  transitions?: AnimationTransitionRule[];
  emotionMap?: EmotionToAvatarMap;
}

/**
 * Avatar Animation State Machine.
 *
 * Manages avatar animation states with priority-based transitions,
 * emotion-to-animation mapping, and configurable behavior callbacks.
 * Framework-agnostic: holds pure state, no React dependencies.
 */
export class AvatarStateMachine {
  private currentState: AvatarAnimationState = 'idle';
  private emotionState: EmotionState = 'idle';
  private isTransitioning = false;
  private transitionTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly transitions: AnimationTransitionRule[];
  private readonly onStateChange?: (prev: AvatarAnimationState, next: AvatarAnimationState) => void;

  constructor(options: StateMachineOptions = {}) {
    this.transitions = options.transitions ?? ANIMATION_TRANSITIONS;
    this.onStateChange = options.onStateChange;
  }

  getState(): AvatarState {
    return {
      animationState: this.currentState,
      emotionState: this.emotionState,
      eyeGlow: this.resolveEyeGlow(),
      chestLight: this.resolveChestLight(),
      headGesture: this.resolveHeadGesture(),
      armGesture: this.resolveArmGesture(),
      isBlinking: false,
      isBreathing: true,
      lipSyncActive: this.currentState === 'speaking',
      transitionDurationMs: this.resolveTransitionDuration(this.currentState),
    };
  }

  getCurrentAnimationState(): AvatarAnimationState {
    return this.currentState;
  }

  getEmotionState(): EmotionState {
    return this.emotionState;
  }

  transitionTo(targetState: AvatarAnimationState): boolean {
    if (targetState === this.currentState) return false;

    const rule = this.findTransitionRule(this.currentState, targetState);
    const durationMs = rule?.durationMs ?? 300;

    const previous = this.currentState;
    this.currentState = targetState;
    this.isTransitioning = true;

    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      this.isTransitioning = false;
    }, durationMs);

    this.onStateChange?.(previous, targetState);
    return true;
  }

  setEmotion(emotion: EmotionState): void {
    this.emotionState = emotion;
  }

  applyEmotionAsState(emotion: EmotionState): void {
    this.emotionState = emotion;
    const animState = EMOTION_TO_ANIMATION_STATE[emotion];
    if (animState) this.transitionTo(animState);
  }

  isInTransition(): boolean {
    return this.isTransitioning;
  }

  reset(): void {
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.currentState = 'idle';
    this.emotionState = 'idle';
    this.isTransitioning = false;
  }

  destroy(): void {
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
  }

  private findTransitionRule(
    from: AvatarAnimationState,
    to: AvatarAnimationState,
  ): AnimationTransitionRule | undefined {
    const specific = this.transitions
      .filter((r) => r.from === from && r.to === to)
      .sort((a, b) => b.priority - a.priority)[0];
    if (specific) return specific;

    return this.transitions
      .filter((r) => r.from === '*' && r.to === to)
      .sort((a, b) => b.priority - a.priority)[0];
  }

  private resolveTransitionDuration(state: AvatarAnimationState): number {
    const rule = this.findTransitionRule('*', state);
    return rule?.durationMs ?? 300;
  }

  private resolveEyeGlow(): EyeGlowState {
    const intensity = EYE_GLOW_BY_STATE[this.currentState] ?? 0.6;
    if (intensity >= 1.0) return 'bright';
    if (intensity >= 0.7) return 'normal';
    if (intensity >= 0.3) return 'dim';
    return 'off';
  }

  private resolveChestLight(): ChestLightState {
    const map: Record<AvatarAnimationState, ChestLightState> = {
      idle: 'idle',
      listening: 'listening',
      thinking: 'thinking',
      speaking: 'speaking',
      happy: 'active',
      empathetic: 'active',
      excited: 'active',
      surprised: 'active',
      alert: 'active',
      curious: 'active',
      sleeping: 'off',
      waving: 'active',
    };
    return map[this.currentState] ?? 'idle';
  }

  private resolveHeadGesture(): HeadGestureType {
    const map: Partial<Record<AvatarAnimationState, HeadGestureType>> = {
      listening: 'tilt_left',
      curious: 'tilt_right',
      thinking: 'look_up',
      surprised: 'look_up',
      empathetic: 'tilt_left',
    };
    return map[this.currentState] ?? 'center';
  }

  private resolveArmGesture(): ArmGestureType {
    const map: Partial<Record<AvatarAnimationState, ArmGestureType>> = {
      happy: 'open_arms',
      excited: 'open_arms',
      waving: 'wave',
    };
    return map[this.currentState] ?? 'idle';
  }
}

// Local mapping (avoids circular import from types/avatar.ts)
const EMOTION_TO_ANIMATION_STATE: Record<EmotionState, AvatarAnimationState> = {
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
