'use client';

import { useCallback } from 'react';
import { AvatarStage } from '@/components/avatar/AvatarStage';
import { ConversationPanel } from '@/components/chat/ConversationPanel';
import { ControlBar } from '@/components/controls/ControlBar';
import { AssistantStatusBadge } from '@/components/ui/AssistantStatusBadge';
import { SidePanel } from '@/components/workspace/SidePanel';
import { RealtimeProvider } from '@/components/workspace/RealtimeProvider';
import { useAssistantStore } from '@/store/assistant.store';

/**
 * Root workspace layout.
 *
 * Layout: three-column on desktop, stacked on mobile.
 *   Left:   Conversation panel
 *   Center: Avatar stage (dominant)
 *   Right:  Active side panel (memory / knowledge / settings)
 */
export function AssistantWorkspace() {
  const { activePanel, setActivePanel, avatarState, emotionState, connectionState } =
    useAssistantStore();

  const handlePanelToggle = useCallback(
    (panel: typeof activePanel) => {
      setActivePanel(activePanel === panel ? null : panel);
    },
    [activePanel, setActivePanel],
  );

  return (
    <RealtimeProvider>
    <main className="relative flex h-dvh w-full overflow-hidden bg-bg-base">
      {/* Background ambient gradient */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,175,222,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 80%, rgba(232,97,26,0.04) 0%, transparent 60%)',
        }}
      />

      {/* ── Left: Conversation panel ─────────────────────────────────────── */}
      <aside className="relative z-10 hidden w-[380px] flex-shrink-0 flex-col border-r border-bg-border lg:flex">
        <ConversationPanel />
      </aside>

      {/* ── Center: Avatar stage ─────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-between overflow-hidden">
        {/* Status badge */}
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
          <AssistantStatusBadge
            avatarState={avatarState}
            emotionState={emotionState}
            connectionState={connectionState}
          />
        </div>

        {/* 3D Avatar */}
        <div className="flex h-full w-full flex-1 items-center justify-center">
          <AvatarStage />
        </div>

        {/* Bottom control bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <ControlBar onPanelToggle={handlePanelToggle} activePanel={activePanel} />
        </div>
      </section>

      {/* ── Right: Dynamic side panel ────────────────────────────────────── */}
      {activePanel && (
        <aside className="relative z-10 w-[360px] flex-shrink-0 border-l border-bg-border">
          <SidePanel panel={activePanel} onClose={() => setActivePanel(null)} />
        </aside>
      )}

      {/* ── Mobile: Bottom sheet conversation ───────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 z-30 lg:hidden">
        {/* Mobile layout handled in Phase 3 */}
      </div>
    </main>
    </RealtimeProvider>
  );
}
