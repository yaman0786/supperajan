'use client';

import { useCallback } from 'react';
import { useAssistantStore } from '@/store/assistant.store';

/**
 * Microphone toggle button.
 * Visual states: idle, active (listening), and processing.
 * Actual microphone capture wired in Phase 8 (voice subsystem).
 */
export function MicButton() {
  const { isMicActive, isListening, audioLevel, setMicActive, setListening } =
    useAssistantStore();

  const handleToggle = useCallback(() => {
    const next = !isMicActive;
    setMicActive(next);
    setListening(next);
    // TODO (Phase 8): start/stop VoiceActivityDetector + STT stream
  }, [isMicActive, setMicActive, setListening]);

  const ringScale = 1 + audioLevel * 2;

  return (
    <div className="relative flex items-center justify-center">
      {/* Ambient ring when listening */}
      {isListening && (
        <span
          className="absolute rounded-full border border-accent-400/50"
          style={{
            width: `${48 * ringScale}px`,
            height: `${48 * ringScale}px`,
            transition: 'width 0.05s, height 0.05s',
          }}
        />
      )}

      <button
        onClick={handleToggle}
        aria-label={isMicActive ? 'Stop microphone' : 'Start microphone'}
        aria-pressed={isMicActive}
        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
          isMicActive
            ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/40 hover:bg-accent-600'
            : 'glass text-neutral-400 hover:text-neutral-200'
        }`}
      >
        {isMicActive ? <MicActiveIcon /> : <MicInactiveIcon />}
      </button>
    </div>
  );
}

function MicActiveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="7" y="2" width="6" height="10" rx="3" fill="currentColor" />
      <path
        d="M4 10a6 6 0 0 0 12 0M10 16v2M7 18h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MicInactiveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="7" y="2" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 10a6 6 0 0 0 12 0M10 16v2M7 18h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
