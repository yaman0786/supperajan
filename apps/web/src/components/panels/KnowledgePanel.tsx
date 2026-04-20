'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Document } from '@supperajan/types';
import { apiClient } from '@/lib/api-client';

const ACCEPTED_TYPES = ['.pdf', '.txt', '.md', '.docx', '.csv', '.json'];
const ACCEPTED_MIME = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/json',
].join(',');

const TEXT_MIMES = new Set(['text/plain', 'text/markdown', 'text/x-markdown', 'application/json', 'text/csv', 'text/html']);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_STYLE: Record<Document['status'], { label: string; cls: string }> = {
  uploading:   { label: 'Yükleniyor', cls: 'text-yellow-400 bg-yellow-400/10' },
  processing:  { label: 'Ayrıştırılıyor', cls: 'text-accent-400 bg-accent-400/10' },
  ingesting:   { label: 'İndeksleniyor', cls: 'text-accent-400 bg-accent-400/10' },
  ready:       { label: 'Hazır', cls: 'text-green-400 bg-green-400/10' },
  failed:      { label: 'Hata', cls: 'text-red-400 bg-red-400/10' },
  deleted:     { label: 'Silindi', cls: 'text-neutral-500 bg-neutral-700/20' },
};

const EXT_ICONS: Record<string, string> = {
  pdf: '📄', txt: '📝', md: '📝', docx: '📃', csv: '📊', json: '📋', default: '📄',
};

function FileIcon({ fileName }: { fileName: string }) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'default';
  return <span className="text-base">{EXT_ICONS[ext] ?? EXT_ICONS['default']}</span>;
}

function StatusBadge({ status }: { status: Document['status'] }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.processing;
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

function DocumentRow({
  doc,
  onDelete,
}: {
  doc: Document;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`"${doc.title ?? doc.fileName}" silinsin mi?`)) return;
    setDeleting(true);
    await apiClient.documents.delete(doc.id);
    onDelete(doc.id);
  };

  const isActive = doc.status === 'uploading' || doc.status === 'processing' || doc.status === 'ingesting';

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-bg-border bg-bg-elevated px-3 py-2.5 transition-colors hover:border-neutral-600">
      <FileIcon fileName={doc.fileName} />
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-medium text-neutral-200">
          {doc.title ?? doc.fileName}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[10px] text-neutral-600">{formatBytes(doc.fileSize)}</span>
          <StatusBadge status={doc.status} />
          {doc.status === 'ready' && doc.chunkCount > 0 && (
            <span className="text-[10px] text-neutral-600">{doc.chunkCount} parça</span>
          )}
        </div>
        {isActive && (
          <div className="mt-1.5 h-0.5 w-full rounded-full bg-neutral-700 overflow-hidden">
            <div className="h-full rounded-full bg-accent-500 animate-[shimmer_1.5s_ease-in-out_infinite] w-1/2" />
          </div>
        )}
        {doc.processingError && (
          <p className="mt-1 truncate text-[10px] text-red-400">{doc.processingError}</p>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`${doc.fileName} sil`}
        className="invisible flex-shrink-0 text-neutral-600 transition-colors group-hover:visible hover:text-red-400 disabled:opacity-40"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 3.5h10M5 3.5V2h4v1.5M5.5 6v4M8.5 6v4M3 3.5l.5 8h7l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export function KnowledgePanel() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadDocs = useCallback(async () => {
    try {
      const res = await apiClient.documents.list();
      setDocs(res.data ?? []);
    } catch {
      // API not connected yet — show empty
    }
  }, []);

  useEffect(() => {
    void loadDocs();
    // Poll for status updates while any doc is still processing
    const interval = setInterval(() => {
      const hasActive = docs.some((d) =>
        ['uploading', 'processing', 'ingesting'].includes(d.status),
      );
      if (hasActive) void loadDocs();
    }, 3000);
    return () => clearInterval(interval);
  }, [loadDocs, docs]);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const isText = TEXT_MIMES.has(file.type);
      let content: string;
      let encoding: 'utf8' | 'base64';

      if (isText) {
        content = await file.text();
        encoding = 'utf8';
      } else {
        const buf = await file.arrayBuffer();
        content = Buffer.from(buf).toString('base64');
        encoding = 'base64';
      }

      const res = await apiClient.documents.upload({
        fileName: file.name,
        mimeType: file.type || 'text/plain',
        fileSize: file.size,
        content,
        encoding,
        title: file.name.replace(/\.[^.]+$/, ''),
      });

      setDocs((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      Array.from(fileList).forEach((f) => void uploadFile(f));
    },
    [uploadFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDelete = useCallback((id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const readyCount = docs.filter((d) => d.status === 'ready').length;
  const totalChunks = docs.reduce((sum, d) => sum + (d.chunkCount ?? 0), 0);

  return (
    <div className="flex h-full flex-col">
      {/* Stats */}
      <div className="flex items-center gap-3 border-b border-bg-border px-4 py-2.5">
        <Stat label="Belge" value={String(docs.length)} />
        <div className="h-4 w-px bg-bg-border" />
        <Stat label="Hazır" value={String(readyCount)} />
        <div className="h-4 w-px bg-bg-border" />
        <Stat label="Parça" value={String(totalChunks)} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-200 ${
            isDragging
              ? 'border-accent-500 bg-accent-500/10'
              : uploading
              ? 'border-bg-border opacity-60 cursor-wait'
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

          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
            isDragging ? 'border-accent-500/40 bg-accent-500/15' : 'border-bg-border bg-bg-elevated'
          }`}>
            {uploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-accent-400" />
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                className={isDragging ? 'text-accent-400' : 'text-neutral-500'}>
                <path d="M11 3v10M8 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16v1.5A1.5 1.5 0 0 0 5.5 19h11a1.5 1.5 0 0 0 1.5-1.5V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-200">
              {uploading ? 'Yükleniyor...' : isDragging ? 'Bırakın!' : 'Belge ekle'}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Sürükleyip bırakın veya tıklayın
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-1">
            {ACCEPTED_TYPES.map((t) => (
              <span key={t} className="rounded-md border border-bg-border bg-bg-elevated px-1.5 py-0.5 text-[10px] font-mono text-neutral-500">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Document list */}
        {docs.length > 0 ? (
          <div className="space-y-1.5">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
              Belgeler ({docs.length})
            </p>
            {docs.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      <div className="border-t border-bg-border px-4 py-3">
        <p className="text-[11px] text-neutral-600">
          {readyCount > 0
            ? `${readyCount} belge hazır — sohbette konuyla ilgili sorular sorduğunuzda otomatik kullanılır.`
            : 'Belge ekleyin. Hazır olan belgeler sohbet sırasında otomatik kullanılır.'}
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

function EmptyState() {
  return (
    <div className="space-y-2 pt-1">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
        Neler ekleyebilirsiniz?
      </p>
      {[
        { icon: '📄', title: 'PDF Belgeler', desc: 'Raporlar, kılavuzlar, kitaplar' },
        { icon: '📝', title: 'Metin / Markdown', desc: 'Notlar, wiki, belgeler' },
        { icon: '📊', title: 'CSV Veri', desc: 'Tablolar, veri setleri' },
        { icon: '📋', title: 'JSON', desc: 'Yapılandırılmış veri' },
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
