export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UserProfile {
  userId: string;
  preferredName?: string;
  timezone?: string;
  locale: string;
  avatarSettings: AvatarPreferences;
  assistantMode: AssistantMode;
  voiceEnabled: boolean;
  memoryEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvatarPreferences {
  idleAnimationEnabled: boolean;
  expressionsEnabled: boolean;
  glowIntensity: 'low' | 'medium' | 'high';
}

export type AssistantMode =
  | 'friendly'
  | 'professional'
  | 'playful'
  | 'concise'
  | 'deep_research'
  | 'companion'
  | 'productivity'
  | 'emotional_support';

export type UserRole = 'user' | 'admin' | 'developer';
