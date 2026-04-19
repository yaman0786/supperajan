'use client';

import type { AvatarAnimationState, EmotionState } from '@supperajan/types';
import type { ConnectionState } from '@/store/assistant.store';

interface AssistantStatusBadgeProps {
  avatarState: AvatarAnimationState;
  emotionState: EmotionState;
  connectionState: ConnectionState;
}

const STATE_LABELS: Record<AvatarAnimationState, string> = {
  idle: 'Ready',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'Speaking',
  happy: 'Ready',
  empathetic: 'Ready',
  excited: 'Ready',
  surprised: 'Ready',
  alert: 'Alert',
  curious: 'Thinking...',
  sleeping: 'Sleeping',
  waving: 'Hello!',
};

const STATE_COLORS: Record<AvatarAnimationState, string> = {
  idle: 'bg-neutral-700 text-neutral-300',
  listening: 'bg-accent-500/20 text-accent-300 border border-accent-500/30',
  thinking: 'bg-brand-500/20 text-brand-300 border border-brand-500/30',
  speaking: 'bg-accent-600/20 text-accent-200 border border-accent-500/40',
  happy: 'bg-status-success/20 text-green-300 border border-green-500/30',
  empathetic: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  excited: 'bg-brand-500/20 text-brand-300 border border-brand-500/30',
  surprised: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  alert: 'bg-status-warning/20 text-yellow-300 border border-yellow-500/30',
  curious: 'bg-accent-500/20 text-accent-300 border border-accent-500/30',
  sleeping: 'bg-neutral-800 text-neutral-500',
  waving: 'bg-status-success/20 text-green-300 border border-green-500/30',
};

const STATE_DOTS: Record<AvatarAnimationState, string> = {
  idle: 'bg-neutral-500',
  listening: 'bg-accent-400 animate-pulse',
  thinking: 'bg-brand-400 animate-pulse',
  speaking: 'bg-accent-300 animate-pulse',
  happy: 'bg-green-400',
  empathetic: 'bg-purple-400',
  excited: 'bg-brand-400',
  surprised: 'bg-yellow-400',
  alert: 'bg-yellow-400 animate-ping',
  curious: 'bg-accent-400',
  sleeping: 'bg-neutral-600',
  waving: 'bg-green-400',
};

export function AssistantStatusBadge({
  avatarState,
  connectionState,
}: AssistantStatusBadgeProps) {
  if (connectionState === 'disconnected') {
    return (
      <div className="glass rounded-full px-3 py-1.5 text-xs font-medium text-neutral-500">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-neutral-600" />
        Offline
      </div>
    );
  }

  if (connectionState === 'connecting' || connectionState === 'reconnecting') {
    return (
      <div className="glass rounded-full px-3 py-1.5 text-xs font-medium text-neutral-400">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-500" />
        Connecting...
      </div>
    );
  }

  return (
    <div
      className={`glass rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 ${STATE_COLORS[avatarState]}`}
    >
      <span
        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${STATE_DOTS[avatarState]}`}
      />
      {STATE_LABELS[avatarState]}
    </div>
  );
}
