'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAssistantStore } from '@/store/assistant.store';
import { useRealtimeConnection } from './useRealtimeConnection';

/**
 * High-level conversation hook.
 * Combines the realtime WebSocket connection with UI state.
 *
 * Responsibilities:
 *  - Bootstrap a session once the connection is established
 *  - Re-bootstrap on reconnect (when currentSession is cleared on disconnect)
 *  - Send text messages over WebSocket with optimistic UI updates
 *  - Expose interrupt() for barge-in
 *  - Expose isReady flag for UI gating
 */
export function useConversation() {
  const sessionStarted = useRef(false);

  const {
    currentSession,
    connectionState,
    assistantMode,
    isThinking,
    isStreaming,
  } = useAssistantStore();

  const { emit, startSession } = useRealtimeConnection();

  // ── Bootstrap session once connected ─────────────────────────────────────
  useEffect(() => {
    if (connectionState !== 'connected') {
      // Reset flag when disconnected so next connect triggers re-bootstrap
      if (connectionState === 'disconnected') {
        sessionStarted.current = false;
      }
      return;
    }
    if (sessionStarted.current) return;
    sessionStarted.current = true;
    startSession(undefined, assistantMode);
  }, [connectionState, assistantMode, startSession]);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isThinking || isStreaming) return;

      const messageId = crypto.randomUUID();
      const sessionId = currentSession?.id ?? 'pending';

      useAssistantStore.getState().addMessage({
        id: messageId,
        sessionId,
        role: 'user',
        content: trimmed,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      useAssistantStore.getState().setAvatarState('thinking');
      useAssistantStore.getState().setThinking(true);

      emit({
        type: 'user.message',
        sessionId,
        content: trimmed,
        messageId,
      });
    },
    [currentSession, isThinking, isStreaming, emit],
  );

  const interrupt = useCallback(() => {
    emit({
      type: 'user.barge_in',
      sessionId: currentSession?.id ?? '',
      timestamp: Date.now(),
    });
  }, [currentSession, emit]);

  const isReady = connectionState === 'connected' || connectionState === 'authenticated';

  return {
    sendMessage,
    interrupt,
    isReady,
    connectionState,
    isThinking,
    isStreaming,
  };
}
