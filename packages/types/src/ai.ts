import type { EmotionState } from './conversation.js';
import type { AssistantMode } from './user.js';

export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'azure_openai' | 'local';
export type EmbeddingsProvider = 'openai' | 'cohere' | 'google' | 'local';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | LLMContentPart[];
  toolCallId?: string;
  toolCalls?: LLMToolCall[];
}

export interface LLMContentPart {
  type: 'text' | 'image_url';
  text?: string;
  imageUrl?: { url: string; detail?: 'auto' | 'low' | 'high' };
}

export interface LLMToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface LLMGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  stream?: boolean;
  tools?: LLMTool[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface LLMTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface LLMResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'null';
  toolCalls?: LLMToolCall[];
  usage: LLMUsage;
  model: string;
  latencyMs: number;
}

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens?: number;
}

export interface LLMStreamChunk {
  delta: string;
  index: number;
  finishReason?: string;
  toolCallDelta?: Partial<LLMToolCall>;
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokenCount: number;
}

export interface OrchestrationRequest {
  userId: string;
  sessionId: string;
  messageId: string;
  userMessage: string;
  assistantMode: AssistantMode;
  includeMemory: boolean;
  includeRetrieval: boolean;
  tools?: string[];
  streamCallback?: (chunk: LLMStreamChunk) => void;
}

export interface OrchestrationResponse {
  messageId: string;
  content: string;
  emotionState: EmotionState;
  toolCallsExecuted: string[];
  memoriesWritten: string[];
  sourcesUsed: string[];
  usage: LLMUsage;
  latencyMs: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  version: number;
  systemPrompt: string;
  assistantMode: AssistantMode;
  isActive: boolean;
  createdAt: Date;
}

export interface SafetyEvaluation {
  isSafe: boolean;
  reason?: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high';
}
