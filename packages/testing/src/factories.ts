import type {
  User,
  UserProfile,
  ChatSession,
  ChatMessage,
  Memory,
  Document,
  AssistantMode,
  EmotionState,
  MessageRole,
  MessageStatus,
  MemoryType,
  MemoryVisibility,
  MemoryStatus,
} from '@supperajan/types';

let counter = 0;
function uid(): string {
  return `test-${++counter}-${Date.now().toString(36)}`;
}
function now(): Date { return new Date(); }

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: uid(),
    email: `user-${uid()}@test.com`,
    displayName: 'Test User',
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function makeUserProfile(userId: string, overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    userId,
    locale: 'en',
    avatarSettings: { idleAnimationEnabled: true, expressionsEnabled: true, glowIntensity: 'medium' },
    assistantMode: 'friendly',
    voiceEnabled: true,
    memoryEnabled: true,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function makeChatSession(userId: string, overrides: Partial<ChatSession> = {}): ChatSession {
  return {
    id: uid(),
    userId,
    assistantMode: 'friendly',
    messageCount: 0,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function makeMessage(
  sessionId: string,
  role: MessageRole = 'user',
  content = 'Test message',
  overrides: Partial<ChatMessage> = {},
): ChatMessage {
  return {
    id: uid(),
    sessionId,
    role,
    content,
    status: 'completed' as MessageStatus,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function makeMemory(userId: string, overrides: Partial<Memory> = {}): Memory {
  return {
    id: uid(),
    userId,
    type: 'semantic' as MemoryType,
    content: 'Test memory content',
    importance: 0.5,
    confidence: 0.8,
    visibility: 'permanent' as MemoryVisibility,
    status: 'active' as MemoryStatus,
    tags: [],
    metadata: { source: 'conversation', isVerified: false },
    createdAt: now(),
    updatedAt: now(),
    accessCount: 0,
    ...overrides,
  };
}

export function makeDocument(userId: string, overrides: Partial<Document> = {}): Document {
  return {
    id: uid(),
    userId,
    fileName: 'test-document.pdf',
    originalFileName: 'test-document.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    documentType: 'pdf',
    status: 'ready',
    chunkCount: 0,
    storageKey: `uploads/${uid()}.pdf`,
    metadata: {},
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}
