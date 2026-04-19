export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type MessageStatus =
  | 'pending'
  | 'streaming'
  | 'completed'
  | 'failed'
  | 'interrupted';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  metadata?: MessageMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageMetadata {
  emotionState?: EmotionState;
  toolCalls?: ToolCallRecord[];
  retrievalSources?: RetrievalSource[];
  memoryReferences?: string[];
  tokensUsed?: number;
  latencyMs?: number;
  modelId?: string;
}

export interface RetrievalSource {
  documentId: string;
  chunkId: string;
  score: number;
  excerpt: string;
  fileName?: string;
}

export interface ToolCallRecord {
  toolId: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: 'pending' | 'completed' | 'failed';
  durationMs?: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  assistantMode: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  endedAt?: Date;
}

export type EmotionState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'happy'
  | 'empathetic'
  | 'excited'
  | 'surprised'
  | 'alert'
  | 'curious'
  | 'calm'
  | 'concerned';

export interface ConversationContext {
  sessionId: string;
  userId: string;
  recentMessages: ChatMessage[];
  activeMemories: string[];
  retrievedChunks: RetrievalSource[];
  currentEmotion: EmotionState;
  assistantMode: string;
}
