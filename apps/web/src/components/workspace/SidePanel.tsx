'use client';

interface SidePanelProps {
  panel: 'memory' | 'knowledge' | 'settings';
  onClose: () => void;
}

const PANEL_TITLES: Record<SidePanelProps['panel'], string> = {
  memory: 'Memory',
  knowledge: 'Knowledge',
  settings: 'Settings',
};

/**
 * Side panel shell. Content modules wired in Phase 6 (memory),
 * Phase 7 (knowledge), and Phase 3 (settings).
 */
export function SidePanel({ panel, onClose }: SidePanelProps) {
  return (
    <div className="flex h-full flex-col bg-bg-surface">
      <header className="flex items-center justify-between border-b border-bg-border px-4 py-3">
        <span className="text-sm font-semibold text-neutral-100">{PANEL_TITLES[panel]}</span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-bg-elevated hover:text-neutral-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4l8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-center text-sm text-neutral-500">
          {PANEL_TITLES[panel]} panel — implemented in Phase{' '}
          {panel === 'memory' ? '6' : panel === 'knowledge' ? '7' : '3'}.
        </p>
      </div>
    </div>
  );
}
