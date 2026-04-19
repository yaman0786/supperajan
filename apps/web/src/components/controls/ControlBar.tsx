'use client';

import { useCallback } from 'react';
import type { AssistantStore } from '@/store/assistant.store';
import { useAssistantStore } from '@/store/assistant.store';
import { MicButton } from './MicButton';
import { ModeSelector } from './ModeSelector';
import type { AssistantMode } from '@supperajan/types';

interface ControlBarProps {
  onPanelToggle: (panel: AssistantStore['activePanel']) => void;
  activePanel: AssistantStore['activePanel'];
}

/**
 * Bottom control bar on the avatar stage.
 * Houses: mic toggle, mode selector, panel shortcuts (memory/knowledge/settings).
 */
export function ControlBar({ onPanelToggle, activePanel }: ControlBarProps) {
  const { assistantMode, setAssistantMode } = useAssistantStore();

  const handleModeChange = useCallback(
    (mode: AssistantMode) => setAssistantMode(mode),
    [setAssistantMode],
  );

  return (
    <div className="glass border-t border-bg-border px-4 py-3">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        {/* Left: mode selector */}
        <ModeSelector value={assistantMode} onChange={handleModeChange} />

        {/* Center: mic button */}
        <MicButton />

        {/* Right: panel shortcuts */}
        <div className="flex items-center gap-1.5">
          <PanelButton
            icon={MemoryIcon}
            label="Memory"
            isActive={activePanel === 'memory'}
            onClick={() => onPanelToggle('memory')}
          />
          <PanelButton
            icon={KnowledgeIcon}
            label="Knowledge"
            isActive={activePanel === 'knowledge'}
            onClick={() => onPanelToggle('knowledge')}
          />
          <PanelButton
            icon={SettingsIcon}
            label="Settings"
            isActive={activePanel === 'settings'}
            onClick={() => onPanelToggle('settings')}
          />
        </div>
      </div>
    </div>
  );
}

interface PanelButtonProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function PanelButton({ icon: Icon, label, isActive, onClick }: PanelButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ${
        isActive
          ? 'bg-accent-500/20 text-accent-300'
          : 'text-neutral-500 hover:bg-bg-elevated hover:text-neutral-300'
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function MemoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 8a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 2.5v1M8 12.5v1M2.5 8h1M12.5 8h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function KnowledgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path d="M4 2h6l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 2v4h3M6 8h4M6 10.5h4M6 5.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path
        d="M6.5 2.5l-.8 1.6-1.7.5-1.2-1.2-1.4 1.4L2.6 6.5l-.5 1.7-1.6.8v2l1.6.8.5 1.7-1.1 1.2 1.4 1.4 1.7-1.1 1.7.5.8 1.6h2l.8-1.6 1.7-.5 1.2 1.1 1.4-1.4-1.1-1.7.5-1.7 1.6-.8v-2l-1.6-.8-.5-1.7 1.1-1.2-1.4-1.4-1.7 1.1-1.7-.5L8.5 2.5h-2Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
