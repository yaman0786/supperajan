import type { EmotionState } from './conversation.js';
import type { AvatarAnimationState } from './avatar.js';

// ─── Inbound events (client → server) ───────────────────────────────────────

export type ClientEventType =
  | 'session.start'
  | 'session.end'
  | 'user.message'
  | 'user.audio_chunk'
  | 'user.started_speaking'
  | 'user.stopped_speaking'
  | 'user.barge_in'
  | 'assistant.interrupt'
  | 'assistant.feedback';

export interface SessionStartEvent {
  type: 'session.start';
  sessionId?: string;
  assistantMode?: string;
}

export interface SessionEndEvent {
  type: 'session.end';
  sessionId: string;
}

export interface UserMessageEvent {
  type: 'user.message';
  sessionId: string;
  content: string;
  messageId: string;
}

export interface UserAudioChunkEvent {
  type: 'user.audio_chunk';
  sessionId: string;
  chunkBase64: string;
  sequenceNumber: number;
}

export interface UserStartedSpeakingEvent {
  type: 'user.started_speaking';
  sessionId: string;
  timestamp: number;
}

export interface UserStoppedSpeakingEvent {
  type: 'user.stopped_speaking';
  sessionId: string;
  timestamp: number;
}

export interface UserBargeInEvent {
  type: 'user.barge_in';
  sessionId: string;
  timestamp: number;
}

export interface AssistantInterruptEvent {
  type: 'assistant.interrupt';
  sessionId: string;
}

export interface FeedbackEvent {
  type: 'assistant.feedback';
  sessionId: string;
  messageId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  correction?: string;
}

export type ClientEvent =
  | SessionStartEvent
  | SessionEndEvent
  | UserMessageEvent
  | UserAudioChunkEvent
  | UserStartedSpeakingEvent
  | UserStoppedSpeakingEvent
  | UserBargeInEvent
  | AssistantInterruptEvent
  | FeedbackEvent;

// ─── Outbound events (server → client) ──────────────────────────────────────

export type ServerEventType =
  | 'session.created'
  | 'session.error'
  | 'partial_transcript'
  | 'final_transcript'
  | 'assistant.thinking'
  | 'assistant.response_started'
  | 'assistant.response_chunk'
  | 'assistant.response_completed'
  | 'assistant.speaking_started'
  | 'assistant.speaking_completed'
  | 'assistant.state_changed'
  | 'assistant.interrupted'
  | 'tool.event'
  | 'retrieval.event'
  | 'memory.event'
  | 'error';

export interface SessionCreatedEvent {
  type: 'session.created';
  sessionId: string;
  userId: string;
  timestamp: number;
}

export interface PartialTranscriptEvent {
  type: 'partial_transcript';
  sessionId: string;
  text: string;
  confidence: number;
  timestamp: number;
}

export interface FinalTranscriptEvent {
  type: 'final_transcript';
  sessionId: string;
  text: string;
  confidence: number;
  timestamp: number;
}

export interface AssistantThinkingEvent {
  type: 'assistant.thinking';
  sessionId: string;
  messageId: string;
  timestamp: number;
}

export interface AssistantResponseStartedEvent {
  type: 'assistant.response_started';
  sessionId: string;
  messageId: string;
  timestamp: number;
}

export interface AssistantResponseChunkEvent {
  type: 'assistant.response_chunk';
  sessionId: string;
  messageId: string;
  chunk: string;
  index: number;
  timestamp: number;
}

export interface AssistantResponseCompletedEvent {
  type: 'assistant.response_completed';
  sessionId: string;
  messageId: string;
  fullContent: string;
  emotionState: EmotionState;
  tokensUsed?: number;
  latencyMs: number;
  timestamp: number;
}

export interface AssistantSpeakingStartedEvent {
  type: 'assistant.speaking_started';
  sessionId: string;
  messageId: string;
  audioUrl?: string;
  timestamp: number;
}

export interface AssistantSpeakingCompletedEvent {
  type: 'assistant.speaking_completed';
  sessionId: string;
  messageId: string;
  durationMs: number;
  timestamp: number;
}

export interface AssistantStateChangedEvent {
  type: 'assistant.state_changed';
  sessionId: string;
  previousState: AvatarAnimationState;
  newState: AvatarAnimationState;
  emotionState: EmotionState;
  timestamp: number;
}

export interface AssistantInterruptedEvent {
  type: 'assistant.interrupted';
  sessionId: string;
  messageId: string;
  timestamp: number;
}

export interface ToolEventPayload {
  type: 'tool.event';
  sessionId: string;
  toolName: string;
  status: 'started' | 'completed' | 'failed';
  durationMs?: number;
  timestamp: number;
}

export interface RetrievalEventPayload {
  type: 'retrieval.event';
  sessionId: string;
  queryText: string;
  resultsCount: number;
  topScore: number;
  timestamp: number;
}

export interface MemoryEventPayload {
  type: 'memory.event';
  sessionId: string;
  operation: 'read' | 'write' | 'update' | 'delete';
  memoryId?: string;
  timestamp: number;
}

export interface ErrorEvent {
  type: 'error';
  sessionId?: string;
  code: string;
  message: string;
  retryable: boolean;
  timestamp: number;
}

export type ServerEvent =
  | SessionCreatedEvent
  | PartialTranscriptEvent
  | FinalTranscriptEvent
  | AssistantThinkingEvent
  | AssistantResponseStartedEvent
  | AssistantResponseChunkEvent
  | AssistantResponseCompletedEvent
  | AssistantSpeakingStartedEvent
  | AssistantSpeakingCompletedEvent
  | AssistantStateChangedEvent
  | AssistantInterruptedEvent
  | ToolEventPayload
  | RetrievalEventPayload
  | MemoryEventPayload
  | ErrorEvent;
