'use client';

import { useCallback, useRef, useState } from 'react';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
}

const ACCEPTED_TYPES = ['.pdf', '.txt', '.md', '.docx', '.csv', '.json'];
const ACCEPTED_MIME = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/json',
].join(',');

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    pdf: '📄',
    txt: '📝',
    md: '📝',
    docx: '📃',
    csv: '📊',
    json: '📋',
  };
  const ext = type.toLowerCase();
  return <span className="text-base">{icons[ext] ?? '📄'}</span>;
}

function FileStatusBadge({ status }: { status: UploadedFile['status'] }) {
  const styles: Record<UploadedFile['status'], string> = {
    uploading: 'text-yellow-400 bg-yellow-400/10',
    processing: 'text-accent-400 bg-accent-400/10',
    ready: 'text-green-400 bg-green-400/10',
    error: 'text-red-400 bg-red-400/10',
  };
  const labels: Record<UploadedFile['status'], string> = {
    uploading: 'Yükleniyor',
    processing: 'İşleniyor',
    ready: 'Hazır',
    error: 'Hata',
  };

  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function FileRow({ file, onRemove }: { file: UploadedFile; onRemove: (id: string) => void }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-bg-border bg-bg-elevated px-3 py-2.5 transition-colors hover:border-neutral-600">
      <FileIcon type={file.type} />
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-medium text-neutral-200">{file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-neutral-600">{file.size}</span>
          <FileStatusBadge status={file.status} />
        </div>
        {(file.status === 'uploading' || file.status === 'processing') && (
          <div className="mt-1.5 h-0.5 w-full rounded-full bg-neutral-700">
            <div
              className="h-0.5 rounded-full bg-accent-500 transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(file.id)}
        aria-label={`${file.name} sil`}
        className="invisible text-neutral-600 transition-colors group-hover:visible hover:text-neutral-300"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function KnowledgePanel() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? 'txt';
      return {
        id: crypto.randomUUID(),
        name: f.name,
        size: formatBytes(f.size),
        type: ext,
        status: 'uploading',
        progress: 0,
      };
    });

    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload + processing (Phase 7 wires the real upload)
    newFiles.forEach((file) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20 + 10;
        if (progress >= 100) {
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: 'processing', progress: 100 } : f,
            ),
          );
          setTimeout(() => {
            setFiles((prev) =>
              prev.map((f) => (f.id === file.id ? { ...f, status: 'ready' } : f)),
            );
          }, 1500);
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress: Math.min(progress, 95) } : f)),
          );
        }
      }, 200);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const readyCount = files.filter((f) => f.status === 'ready').length;

  return (
    <div className="flex h-full flex-col">
      {/* Stats */}
      <div className="flex items-center gap-3 border-b border-bg-border px-4 py-2.5">
        <Stat label="Belge" value={String(files.length)} />
        <div className="h-4 w-px bg-bg-border" />
        <Stat label="Hazır" value={String(readyCount)} />
        <div className="h-4 w-px bg-bg-border" />
        <Stat label="Parça" value="0" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
            isDragging
              ? 'border-accent-500 bg-accent-500/10'
              : 'border-bg-border hover:border-neutral-600 hover:bg-bg-elevated/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_MIME}
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors ${
            isDragging ? 'border-accent-500/40 bg-accent-500/15' : 'border-bg-border bg-bg-elevated'
          }`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              className={isDragging ? 'text-accent-400' : 'text-neutral-500'}>
              <path d="M12 3v12M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-200">
              {isDragging ? 'Bırakın!' : 'Belge ekle'}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Sürükleyip bırakın veya tıklayın
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-1">
            {ACCEPTED_TYPES.map((t) => (
              <span key={t} className="rounded-md bg-bg-elevated px-1.5 py-0.5 text-[10px] font-mono text-neutral-500 border border-bg-border">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* File list */}
        {files.length > 0 ? (
          <div className="space-y-1.5">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
              Belgeler ({files.length})
            </p>
            {files.map((file) => (
              <FileRow key={file.id} file={file} onRemove={handleRemove} />
            ))}
          </div>
        ) : (
          <EmptyKnowledgeState />
        )}
      </div>

      <div className="border-t border-bg-border px-4 py-3">
        <p className="text-[11px] text-neutral-600">
          Vektör indeksleme Phase 7'de aktif olacak. Belgeler şimdi UI'da görünür ama RAG araması henüz çalışmaz.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-neutral-200">{value}</p>
      <p className="text-[10px] text-neutral-600">{label}</p>
    </div>
  );
}

function EmptyKnowledgeState() {
  return (
    <div className="space-y-3 pt-2">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
        Neler ekleyebilirsiniz?
      </p>
      {[
        { icon: '📄', title: 'PDF Belgeler', desc: 'Raporlar, kılavuzlar, kitaplar' },
        { icon: '📝', title: 'Metin / Markdown', desc: 'Notlar, wiki sayfaları, belgeler' },
        { icon: '📊', title: 'Veri Dosyaları', desc: 'CSV tabloları, JSON veri setleri' },
        { icon: '📃', title: 'Word Dosyaları', desc: 'DOCX formatında belgeler' },
      ].map((item) => (
        <div key={item.title} className="flex items-center gap-3 rounded-xl border border-bg-border bg-bg-elevated/40 px-3 py-2.5">
          <span className="text-lg">{item.icon}</span>
          <div>
            <p className="text-xs font-medium text-neutral-300">{item.title}</p>
            <p className="text-[10px] text-neutral-600">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
