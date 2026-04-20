'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { ServerEvent, ClientEvent } from '@supperajan/types';
import { computeReconnectDelay, DEFAULT_RECONNECT_CONFIG } from '@supperajan/realtime';
import { useAssistantStore } from '@/store/assistant.store';

const WS_URL = process.env['NEXT_PUBLIC_WS_URL'] ?? 'ws://localhost:4000';

type EventHandler = (event: ServerEvent) => void;

/**
 * Manages the Socket.IO connection to the realtime gateway.
 *
 * - Auto-connects on mount, auto-reconnects with jitter backoff
 * - Dispatches all incoming server events to the Zustand store
 * - Exposes emit() for sending client events and startSession() for session bootstrap
 *
 * Socket.IO is loaded dynamically to prevent SSR issues in Next.js.
 */
export function useRealtimeConnection() {
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempt = useRef(0);
  const handlersRef = useRef<EventHandler[]>([]);

  const {
    setConnectionState,
    setAvatarState,
    setEmotionState,
    setThinking,
    setStreaming,
    addMessage,
    appendMessageChunk,
    updateMessage,
    setPartialTranscript,
    setListening,
    setSpeaking,
    setCurrentSession,
    assistantMode,
  } = useAssistantStore.getState();

  const handleServerEvent = useCallback((event: ServerEvent) => {
    for (const h of handlersRef.current) h(event);

    switch (event.type) {
      case 'session.created':
        setConnectionState('authenticated');
        // Populate currentSession in the store
        setCurrentSession({
          id: event.sessionId,
          userId: event.userId,
          assistantMode: useAssistantStore.getState().assistantMode,
          messageCount: 0,
          createdAt: new Date(event.timestamp),
          updatedAt: new Date(event.timestamp),
        });
        break;

      case 'assistant.thinking':
        setThinking(true);
        setAvatarState('thinking');
        setEmotionState('thinking');
        break;

      case 'assistant.response_started':
        setThinking(false);
        setStreaming(true);
        addMessage({
          id: event.messageId,
          sessionId: event.sessionId,
          role: 'assistant',
          content: '',
          status: 'streaming',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        break;

      case 'assistant.response_chunk':
        appendMessageChunk(event.messageId, event.chunk);
        break;

      case 'assistant.response_completed':
        setStreaming(false);
        updateMessage(event.messageId, {
          content: event.fullContent,
          status: 'completed',
          metadata: { emotionState: event.emotionState, tokensUsed: event.tokensUsed },
        });
        break;

      case 'assistant.interrupted':
        setThinking(false);
        setStreaming(false);
        // Mark last streaming message as interrupted
        {
          const msgs = useAssistantStore.getState().messages;
          const last = msgs.findLast?.((m) => m.status === 'streaming');
          if (last) updateMessage(last.id, { status: 'interrupted' });
        }
        setAvatarState('idle');
        setEmotionState('idle');
        break;

      case 'assistant.state_changed':
        setAvatarState(event.newState);
        setEmotionState(event.emotionState);
        break;

      case 'assistant.speaking_started':
        setSpeaking(true);
        break;

      case 'assistant.speaking_completed':
        setSpeaking(false);
        break;

      case 'partial_transcript':
        setPartialTranscript(event.text);
        break;

      case 'final_transcript':
        setPartialTranscript('');
        break;

      case 'error':
        setThinking(false);
        setStreaming(false);
        setAvatarState('idle');
        setEmotionState('idle');
        // Route error to toast store
        useAssistantStore.getState().addToast?.({
          id: crypto.randomUUID(),
          type: 'error',
          message: event.message,
          code: event.code,
        });
        break;
    }
  }, [
    setConnectionState, setAvatarState, setEmotionState, setThinking,
    setStreaming, addMessage, appendMessageChunk, updateMessage,
    setPartialTranscript, setListening, setSpeaking, setCurrentSession,
  ]);

  const startSession = useCallback((sessionId?: string, mode?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('session.start', {
        type: 'session.start',
        sessionId,
        assistantMode: mode ?? useAssistantStore.getState().assistantMode,
      });
    }
  }, []);

  const connect = useCallback(async () => {
    const { io } = await import('socket.io-client');

    const socket = io(`${WS_URL}/realtime`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: false,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionState('connected');
      reconnectAttempt.current = 0;
    });

    socket.on('disconnect', () => {
      setConnectionState('disconnected');
      // Signal useConversation to re-bootstrap on next connect
      useAssistantStore.getState().setCurrentSession(null);

      const delay = computeReconnectDelay(reconnectAttempt.current, DEFAULT_RECONNECT_CONFIG);
      reconnectAttempt.current = Math.min(reconnectAttempt.current + 1, 10);
      setTimeout(() => { void connect(); }, delay);
    });

    socket.on('connect_error', () => {
      setConnectionState('error');
    });

    const SERVER_EVENTS: ServerEvent['type'][] = [
      'session.created', 'session.error',
      'partial_transcript', 'final_transcript',
      'assistant.thinking', 'assistant.response_started',
      'assistant.response_chunk', 'assistant.response_completed',
      'assistant.speaking_started', 'assistant.speaking_completed',
      'assistant.state_changed', 'assistant.interrupted',
      'tool.event', 'retrieval.event', 'memory.event', 'error',
    ];

    for (const eventType of SERVER_EVENTS) {
      socket.on(eventType, (data: ServerEvent) => handleServerEvent(data));
    }

    setConnectionState('connecting');
  }, [handleServerEvent, setConnectionState]);

  useEffect(() => {
    void connect();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [connect]);

  const emit = useCallback((event: ClientEvent) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event.type, event);
    }
  }, []);

  const addHandler = useCallback((handler: EventHandler) => {
    handlersRef.current.push(handler);
    return () => {
      handlersRef.current = handlersRef.current.filter((h) => h !== handler);
    };
  }, []);

  return { emit, startSession, addHandler };
}
