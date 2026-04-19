'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAssistantStore } from '@/store/assistant.store';
import { useRealtimeConnection } from './useRealtimeConnection';
import { apiClient } from '@/lib/api-client';

/**
 * High-level conversation hook.
 * Combines the realtime WebSocket connection with the REST API.
 *
 * Responsibilities:
 *  - Bootstrap a session on first load
 *  - Send text messages over WebSocket
 *  - Expose isReady flag for UI gating
 */
export function useConversation() {
  const sessionStarted = useRef(false);

  const {
    currentSession,
    setCurrentSession,
    connectionState,
    assistantMode,
    isThinking,
    isStreaming,
  } = useAssistantStore();

  const { emit, startSession } = useRealtimeConnection();

  // ── Bootstrap session once connected ─────────────────────────────────────
  useEffect(() => {
    if (connectionState !== 'connected' || sessionStarted.current) return;
    sessionStarted.current = true;

    // Start session over WebSocket (gateway creates DB record)
    startSession(undefined, assistantMode);
  }, [connectionState, assistantMode, startSession]);

  // ── Track created session from WS events ─────────────────────────────────
  useEffect(() => {
    if (currentSession) return;

    // session.created is handled in useRealtimeConnection which calls
    // setConnectionState('authenticated') — we poll for the sessionId
    // via the assistant store once set there.
    // Full session binding is done in Phase 5 with proper event routing.
  }, [currentSession]);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isThinking || isStreaming) return;

      const messageId = crypto.randomUUID();
      const sessionId = currentSession?.id ?? 'pending';

      // Optimistically add user message to UI
      useAssistantStore.getState().addMessage({
        id: messageId,
        sessionId,
        role: 'user',
        content: trimmed,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Transition avatar to listening → thinking
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
    emit({ type: 'user.barge_in', sessionId: currentSession?.id ?? '', timestamp: Date.now() });
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
