import type { AppEnv } from './env.js';
import type { AssistantMode } from '@supperajan/types';

export interface AppConfig {
  env: AppEnv['NODE_ENV'];
  port: number;
  appUrl: string;
  apiUrl: string;
  corsOrigins: string[];
  rateLimit: { windowMs: number; maxRequests: number };
  features: {
    voice: boolean;
    memory: boolean;
    knowledge: boolean;
    debug: boolean;
  };
}

export function buildAppConfig(env: AppEnv): AppConfig {
  return {
    env: env.NODE_ENV,
    port: env.PORT,
    appUrl: env.APP_URL,
    apiUrl: env.API_URL,
    corsOrigins: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },
    features: {
      voice: env.ENABLE_VOICE,
      memory: env.ENABLE_MEMORY,
      knowledge: env.ENABLE_KNOWLEDGE,
      debug: env.DEBUG_MODE,
    },
  };
}

// ─── Assistant Mode System Prompts ──────────────────────────────────────────

export const ASSISTANT_MODE_DESCRIPTIONS: Record<AssistantMode, string> = {
  friendly: 'Warm, conversational, and supportive. Balances helpfulness with a natural, human-like tone.',
  professional: 'Clear, precise, and efficient. Focuses on task accuracy and structured responses.',
  playful: 'Light-hearted and fun, with gentle humor. Still accurate and helpful, but lighter in tone.',
  concise: 'Extremely brief and direct. Answers in the fewest necessary words without sacrificing accuracy.',
  deep_research: 'Thorough and methodical. Explores topics deeply, provides sources, considers multiple angles.',
  companion: 'Emotionally present and caring. Listens actively and responds with warmth and attention.',
  productivity: 'Goal-oriented and action-focused. Helps plan, organize, and execute tasks efficiently.',
  emotional_support: 'Empathetic and gentle. Prioritizes emotional validation over problem-solving.',
};

export const DEFAULT_ASSISTANT_MODE: AssistantMode = 'friendly';

// ─── Avatar Identity Config ──────────────────────────────────────────────────

export interface AvatarIdentityConfig {
  name: string;
  personality: string;
  primaryColor: string;
  accentColor: string;
  eyeGlowColor: string;
  chestLightColor: string;
}

export const AVATAR_IDENTITY: AvatarIdentityConfig = {
  name: 'Süpperajan',
  personality: 'An intelligent, warm, and emotionally aware AI companion embodied as a friendly orange robot.',
  primaryColor: '#E8611A',
  accentColor: '#1A8FE8',
  eyeGlowColor: '#00BFFF',
  chestLightColor: '#00BFFF',
};
