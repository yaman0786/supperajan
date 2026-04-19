import type { AvatarBehaviorConfig } from '@supperajan/types';

export interface IdleBehaviorState {
  nextBlinkMs: number;
  breathPhase: number;
  microSwayX: number;
  microSwayY: number;
  lastUpdateMs: number;
}

/**
 * Computes idle animation state deltas for a single frame update.
 * Pure function — no side effects, no framework dependencies.
 * The renderer consumes these deltas to drive actual 3D transforms.
 */
export function updateIdleBehavior(
  state: IdleBehaviorState,
  config: AvatarBehaviorConfig,
  nowMs: number,
): { state: IdleBehaviorState; shouldBlink: boolean; breathOffset: number; swayX: number; swayY: number } {
  const dt = nowMs - state.lastUpdateMs;
  const breathPhase = (state.breathPhase + (dt / config.breathingCycleMs) * Math.PI * 2) % (Math.PI * 2);
  const breathOffset = Math.sin(breathPhase) * 0.008;

  const microIntensity = config.microMovementEnabled ? config.microMovementIntensity : 0;
  const swayX = Math.sin(nowMs * 0.0007) * microIntensity;
  const swayY = Math.sin(nowMs * 0.0011 + 1.2) * microIntensity * 0.5;

  const shouldBlink = nowMs >= state.nextBlinkMs;
  const [minInterval, maxInterval] = config.idleBlinkIntervalMs;
  const nextBlinkMs = shouldBlink
    ? nowMs + minInterval + Math.random() * (maxInterval - minInterval)
    : state.nextBlinkMs;

  return {
    state: {
      nextBlinkMs,
      breathPhase,
      microSwayX: swayX,
      microSwayY: swayY,
      lastUpdateMs: nowMs,
    },
    shouldBlink,
    breathOffset,
    swayX,
    swayY,
  };
}

export function createIdleBehaviorState(nowMs: number, config: AvatarBehaviorConfig): IdleBehaviorState {
  const [minInterval, maxInterval] = config.idleBlinkIntervalMs;
  return {
    nextBlinkMs: nowMs + minInterval + Math.random() * (maxInterval - minInterval),
    breathPhase: 0,
    microSwayX: 0,
    microSwayY: 0,
    lastUpdateMs: nowMs,
  };
}
