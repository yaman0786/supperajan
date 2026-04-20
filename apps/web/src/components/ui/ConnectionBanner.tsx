'use client';

import { useAssistantStore } from '@/store/assistant.store';

export function ConnectionBanner() {
  const { connectionState } = useAssistantStore();

  if (connectionState === 'connected' || connectionState === 'authenticated') return null;

  const config = {
    disconnected: {
      bg: 'bg-neutral-900/95 border-neutral-700',
      dot: 'bg-neutral-500',
      text: 'Bağlantı kesildi — yeniden bağlanılıyor...',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-neutral-400">
          <path d="M1 7a6 6 0 1 1 12 0A6 6 0 0 1 1 7Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 4v3.5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    connecting: {
      bg: 'bg-yellow-950/95 border-yellow-800/50',
      dot: 'bg-yellow-400 animate-pulse',
      text: 'Sunucuya bağlanılıyor...',
      icon: null,
    },
    reconnecting: {
      bg: 'bg-yellow-950/95 border-yellow-800/50',
      dot: 'bg-yellow-400 animate-pulse',
      text: 'Yeniden bağlanılıyor...',
      icon: null,
    },
    error: {
      bg: 'bg-red-950/95 border-red-800/50',
      dot: 'bg-red-400',
      text: 'Bağlantı hatası — lütfen sayfayı yenileyin',
      icon: null,
    },
  } as const;

  const c = config[connectionState as keyof typeof config];
  if (!c) return null;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 border-b py-2 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all duration-300 ${c.bg}`}
      role="status"
      aria-live="polite"
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.text}
    </div>
  );
}
