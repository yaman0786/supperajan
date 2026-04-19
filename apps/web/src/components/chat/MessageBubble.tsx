'use client';

import type { ChatMessage } from '@supperajan/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="mr-2 mt-1 h-6 w-6 flex-shrink-0 rounded-full bg-brand-500 flex items-center justify-center">
          <span className="text-xs font-bold text-white">S</span>
        </div>
      )}

      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-sm bg-brand-500/25 text-neutral-100 border border-brand-500/20'
            : 'rounded-bl-sm glass text-neutral-200'
        } ${message.status === 'streaming' ? 'opacity-90' : 'opacity-100'}`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        {/* Streaming indicator */}
        {message.status === 'streaming' && (
          <span className="inline-block ml-1 h-3.5 w-0.5 animate-pulse bg-accent-400 align-middle" />
        )}

        {/* Timestamp */}
        <p className={`mt-1 text-[10px] ${isUser ? 'text-brand-400/60 text-right' : 'text-neutral-600'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
