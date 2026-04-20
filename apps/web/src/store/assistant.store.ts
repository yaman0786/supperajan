import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { EmotionState, ChatMessage, ChatSession, AssistantMode } from '@supperajan/types';
import type { AvatarAnimationState, ConnectionState } from '@supperajan/types';

export type { ConnectionState };

export interface Toast {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  code?: string;
}

export interface AssistantStore {
  // ─── Session ───────────────────────────────────────────────────────────────
  currentSession: ChatSession | null;
  setCurrentSession: (session: ChatSession | null) => void;

  // ─── Messages ─────────────────────────────────────────────────────────────
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  appendMessageChunk: (id: string, chunk: string) => void;
  clearMessages: () => void;

  // ─── Avatar state ──────────────────────────────────────────────────────────
  avatarState: AvatarAnimationState;
  emotionState: EmotionState;
  setAvatarState: (state: AvatarAnimationState) => void;
  setEmotionState: (state: EmotionState) => void;

  // ─── Assistant mode ────────────────────────────────────────────────────────
  assistantMode: AssistantMode;
  setAssistantMode: (mode: AssistantMode) => void;

  // ─── Connection ────────────────────────────────────────────────────────────
  connectionState: ConnectionState;
  setConnectionState: (state: ConnectionState) => void;

  // ─── Voice ────────────────────────────────────────────────────────────────
  isMicActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  partialTranscript: string;
  setMicActive: (active: boolean) => void;
  setListening: (listening: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setAudioLevel: (level: number) => void;
  setPartialTranscript: (text: string) => void;

  // ─── UI panels ────────────────────────────────────────────────────────────
  activePanel: 'chat' | 'memory' | 'knowledge' | 'settings' | null;
  setActivePanel: (panel: AssistantStore['activePanel']) => void;

  // ─── Loading/thinking ─────────────────────────────────────────────────────
  isThinking: boolean;
  isStreaming: boolean;
  setThinking: (thinking: boolean) => void;
  setStreaming: (streaming: boolean) => void;

  // ─── Toasts ───────────────────────────────────────────────────────────────
  toasts: Toast[];
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
}

export const useAssistantStore = create<AssistantStore>()(
  subscribeWithSelector((set) => ({
    // Session
    currentSession: null,
    setCurrentSession: (session) => set({ currentSession: session }),

    // Messages
    messages: [],
    addMessage: (message) =>
      set((s) => ({ messages: [...s.messages, message] })),
    updateMessage: (id, patch) =>
      set((s) => ({
        messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      })),
    appendMessageChunk: (id, chunk) =>
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === id ? { ...m, content: m.content + chunk } : m,
        ),
      })),
    clearMessages: () => set({ messages: [] }),

    // Avatar state
    avatarState: 'idle',
    emotionState: 'idle',
    setAvatarState: (avatarState) => set({ avatarState }),
    setEmotionState: (emotionState) => set({ emotionState }),

    // Assistant mode
    assistantMode: 'friendly',
    setAssistantMode: (assistantMode) => set({ assistantMode }),

    // Connection
    connectionState: 'disconnected',
    setConnectionState: (connectionState) => set({ connectionState }),

    // Voice
    isMicActive: false,
    isListening: false,
    isSpeaking: false,
    audioLevel: 0,
    partialTranscript: '',
    setMicActive: (isMicActive) => set({ isMicActive }),
    setListening: (isListening) =>
      set((s) => ({
        isListening,
        avatarState: isListening ? 'listening' : s.avatarState,
        emotionState: isListening ? 'listening' : s.emotionState,
      })),
    setSpeaking: (isSpeaking) =>
      set((s) => ({
        isSpeaking,
        avatarState: isSpeaking ? 'speaking' : s.avatarState,
        emotionState: isSpeaking ? 'speaking' : s.emotionState,
      })),
    setAudioLevel: (audioLevel) => set({ audioLevel }),
    setPartialTranscript: (partialTranscript) => set({ partialTranscript }),

    // UI panels
    activePanel: null,
    setActivePanel: (activePanel) => set({ activePanel }),

    // Loading/thinking
    isThinking: false,
    isStreaming: false,
    setThinking: (isThinking) =>
      set((s) => ({
        isThinking,
        avatarState: isThinking ? 'thinking' : s.avatarState,
        emotionState: isThinking ? 'thinking' : s.emotionState,
      })),
    setStreaming: (isStreaming) => set({ isStreaming }),

    // Toasts
    toasts: [],
    addToast: (toast) =>
      set((s) => ({ toasts: [...s.toasts, toast] })),
    removeToast: (id) =>
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  })),
);
