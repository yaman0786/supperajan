// Types for the AI companion application

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  emotionalTone?: EmotionalTone;
}

export type EmotionalTone = 
  | 'happy' 
  | 'sad' 
  | 'excited' 
  | 'calm' 
  | 'concerned' 
  | 'neutral'
  | 'empathetic'
  | 'supportive';

export interface UserProfile {
  id: string;
  name: string;
  preferences: Record<string, any>;
  conversationHistory: Message[];
  emotionalState?: EmotionalTone;
  personalData: Record<string, any>;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  isCompleted: boolean;
  emotionalContext?: string;
}

export interface AvatarState {
  expression: 'smile' | 'neutral' | 'concerned' | 'excited' | 'thinking';
  gesture: 'wave' | 'nod' | 'idle' | 'listening' | 'speaking';
  lipSyncActive: boolean;
  emotionalTone: EmotionalTone;
}

export interface AIResponse {
  text: string;
  emotionalTone: EmotionalTone;
  suggestions?: string[];
  personalizedContext?: Record<string, any>;
}
