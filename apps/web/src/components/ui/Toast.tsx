'use client';

import { useEffect } from 'react';
import { useAssistantStore, type Toast } from '@/store/assistant.store';

const TOAST_DURATION_MS = 5000;

const TOAST_STYLES: Record<Toast['type'], { bg: string; border: string; icon: string; dot: string }> = {
  error: {
    bg: 'bg-red-950/95',
    border: 'border-red-800/50',
    icon: 'text-red-400',
    dot: 'bg-red-400',
  },
  warning: {
    bg: 'bg-yellow-950/95',
    border: 'border-yellow-800/50',
    icon: 'text-yellow-400',
    dot: 'bg-yellow-400',
  },
  info: {
    bg: 'bg-bg-elevated/95',
    border: 'border-bg-border',
    icon: 'text-accent-400',
    dot: 'bg-accent-400',
  },
  success: {
    bg: 'bg-green-950/95',
    border: 'border-green-800/50',
    icon: 'text-green-400',
    dot: 'bg-green-400',
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useAssistantStore();
  const s = TOAST_STYLES[toast.type];

  useEffect(() => {
    const t = setTimeout(() => removeToast(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [toast.id, removeToast]);

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-slide-up ${s.bg} ${s.border}`}
      role="alert"
    >
      <span className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${s.dot}`}>
        {toast.type === 'error' && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
            <path d="M5 3v2.5M5 7h.01" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        )}
        {toast.type === 'success' && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${s.icon}`}>{toast.message}</p>
        {toast.code && (
          <p className="mt-0.5 text-[10px] font-mono text-neutral-600">{toast.code}</p>
        )}
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        aria-label="Kapat"
        className="ml-1 flex-shrink-0 text-neutral-600 transition-colors hover:text-neutral-300"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useAssistantStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-4 z-[100] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2"
      aria-live="assertive"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
