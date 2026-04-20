'use client';

import { useState, useCallback } from 'react';
import type { ChatMessage } from '@supperajan/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [message.content]);

  return (
    <div className={`group flex animate-slide-up gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar orb — assistant only */}
      {!isUser && (
        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/20">
          <span className="text-[11px] font-bold text-brand-400">S</span>
        </div>
      )}

      <div className={`flex max-w-[82%] flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'rounded-br-sm border border-brand-500/20 bg-brand-500/15 text-neutral-100'
              : 'rounded-bl-sm glass text-neutral-200'
          } ${message.status === 'streaming' ? 'opacity-90' : 'opacity-100'}`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* Streaming cursor */}
          {message.status === 'streaming' && (
            <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-accent-400 align-middle" />
          )}
        </div>

        {/* Meta row */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-neutral-700">
            {formatTime(message.createdAt)}
          </span>

          {/* Copy button — visible on hover */}
          {message.status !== 'streaming' && message.content && (
            <button
              onClick={handleCopy}
              aria-label={copied ? 'Kopyalandı' : 'Kopyala'}
              className="invisible flex items-center gap-1 rounded text-[10px] text-neutral-600 transition-colors group-hover:visible hover:text-neutral-300"
            >
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5l2.5 2.5L9 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Kopyalandı
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <rect x="1" y="3" width="6.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M3.5 3V1.5A.5.5 0 0 1 4 1h5.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H8" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  Kopyala
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
