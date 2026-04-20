import type { MemoryWriteRequest, MemoryType } from '@supperajan/types';

export interface MemoryWriteDecision {
  allowed: boolean;
  reason: string;
  adjustedRequest?: MemoryWriteRequest;
}

/**
 * Memory write rule engine.
 *
 * Rules are evaluated in priority order. The first rule that matches
 * determines the outcome. Rules can deny, allow, or transform a write request.
 *
 * All write decisions are logged regardless of outcome.
 */
export function evaluateWriteRequest(request: MemoryWriteRequest): MemoryWriteDecision {
  // Rule 1: Content must not be empty
  if (!request.content.trim()) {
    return { allowed: false, reason: 'Memory content is empty' };
  }

  // Rule 2: Content must not exceed length limit
  if (request.content.length > 2000) {
    return {
      allowed: false,
      reason: `Memory content exceeds maximum length of 2000 characters (got ${request.content.length})`,
    };
  }

  // Rule 3: Importance must be in valid range
  if (request.importance !== undefined && (request.importance < 0 || request.importance > 1)) {
    return { allowed: false, reason: 'Memory importance must be between 0 and 1' };
  }

  // Rule 4: Confidence must be in valid range
  if (request.confidence !== undefined && (request.confidence < 0 || request.confidence > 1)) {
    return { allowed: false, reason: 'Memory confidence must be between 0 and 1' };
  }

  // Rule 5: Instructions require explicit source
  if (request.type === 'instruction' && !request.sourceSessionId) {
    return {
      allowed: false,
      reason: 'Instruction memories require a source session ID for auditability',
    };
  }

  // Rule 6: Set safe defaults for importance/confidence
  const adjustedRequest: MemoryWriteRequest = {
    ...request,
    importance: request.importance ?? DEFAULT_IMPORTANCE_BY_TYPE[request.type],
    confidence: request.confidence ?? 0.8,
    visibility: request.visibility ?? 'permanent',
    tags: request.tags ?? [],
    metadata: {
      source: request.metadata?.source ?? 'conversation',
      isVerified: request.metadata?.isVerified ?? false,
      ...request.metadata,
    },
  };

  return { allowed: true, reason: 'Write approved', adjustedRequest };
}

const DEFAULT_IMPORTANCE_BY_TYPE: Record<MemoryType, number> = {
  episodic: 0.4,
  semantic: 0.6,
  preference: 0.7,
  fact: 0.7,
  instruction: 0.9,
  relationship: 0.8,
};

/**
 * Determines whether a conversation turn should trigger a memory extraction attempt.
 * Conservative by default — only extract when signals are strong.
 */
export function shouldAttemptMemoryExtraction(userMessage: string, assistantResponse: string): boolean {
  const combinedText = `${userMessage} ${assistantResponse}`.toLowerCase();

  // Strong personal signals
  const personalSignals = [
    'my name is', 'i am ', 'i\'m ', 'i like', 'i love', 'i hate',
    'i prefer', 'i always', 'i never', 'i usually', 'i work at',
    'i live in', 'remind me', 'don\'t forget', 'remember that',
    'my birthday', 'my job', 'my family', 'my partner',
  ];

  return personalSignals.some((signal) => combinedText.includes(signal));
}
