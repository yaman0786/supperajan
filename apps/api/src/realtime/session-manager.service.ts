import { Injectable } from '@nestjs/common';
import type { Socket } from 'socket.io';
import { LoggerService } from '../common/logger.service.js';

export interface ConnectedSession {
  socketId: string;
  userId: string;
  sessionId: string;
  connectedAt: number;
  assistantMode: string;
}

/**
 * In-memory socket session registry.
 * Tracks which socket belongs to which (userId, chatSessionId) pair.
 *
 * In production with horizontal scaling, replace the in-memory maps
 * with Redis hashes — same interface, different backing store.
 */
@Injectable()
export class SessionManagerService {
  /** socketId → ConnectedSession */
  private readonly sessions = new Map<string, ConnectedSession>();
  /** userId → Set<socketId> (one user may have multiple tabs) */
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(private readonly logger: LoggerService) {}

  register(socket: Socket, userId: string, sessionId: string, assistantMode: string): void {
    const entry: ConnectedSession = {
      socketId: socket.id,
      userId,
      sessionId,
      connectedAt: Date.now(),
      assistantMode,
    };
    this.sessions.set(socket.id, entry);

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socket.id);

    this.logger.info('Socket registered', { socketId: socket.id, userId, sessionId });
  }

  unregister(socketId: string): ConnectedSession | undefined {
    const entry = this.sessions.get(socketId);
    if (!entry) return undefined;

    this.sessions.delete(socketId);
    const userSet = this.userSockets.get(entry.userId);
    if (userSet) {
      userSet.delete(socketId);
      if (userSet.size === 0) this.userSockets.delete(entry.userId);
    }

    this.logger.info('Socket unregistered', { socketId, userId: entry.userId });
    return entry;
  }

  getBySocketId(socketId: string): ConnectedSession | undefined {
    return this.sessions.get(socketId);
  }

  getSocketsForUser(userId: string): string[] {
    return [...(this.userSockets.get(userId) ?? [])];
  }

  get connectedCount(): number {
    return this.sessions.size;
  }
}
