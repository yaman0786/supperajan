'use client';

import { SettingsPanel } from '@/components/panels/SettingsPanel';
import { MemoryPanel } from '@/components/panels/MemoryPanel';
import { KnowledgePanel } from '@/components/panels/KnowledgePanel';

interface SidePanelProps {
  panel: 'memory' | 'knowledge' | 'settings';
  onClose: () => void;
}

const PANEL_META: Record<SidePanelProps['panel'], { title: string; icon: React.ReactNode }> = {
  memory: {
    title: 'Bellek',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M7.5 2v1M7.5 12v1M2 7.5h1M12 7.5h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  knowledge: {
    title: 'Bilgi Tabanı',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M3 1.5h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M10 1.5v4h3M5 7.5h5M5 9.5h5M5 5.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  settings: {
    title: 'Ayarlar',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M6.1 1.5l-.6 1.4-1.5.5-1.1-1-1.3 1.3 1 1.1-.5 1.5L.6 7v1.5l1.5.7.5 1.5-1 1.1 1.3 1.3 1.5-1 1.5.5.6 1.4H8l.6-1.4 1.5-.5 1.1 1 1.3-1.3-1-1.5.5-1.5L13.5 8V6.5L12 5.8l-.5-1.5 1-1.1-1.3-1.3-1.5 1-1.5-.5L7.9 1.5H6.1Z" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="7" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
};

export function SidePanel({ panel, onClose }: SidePanelProps) {
  const meta = PANEL_META[panel];

  return (
    <div className="flex h-full flex-col bg-bg-surface">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-bg-border px-4 py-3">
        <div className="flex items-center gap-2 text-neutral-300">
          {meta.icon}
          <span className="text-sm font-semibold text-neutral-100">{meta.title}</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Paneli kapat"
          className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-bg-elevated hover:text-neutral-200"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Body — routed to sub-panel */}
      <div className="flex-1 overflow-hidden">
        {panel === 'settings' && <SettingsPanel />}
        {panel === 'memory' && <MemoryPanel />}
        {panel === 'knowledge' && <KnowledgePanel />}
      </div>
    </div>
  );
}
