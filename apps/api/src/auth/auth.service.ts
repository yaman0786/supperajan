import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { LoggerService } from '../common/logger.service.js';
import type { AuthenticatedUser } from './current-user.decorator.js';

/**
 * Auth service — user resolution and profile bootstrapping.
 *
 * Phase 2: Ensures a dev user exists in the database for local development.
 * Phase 11: Adds full JWT issuance, refresh tokens, OAuth providers.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Ensures a user row exists for the given ID.
   * Called on first realtime connection to bootstrap dev users automatically.
   */
  async ensureUserExists(user: AuthenticatedUser): Promise<void> {
    const existing = await this.db.user.findUnique({ where: { id: user.id } });
    if (existing) return;

    await this.db.user.create({
      data: {
        id: user.id,
        email: user.email,
        displayName: user.email.split('@')[0] ?? 'User',
        role: user.role,
        profile: {
          create: {
            locale: 'tr',
            assistantMode: 'friendly',
            voiceEnabled: true,
            memoryEnabled: true,
            avatarSettings: {
              idleAnimationEnabled: true,
              expressionsEnabled: true,
              glowIntensity: 'medium',
            },
          },
        },
      },
    });

    this.logger.info('Auto-created user', { userId: user.id, email: user.email });
  }
}
