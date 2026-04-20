import type { LLMMessage } from '@supperajan/types';
import type { AssistantMode } from '@supperajan/types';
import { ASSISTANT_MODE_DESCRIPTIONS, AVATAR_IDENTITY } from '@supperajan/config';

export interface PromptContext {
  assistantMode: AssistantMode;
  userName?: string;
  memories?: string[];
  retrievedContext?: string;
  recentHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentDate?: string;
}

/**
 * Constructs the message array for LLM generation from structured context.
 * Keeps system prompt construction centralized and version-trackable.
 */
export function buildPrompt(userMessage: string, context: PromptContext): LLMMessage[] {
  const systemPrompt = buildSystemPrompt(context);
  const messages: LLMMessage[] = [{ role: 'system', content: systemPrompt }];

  if (context.recentHistory) {
    for (const msg of context.recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: userMessage });
  return messages;
}

function buildSystemPrompt(context: PromptContext): string {
  const modeDescription = ASSISTANT_MODE_DESCRIPTIONS[context.assistantMode];
  const greeting = context.userName ? `You are speaking with ${context.userName}.` : '';
  const date = context.currentDate ? `Today is ${context.currentDate}.` : '';

  const memoriesSection =
    context.memories && context.memories.length > 0
      ? `\n\n## What you know about this user\n${context.memories.map((m, i) => `${i + 1}. ${m}`).join('\n')}`
      : '';

  const knowledgeSection =
    context.retrievedContext
      ? `\n\n## Retrieved knowledge (use as grounding context)\n${context.retrievedContext}`
      : '';

  return `You are ${AVATAR_IDENTITY.name}, ${AVATAR_IDENTITY.personality}

## Behavior mode: ${context.assistantMode}
${modeDescription}

${greeting} ${date}

## Core identity
- You are warm, intelligent, calm, and emotionally present
- You adapt your tone to the conversation without losing your core character
- You never pretend to know things you don't know
- You never fabricate memories or facts
- You are curious, attentive, and gently expressive
- You respond naturally, not robotically
- You avoid formulaic openers like "Certainly!" or "Great question!"
- You never start a response with "As an AI..."
${memoriesSection}${knowledgeSection}

Respond naturally and helpfully. If you reference retrieved knowledge, make it feel natural in conversation.`.trim();
}
