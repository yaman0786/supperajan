'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api-client';

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  avgMessagesPerSession: number;
  totalMessages: number;
}

export interface UsageStats {
  totalTokensUsed: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  messagesLast24h: number;
  sessionsLast24h: number;
}

export interface EmotionStats {
  distribution: Record<string, number>;
  mostCommon: string;
  totalSnapshots: number;
}

export interface AnalyticsData {
  sessions: SessionStats | null;
  usage: UsageStats | null;
  emotions: EmotionStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAnalytics(userId?: string): AnalyticsData {
  const [sessions, setSessions] = useState<SessionStats | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [emotions, setEmotions] = useState<EmotionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';

    Promise.all([
      apiGet<SessionStats>(`/analytics/sessions${params}`),
      apiGet<UsageStats>(`/analytics/usage${params}`),
      apiGet<EmotionStats>(`/analytics/emotions${params}`),
    ])
      .then(([s, u, e]) => {
        if (cancelled) return;
        setSessions(s);
        setUsage(u);
        setEmotions(e);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Analytics yüklenemedi');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [userId, tick]);

  return { sessions, usage, emotions, loading, error, refresh };
}
