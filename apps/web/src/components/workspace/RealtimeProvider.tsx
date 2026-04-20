'use client';

import { useEffect } from 'react';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';

/**
 * Mounts the realtime WebSocket connection at the workspace root.
 * Must be rendered once, client-side only.
 * Keeps connection lifecycle coupled to the workspace component tree.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { startSession } = useRealtimeConnection();

  useEffect(() => {
    // Connection auto-starts in useRealtimeConnection.
    // Session start is triggered once connection state = 'connected'
    // via useConversation — no action needed here.
  }, []);

  return <>{children}</>;
}
