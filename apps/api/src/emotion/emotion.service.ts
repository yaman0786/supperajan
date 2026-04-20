import { Injectable } from '@nestjs/common';
import type { EmotionState } from '@supperajan/types';
import { DatabaseService } from '../database/database.service.js';
import { LoggerService } from '../common/logger.service.js';

export interface EmotionSnapshot {
  sessionId: string;
  messageId: string;
  emotionState: EmotionState;
  previousEmotion?: EmotionState;
  trigger: string;
  timestamp: Date;
}

export interface ConversationMood {
  dominant: EmotionState;
  distribution: Partial<Record<EmotionState, number>>;
  positivityScore: number; // 0–1
  engagementScore: number; // 0–1
}

const POSITIVE_EMOTIONS: EmotionState[] = ['happy', 'excited', 'curious'];
const ENGAGED_EMOTIONS: EmotionState[] = ['curious', 'excited', 'thinking', 'listening'];

/**
 * Tracks and persists emotion states per session.
 * Provides conversation-level mood analytics for adaptive behavior.
 */
@Injectable()
export class EmotionService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  /** Persist an emotion snapshot for analytics. Fire-and-forget safe. */
  async snapshotEmotion(snapshot: EmotionSnapshot): Promise<void> {
    try {
      await this.db.assistantStateSnapshot.create({
        data: {
          sessionId: snapshot.sessionId,
          messageId: snapshot.messageId,
          animationState: snapshot.emotionState.toUpperCase() as never,
          emotionState: snapshot.emotionState,
          trigger: snapshot.trigger,
        },
      });
    } catch (err) {
      // Non-critical — log and continue
      this.logger.warn('EmotionService.snapshotEmotion failed', {
        error: String(err),
        sessionId: snapshot.sessionId,
      });
    }
  }

  /** Get recent emotion states for a session (last N). */
  async getRecentEmotions(sessionId: string, limit = 10): Promise<EmotionState[]> {
    try {
      const rows = await this.db.assistantStateSnapshot.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { emotionState: true },
      });
      return rows.map((r) => r.emotionState as EmotionState);
    } catch {
      return [];
    }
  }

  /** Compute aggregate mood for a session. */
  async analyzeConversationMood(sessionId: string): Promise<ConversationMood> {
    const emotions = await this.getRecentEmotions(sessionId, 20);

    if (emotions.length === 0) {
      return { dominant: 'idle', distribution: {}, positivityScore: 0.5, engagementScore: 0.5 };
    }

    // Count distribution
    const distribution: Partial<Record<EmotionState, number>> = {};
    for (const e of emotions) {
      distribution[e] = (distribution[e] ?? 0) + 1;
    }

    // Find dominant
    const dominant = (Object.entries(distribution).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'idle') as EmotionState;

    // Positivity score
    const positiveCount = emotions.filter((e) => POSITIVE_EMOTIONS.includes(e)).length;
    const positivityScore = positiveCount / emotions.length;

    // Engagement score
    const engagedCount = emotions.filter((e) => ENGAGED_EMOTIONS.includes(e)).length;
    const engagementScore = engagedCount / emotions.length;

    return { dominant, distribution, positivityScore, engagementScore };
  }

  /** Determine if the avatar should express a reaction based on emotion change. */
  shouldTriggerReaction(from: EmotionState, to: EmotionState): ReactionType | null {
    if (to === 'happy' && from !== 'happy') return 'celebrate';
    if (to === 'excited') return 'energize';
    if (to === 'empathetic' && (from === 'idle' || from === 'thinking')) return 'soften';
    if (to === 'surprised') return 'startle';
    if (to === 'alert') return 'focus';
    return null;
  }
}

export type ReactionType = 'celebrate' | 'energize' | 'soften' | 'startle' | 'focus';
