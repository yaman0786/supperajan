'use client';

import { useCallback, useState } from 'react';
import type { AssistantMode } from '@supperajan/types';
import { useAssistantStore } from '@/store/assistant.store';

const MODES: { value: AssistantMode; label: string; description: string; icon: string }[] = [
  { value: 'friendly', label: 'Dostane', description: 'Sıcak ve ilgili', icon: '😊' },
  { value: 'professional', label: 'Profesyonel', description: 'Resmi ve odaklı', icon: '💼' },
  { value: 'playful', label: 'Eğlenceli', description: 'Neşeli ve yaratıcı', icon: '✨' },
  { value: 'concise', label: 'Özlü', description: 'Kısa ve net', icon: '⚡' },
  { value: 'deep_research', label: 'Araştırmacı', description: 'Derin analiz', icon: '🔬' },
  { value: 'companion', label: 'Arkadaş', description: 'Samimi ve anlayışlı', icon: '🤝' },
  { value: 'productivity', label: 'Verimli', description: 'Görev odaklı', icon: '📋' },
  { value: 'emotional_support', label: 'Destekleyici', description: 'Empatik ve sakin', icon: '💛' },
];

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-2">
      <h3 className="px-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-bg-elevated/60">
      <div>
        <p className="text-sm text-neutral-200">{label}</p>
        {description && <p className="text-xs text-neutral-500">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
          value ? 'bg-accent-500' : 'bg-neutral-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPanel() {
  const { assistantMode, setAssistantMode } = useAssistantStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoListen, setAutoListen] = useState(false);
  const [streamingText, setStreamingText] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);

  const handleModeChange = useCallback(
    (mode: AssistantMode) => setAssistantMode(mode),
    [setAssistantMode],
  );

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-5 p-4">

        {/* Kişilik Modu */}
        <Section title="Kişilik Modu">
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => handleModeChange(mode.value)}
                className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all duration-150 ${
                  assistantMode === mode.value
                    ? 'border-accent-500/50 bg-accent-500/10 text-accent-200'
                    : 'border-bg-border bg-bg-elevated text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
                }`}
              >
                <span className="mb-1 text-base">{mode.icon}</span>
                <span className="text-xs font-semibold">{mode.label}</span>
                <span className="mt-0.5 text-[10px] opacity-70">{mode.description}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Ses */}
        <Section title="Ses">
          <Toggle
            label="Ses efektleri"
            description="UI etkileşim sesleri"
            value={soundEnabled}
            onChange={setSoundEnabled}
          />
          <Toggle
            label="Otomatik dinleme"
            description="Yanıt sonrası mikrofonu aç"
            value={autoListen}
            onChange={setAutoListen}
          />
        </Section>

        {/* Sohbet */}
        <Section title="Sohbet">
          <Toggle
            label="Akışlı metin"
            description="Yanıtı kelime kelime göster"
            value={streamingText}
            onChange={setStreamingText}
          />
          <Toggle
            label="Zaman damgaları"
            description="Her mesajda saat göster"
            value={showTimestamps}
            onChange={setShowTimestamps}
          />
        </Section>

        {/* Bağlantı */}
        <Section title="Bağlantı Durumu">
          <ConnectionStatusRow />
        </Section>

        {/* Hakkında */}
        <Section title="Hakkında">
          <div className="rounded-xl border border-bg-border bg-bg-elevated p-3 space-y-1.5">
            <InfoRow label="Versiyon" value="0.3.0-alpha" />
            <InfoRow label="Model" value="gpt-4o" />
            <InfoRow label="Protokol" value="WebSocket v1" />
          </div>
        </Section>

      </div>
    </div>
  );
}

function ConnectionStatusRow() {
  const { connectionState } = useAssistantStore();

  const STATUS: Record<string, { label: string; color: string; dot: string }> = {
    connected: { label: 'Bağlı', color: 'text-green-400', dot: 'bg-green-400' },
    authenticated: { label: 'Kimlik Doğrulandı', color: 'text-accent-400', dot: 'bg-accent-400' },
    connecting: { label: 'Bağlanıyor...', color: 'text-yellow-400', dot: 'bg-yellow-400 animate-pulse' },
    reconnecting: { label: 'Yeniden Bağlanıyor...', color: 'text-yellow-400', dot: 'bg-yellow-400 animate-pulse' },
    disconnected: { label: 'Bağlantı Yok', color: 'text-neutral-500', dot: 'bg-neutral-600' },
    error: { label: 'Bağlantı Hatası', color: 'text-red-400', dot: 'bg-red-400' },
  };

  const s = STATUS[connectionState] ?? STATUS['disconnected']!;

  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-bg-elevated/60">
      <span className="text-sm text-neutral-400">Sunucu</span>
      <span className={`flex items-center gap-1.5 text-xs font-medium ${s.color}`}>
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-xs font-mono text-neutral-300">{value}</span>
    </div>
  );
}
