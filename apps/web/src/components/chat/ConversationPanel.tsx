'use client';

import { useRef, useEffect } from 'react';
import { useAssistantStore } from '@/store/assistant.store';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

export function ConversationPanel() {
  const { messages, isThinking, partialTranscript, currentSession } = useAssistantStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isThinking]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-bg-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/20">
            <span className="text-[11px] font-bold text-brand-400">S</span>
          </div>
          <span className="text-sm font-semibold text-neutral-100">Sohbet</span>
        </div>
        <span className="text-xs text-neutral-600">
          {messages.length > 0 ? `${messages.length} mesaj` : 'Yeni oturum'}
        </span>
      </header>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        role="log"
        aria-live="polite"
        aria-label="Konuşma mesajları"
      >
        {messages.length === 0 ? (
          <EmptyConversation />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {/* Partial transcript */}
        {partialTranscript && (
          <div className="flex justify-end animate-slide-up">
            <div className="max-w-[80%] rounded-2xl rounded-br-sm border border-brand-500/20 bg-brand-500/10 px-3 py-2 text-sm italic text-brand-300">
              {partialTranscript}
              <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-brand-400 align-middle" />
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex items-start gap-2 animate-slide-up">
            <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/20">
              <span className="text-[11px] font-bold text-brand-400">S</span>
            </div>
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
              <ThinkingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-bg-border">
        <MessageInput />
      </div>
    </div>
  );
}

function EmptyConversation() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-brand-500/20 bg-brand-500/10">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-brand-400">
          <path d="M16 4C9.373 4 4 9.373 4 16c0 2.62.847 5.046 2.284 7.018L4 28l5.133-2.21A11.94 11.94 0 0 0 16 28c6.627 0 12-5.373 12-12S22.627 4 16 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10.5 14.5h11M10.5 18h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-neutral-200">Süpperajan hazır</h3>
        <p className="max-w-[200px] text-xs leading-relaxed text-neutral-500">
          Bir şeyler yazın ya da mikrofona basıp konuşmaya başlayın.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {['Merhaba!', 'Ne yapabilirsin?', 'Bana yardım et'].map((prompt) => (
          <SuggestedPrompt key={prompt} text={prompt} />
        ))}
      </div>
    </div>
  );
}

function SuggestedPrompt({ text }: { text: string }) {
  const { connectionState } = useAssistantStore();
  const isReady = connectionState === 'connected' || connectionState === 'authenticated';

  const handleClick = () => {
    if (!isReady) return;
    useAssistantStore.getState().addMessage({
      id: crypto.randomUUID(),
      sessionId: useAssistantStore.getState().currentSession?.id ?? 'pending',
      role: 'user',
      content: text,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isReady}
      className="rounded-full border border-bg-border bg-bg-elevated px-3 py-1.5 text-xs text-neutral-400 transition-all hover:border-neutral-600 hover:text-neutral-200 disabled:opacity-40"
    >
      {text}
    </button>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1.5" aria-label="Süpperajan düşünüyor">
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
