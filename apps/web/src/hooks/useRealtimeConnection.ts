'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { ServerEvent, ClientEvent, SessionCreatedEvent } from '@supperajan/types';
import { computeReconnectDelay, DEFAULT_RECONNECT_CONFIG } from '@supperajan/realtime';
import { useAssistantStore } from '@/store/assistant.store';

const WS_URL = process.env['NEXT_PUBLIC_WS_URL'] ?? 'ws://localhost:4000';

type EventHandler = (event: ServerEvent) => void;

/**
 * Manages the Socket.IO connection to the realtime gateway.
 *
 * - Auto-connects on mount, auto-reconnects with jitter backoff
 * - Dispatches all incoming server events to the assistant Zustand store
 * - Returns emit() for sending client events
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
  } = useAssistantStore.getState();

  const handleServerEvent = useCallback((event: ServerEvent) => {
    // Fan-out to registered handlers
    for (const h of handlersRef.current) h(event);

    switch (event.type) {
      case 'session.created':
        setConnectionState('authenticated');
        break;

      case 'assistant.thinking':
        setThinking(true);
        setAvatarState('thinking');
        setEmotionState('thinking');
        break;

      case 'assistant.response_started':
        setThinking(false);
        setStreaming(true);
        // Add streaming placeholder message
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
        break;
    }
  }, [
    setConnectionState, setAvatarState, setEmotionState, setThinking,
    setStreaming, addMessage, appendMessageChunk, updateMessage,
    setPartialTranscript, setListening, setSpeaking, setCurrentSession,
  ]);

  const connect = useCallback(async () => {
    // Dynamic import to avoid SSR
    const { io } = await import('socket.io-client');

    const socket = io(`${WS_URL}/realtime`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: false, // We handle reconnection manually
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionState('connected');
      reconnectAttempt.current = 0;
    });

    socket.on('disconnect', () => {
      setConnectionState('disconnected');
      // Manual reconnect with jitter backoff
      const delay = computeReconnectDelay(reconnectAttempt.current, DEFAULT_RECONNECT_CONFIG);
      reconnectAttempt.current = Math.min(reconnectAttempt.current + 1, 10);
      setTimeout(() => { void connect(); }, delay);
    });

    socket.on('connect_error', () => {
      setConnectionState('error');
    });

    // Bind all typed server events
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

  // Auto-connect on mount
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

  const startSession = useCallback((sessionId?: string, assistantMode?: string) => {
    emit({
      type: 'session.start',
      sessionId,
      assistantMode,
    });
  }, [emit]);

  const addHandler = useCallback((handler: EventHandler) => {
    handlersRef.current.push(handler);
    return () => {
      handlersRef.current = handlersRef.current.filter((h) => h !== handler);
    };
  }, []);

  return { emit, startSession, addHandler };
}
