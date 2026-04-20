'use client';

import { useCallback, useState } from 'react';
import { AvatarStage } from '@/components/avatar/AvatarStage';
import { ConversationPanel } from '@/components/chat/ConversationPanel';
import { ControlBar } from '@/components/controls/ControlBar';
import { AssistantStatusBadge } from '@/components/ui/AssistantStatusBadge';
import { ConnectionBanner } from '@/components/ui/ConnectionBanner';
import { SidePanel } from '@/components/workspace/SidePanel';
import { RealtimeProvider } from '@/components/workspace/RealtimeProvider';
import { useAssistantStore } from '@/store/assistant.store';

export function AssistantWorkspace() {
  const { activePanel, setActivePanel, avatarState, emotionState, connectionState } =
    useAssistantStore();
  const [mobileTab, setMobileTab] = useState<'avatar' | 'chat'>('avatar');

  const handlePanelToggle = useCallback(
    (panel: typeof activePanel) => {
      setActivePanel(activePanel === panel ? null : panel);
    },
    [activePanel, setActivePanel],
  );

  return (
    <RealtimeProvider>
      {/* Reconnecting / error banner */}
      <ConnectionBanner />

      <main className="relative flex h-dvh w-full overflow-hidden bg-bg-base">
        {/* Background ambient gradient */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,175,222,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 80%, rgba(232,97,26,0.04) 0%, transparent 60%)',
          }}
        />

        {/* ── Desktop: Left conversation panel ───────────────────────────── */}
        <aside className="relative z-10 hidden w-[380px] flex-shrink-0 flex-col border-r border-bg-border lg:flex">
          <ConversationPanel />
        </aside>

        {/* ── Center: Avatar stage ─────────────────────────────────────────── */}
        <section
          className={`relative z-10 flex-1 flex-col items-center justify-between overflow-hidden ${
            mobileTab === 'avatar' ? 'flex' : 'hidden lg:flex'
          }`}
        >
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

          {/* Control bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <ControlBar onPanelToggle={handlePanelToggle} activePanel={activePanel} />
          </div>
        </section>

        {/* ── Desktop: Right side panel ────────────────────────────────────── */}
        {activePanel && (
          <aside className="relative z-10 hidden w-[360px] flex-shrink-0 border-l border-bg-border lg:block">
            <SidePanel panel={activePanel} onClose={() => setActivePanel(null)} />
          </aside>
        )}

        {/* ── Mobile: Chat tab ─────────────────────────────────────────────── */}
        <section
          className={`relative z-10 flex-1 flex-col overflow-hidden lg:hidden ${
            mobileTab === 'chat' ? 'flex' : 'hidden'
          }`}
        >
          <ConversationPanel />
        </section>

        {/* ── Mobile: Bottom tab bar ───────────────────────────────────────── */}
        <nav className="absolute inset-x-0 bottom-0 z-40 flex border-t border-bg-border bg-bg-surface/95 backdrop-blur-sm lg:hidden">
          <MobileTab
            label="Avatar"
            isActive={mobileTab === 'avatar'}
            onClick={() => setMobileTab('avatar')}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.4" />
                <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            }
          />
          <MobileTab
            label="Sohbet"
            isActive={mobileTab === 'chat'}
            onClick={() => setMobileTab('chat')}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 4h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7l-4 3V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            }
          />
        </nav>
      </main>
    </RealtimeProvider>
  );
}

interface MobileTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

function MobileTab({ label, isActive, onClick, icon }: MobileTabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${
        isActive ? 'text-accent-400' : 'text-neutral-600 hover:text-neutral-400'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
