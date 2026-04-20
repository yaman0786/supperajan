'use client';

import type { EmotionState } from '@supperajan/types';
import type { ReactionType } from '@/hooks/useEmotionReactions';

interface EmotionAmbientProps {
  emotionState: EmotionState;
  activeReaction: ReactionType;
}

/** Ambient glow color per emotion */
const AMBIENT_COLORS: Partial<Record<EmotionState, string>> = {
  happy:      'rgba(34, 197, 94, 0.07)',
  excited:    'rgba(232, 97, 26, 0.10)',
  empathetic: 'rgba(168, 85, 247, 0.07)',
  alert:      'rgba(245, 158, 11, 0.09)',
  surprised:  'rgba(250, 204, 21, 0.07)',
  curious:    'rgba(0, 174, 222, 0.07)',
  listening:  'rgba(0, 174, 222, 0.06)',
  thinking:   'rgba(232, 97, 26, 0.05)',
  speaking:   'rgba(0, 174, 222, 0.08)',
};

/** Reaction ring colors */
const REACTION_RING: Record<NonNullable<ReactionType>, string> = {
  celebrate: 'rgba(34, 197, 94, 0.35)',
  energize:  'rgba(232, 97, 26, 0.40)',
  soften:    'rgba(168, 85, 247, 0.30)',
  startle:   'rgba(250, 204, 21, 0.35)',
  focus:     'rgba(245, 158, 11, 0.38)',
};

export function EmotionAmbient({ emotionState, activeReaction }: EmotionAmbientProps) {
  const bgColor = AMBIENT_COLORS[emotionState] ?? 'transparent';

  return (
    <>
      {/* Subtle background radial tint based on emotion */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${bgColor} 0%, transparent 70%)`,
        }}
      />

      {/* Reaction burst ring — brief animation on emotion change */}
      {activeReaction && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full"
          style={{
            width: '280px',
            height: '280px',
            border: `2px solid ${REACTION_RING[activeReaction]}`,
            animationDuration: '1.2s',
            animationIterationCount: '1',
          }}
        />
      )}

      {/* Secondary softer ring */}
      {activeReaction && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full"
          style={{
            width: '360px',
            height: '360px',
            border: `1px solid ${REACTION_RING[activeReaction]}`,
            animationDuration: '1.6s',
            animationDelay: '0.2s',
            animationIterationCount: '1',
          }}
        />
      )}
    </>
  );
}
