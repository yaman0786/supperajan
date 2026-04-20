'use client';

import type { AssistantMode } from '@supperajan/types';

interface ModeSelectorProps {
  value: AssistantMode;
  onChange: (mode: AssistantMode) => void;
}

const MODES: { value: AssistantMode; label: string }[] = [
  { value: 'friendly', label: '😊 Dostane' },
  { value: 'professional', label: '💼 Profesyonel' },
  { value: 'playful', label: '✨ Eğlenceli' },
  { value: 'concise', label: '⚡ Özlü' },
  { value: 'deep_research', label: '🔬 Araştırmacı' },
  { value: 'companion', label: '🤝 Arkadaş' },
  { value: 'productivity', label: '📋 Verimli' },
  { value: 'emotional_support', label: '💛 Destekleyici' },
];

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AssistantMode)}
        aria-label="Asistan modu"
        className="appearance-none cursor-pointer rounded-lg border border-bg-border bg-bg-elevated py-1.5 pl-2.5 pr-6 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-600 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500/30"
      >
        {MODES.map((mode) => (
          <option key={mode.value} value={mode.value}>
            {mode.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-500">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
