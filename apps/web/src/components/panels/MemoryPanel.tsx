'use client';

import { useAssistantStore } from '@/store/assistant.store';

interface MemoryCardProps {
  type: string;
  content: string;
  age: string;
  importance: number;
}

function MemoryCard({ type, content, age, importance }: MemoryCardProps) {
  const typeColors: Record<string, string> = {
    Tercih: 'bg-accent-500/15 text-accent-300 border-accent-500/20',
    Kişisel: 'bg-brand-500/15 text-brand-300 border-brand-500/20',
    Bağlam: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
    Görev: 'bg-green-500/15 text-green-300 border-green-500/20',
  };

  const colorClass = typeColors[type] ?? 'bg-neutral-700/30 text-neutral-400 border-neutral-600/20';

  return (
    <div className="rounded-xl border border-bg-border bg-bg-elevated p-3 space-y-2 transition-colors hover:border-neutral-600">
      <div className="flex items-center justify-between">
        <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${colorClass}`}>
          {type}
        </span>
        <div className="flex items-center gap-2">
          <ImportanceDots value={importance} />
          <span className="text-[10px] text-neutral-600">{age}</span>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-neutral-300">{content}</p>
    </div>
  );
}

function ImportanceDots({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Önem: ${value}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`h-1 w-1 rounded-full ${i < value ? 'bg-accent-400' : 'bg-neutral-700'}`}
        />
      ))}
    </div>
  );
}

const PREVIEW_MEMORIES: MemoryCardProps[] = [
  { type: 'Tercih', content: 'Türkçe yanıtları tercih eder.', age: '1s önce', importance: 4 },
  { type: 'Kişisel', content: 'Robot avatar arayüzü üzerinde çalışıyor.', age: '2dk önce', importance: 5 },
  { type: 'Bağlam', content: 'Full-stack AI platformu geliştiriyor.', age: '5dk önce', importance: 3 },
];

export function MemoryPanel() {
  const { messages } = useAssistantStore();
  const hasMemories = false;

  return (
    <div className="flex h-full flex-col">
      {/* Stats bar */}
      <div className="flex items-center gap-3 border-b border-bg-border px-4 py-2.5">
        <Stat label="Bellek" value="0" />
        <div className="h-4 w-px bg-bg-border" />
        <Stat label="Mesaj" value={String(messages.length)} />
        <div className="h-4 w-px bg-bg-border" />
        <Stat label="Bağlam" value="0 kb" />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {hasMemories ? (
          <div className="space-y-2">
            {PREVIEW_MEMORIES.map((m, i) => (
              <MemoryCard key={i} {...m} />
            ))}
          </div>
        ) : (
          <EmptyMemoryState />
        )}
      </div>

      {/* Footer info */}
      <div className="border-t border-bg-border px-4 py-3">
        <p className="text-[11px] text-neutral-600">
          Bellek, Phase 6'da aktif olacak. Şu an önemli bilgiler oturum boyunca bağlamda tutulmaktadır.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-neutral-200">{value}</p>
      <p className="text-[10px] text-neutral-600">{label}</p>
    </div>
  );
}

function EmptyMemoryState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      {/* Memory icon */}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/10 border border-accent-500/20">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-accent-400">
          <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="14" cy="14" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 5v1.5M14 21.5V23M5 14h1.5M21.5 14H23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="14" cy="14" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-neutral-200">Henüz bellek yok</h4>
        <p className="text-xs text-neutral-500 max-w-[220px] leading-relaxed">
          Sohbet ettikçe Süpperajan önemli bilgileri burada kaydedecek.
        </p>
      </div>

      <div className="w-full space-y-2 rounded-xl border border-bg-border bg-bg-elevated p-3">
        <MemoryTypeRow icon="🎯" label="Tercihler" desc="Beğenileriniz ve alışkanlıklarınız" />
        <MemoryTypeRow icon="👤" label="Kişisel" desc="Paylaştığınız bilgiler" />
        <MemoryTypeRow icon="📋" label="Görevler" desc="Devam eden projeler ve hedefler" />
        <MemoryTypeRow icon="🔗" label="Bağlam" desc="Önemli konuşma bağlamları" />
      </div>
    </div>
  );
}

function MemoryTypeRow({ icon, label, desc }: { icon: string; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-xs font-medium text-neutral-300">{label}</p>
        <p className="text-[10px] text-neutral-600">{desc}</p>
      </div>
    </div>
  );
}
