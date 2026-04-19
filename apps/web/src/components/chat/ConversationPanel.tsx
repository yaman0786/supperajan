'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAssistantStore } from '@/store/assistant.store';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

/**
 * Left-side conversation panel.
 * Shows message history with streaming support and auto-scrolling.
 * Input bar is anchored to the bottom.
 */
export function ConversationPanel() {
  const { messages, isThinking, isStreaming, partialTranscript } = useAssistantStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-bg-border px-4 py-3">
        <span className="text-sm font-semibold text-neutral-100">Conversation</span>
        <span className="text-xs text-neutral-500">{messages.length} messages</span>
      </header>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        role="log"
        aria-live="polite"
        aria-label="Conversation messages"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-neutral-500">
              Say hello or type a message to start.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Partial transcript indicator */}
        {partialTranscript && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-500/20 px-3 py-2 text-sm text-brand-300 italic">
              {partialTranscript}...
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
              <ThinkingDots />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-bg-border">
        <MessageInput />
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1" aria-label="Assistant is thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-accent-400 animate-typing"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
