'use client';

import type { AvatarAnimationState, EmotionState } from '@supperajan/types';
import type { ConnectionState } from '@/store/assistant.store';

interface AssistantStatusBadgeProps {
  avatarState: AvatarAnimationState;
  emotionState: EmotionState;
  connectionState: ConnectionState;
}

const STATE_LABELS: Record<AvatarAnimationState, string> = {
  idle: 'Hazır',
  listening: 'Dinliyor...',
  thinking: 'Düşünüyor...',
  speaking: 'Konuşuyor',
  happy: 'Mutlu',
  empathetic: 'Anlayışlı',
  excited: 'Heyecanlı',
  surprised: 'Şaşırdı',
  alert: 'Dikkat',
  curious: 'Meraklı',
  sleeping: 'Uyku',
  waving: 'Merhaba!',
};

const STATE_COLORS: Record<AvatarAnimationState, string> = {
  idle: 'text-neutral-400',
  listening: 'text-accent-300',
  thinking: 'text-brand-300',
  speaking: 'text-accent-200',
  happy: 'text-green-300',
  empathetic: 'text-purple-300',
  excited: 'text-brand-300',
  surprised: 'text-yellow-300',
  alert: 'text-yellow-300',
  curious: 'text-accent-300',
  sleeping: 'text-neutral-500',
  waving: 'text-green-300',
};

const STATE_DOTS: Record<AvatarAnimationState, string> = {
  idle: 'bg-neutral-600',
  listening: 'bg-accent-400 animate-pulse',
  thinking: 'bg-brand-400 animate-pulse',
  speaking: 'bg-accent-300 animate-[pulse_0.6s_ease-in-out_infinite]',
  happy: 'bg-green-400',
  empathetic: 'bg-purple-400',
  excited: 'bg-brand-400 animate-pulse',
  surprised: 'bg-yellow-400',
  alert: 'bg-yellow-400 animate-ping',
  curious: 'bg-accent-400',
  sleeping: 'bg-neutral-700',
  waving: 'bg-green-400',
};

export function AssistantStatusBadge({
  avatarState,
  connectionState,
}: AssistantStatusBadgeProps) {
  if (connectionState === 'disconnected') {
    return (
      <div className="glass rounded-full px-3 py-1.5 text-xs font-medium text-neutral-600">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-neutral-700" />
        Çevrimdışı
      </div>
    );
  }

  if (connectionState === 'connecting' || connectionState === 'reconnecting') {
    return (
      <div className="glass rounded-full px-3 py-1.5 text-xs font-medium text-yellow-400/70">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-500/70" />
        Bağlanıyor...
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
