'use client';

import { useEffect, useRef, useState } from 'react';
import type { EmotionState } from '@supperajan/types';
import { useAssistantStore } from '@/store/assistant.store';

export type ReactionType = 'celebrate' | 'energize' | 'soften' | 'startle' | 'focus' | null;

const REACTION_MAP: Partial<Record<EmotionState, ReactionType>> = {
  happy: 'celebrate',
  excited: 'energize',
  empathetic: 'soften',
  surprised: 'startle',
  alert: 'focus',
};

const REACTION_DURATION_MS = 1800;

/**
 * Subscribes to emotion state changes and triggers brief visual reactions.
 * Returns the active reaction type so the caller can render effects.
 */
export function useEmotionReactions(): { activeReaction: ReactionType } {
  const [activeReaction, setActiveReaction] = useState<ReactionType>(null);
  const prevEmotionRef = useRef<EmotionState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = useAssistantStore.subscribe(
      (s) => s.emotionState,
      (next, prev) => {
        if (next === prev) return;
        prevEmotionRef.current = prev;

        const reaction = REACTION_MAP[next] ?? null;
        if (!reaction) return;

        setActiveReaction(reaction);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setActiveReaction(null), REACTION_DURATION_MS);
      },
    );

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { activeReaction };
}
