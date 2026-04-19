'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { useConversation } from '@/hooks/useConversation';

/**
 * Text input bar with send button.
 * Supports Shift+Enter for newlines, Enter to send.
 * Disabled while the assistant is streaming or thinking.
 * Now wired to the realtime WebSocket via useConversation.
 */
export function MessageInput() {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isThinking, isStreaming, isReady } = useConversation();

  const isDisabled = isThinking || isStreaming || !isReady;
  const canSend = value.trim().length > 0 && !isDisabled;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    sendMessage(value.trim());
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [canSend, value, sendMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const placeholder = !isReady
    ? 'Bağlanıyor...'
    : isDisabled
    ? 'Süpperajan yanıt veriyor...'
    : 'Süpperajan\'a mesaj yaz...';

  return (
    <div className="flex items-end gap-2 p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        disabled={isDisabled}
        rows={1}
        aria-label="Mesaj girişi"
        className="flex-1 resize-none rounded-xl border border-bg-border bg-bg-elevated px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all duration-150 focus:border-accent-600 focus:ring-1 focus:ring-accent-600/30 disabled:cursor-not-allowed disabled:opacity-50"
      />

      <button
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Mesaj gönder"
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
          canSend
            ? 'bg-brand-500 text-white hover:bg-brand-600 active:scale-95'
            : 'bg-bg-elevated text-neutral-600 cursor-not-allowed'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 8h12M10 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
