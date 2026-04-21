import { useEffect, useMemo, useState } from "react";
import Examples from "./components/Examples";
import ResultCard from "./components/ResultCard";
import { analyze, health } from "./api";
import type { AnalyzeResponse } from "./types";

type Status = "idle" | "loading" | "ok" | "error";

export default function App() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    health().then((ok) => {
      if (!cancelled) setApiOnline(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit = useMemo(() => text.trim().length > 0 && status !== "loading", [text, status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    setError(null);
    try {
      const data = await analyze(text.trim());
      setResult(data);
      setStatus("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      setStatus("error");
    }
  }

  function clearAll() {
    setText("");
    setResult(null);
    setStatus("idle");
    setError(null);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-8 sm:py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <LogoMark />
            <span className="text-lg font-semibold tracking-tight text-white">NETKARAR</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">Duyguyla değil, net kararla.</p>
        </div>
        <ApiStatus online={apiOnline} />
      </header>

      <form onSubmit={onSubmit} className="glass rounded-2xl p-4 shadow-glow">
        <label htmlFor="text" className="mb-2 block text-xs uppercase tracking-wider text-slate-400">
          Analiz edilecek metin
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Bir karar öncesi eline gelen mesajı, teklifi ya da durumu buraya yapıştır..."
          rows={6}
          maxLength={5000}
          className="w-full resize-y rounded-xl border border-white/10 bg-ink-900/80 p-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">{text.length}/5000</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearAll}
              disabled={!text && !result}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Temizle
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? "Analiz ediliyor..." : "Analiz Et"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-4">
        <Examples onPick={(t) => setText(t)} disabled={status === "loading"} />
      </div>

      <section className="mt-8">
        {status === "idle" && !result && <EmptyState />}
        {status === "loading" && <LoadingState />}
        {status === "error" && <ErrorState message={error ?? "Bilinmeyen hata"} />}
        {status === "ok" && result && <ResultCard result={result} />}
      </section>

      <footer className="mt-auto pt-10 text-center text-xs text-slate-600">
        MVP · Rule-based risk analyzer · © {new Date().getFullYear()} NETKARAR
      </footer>
    </div>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" stroke="white" strokeOpacity="0.5" />
      <path
        d="M7 16V8l10 8V8"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ApiStatus({ online }: { online: boolean | null }) {
  const color =
    online === null ? "bg-slate-500" : online ? "bg-emerald-400" : "bg-rose-500";
  const label = online === null ? "bağlanılıyor" : online ? "API çevrimiçi" : "API çevrimdışı";
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-2xl p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
        <span className="text-lg">·</span>
      </div>
      <h3 className="text-sm font-semibold text-slate-200">Analiz sonucu burada görünecek</h3>
      <p className="mt-1 text-sm text-slate-400">
        Yukarıya bir metin yapıştır ya da örneklerden birini seç.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-3 h-3 w-24 animate-pulse rounded bg-white/10" />
      <div className="h-2 w-full animate-pulse rounded bg-white/10" />
      <div className="mt-2 h-2 w-3/4 animate-pulse rounded bg-white/10" />
      <div className="mt-6 grid gap-2">
        <div className="h-2 w-full animate-pulse rounded bg-white/10" />
        <div className="h-2 w-5/6 animate-pulse rounded bg-white/10" />
        <div className="h-2 w-2/3 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-200">
      <div className="font-semibold">Bir hata oluştu</div>
      <div className="mt-1 text-rose-200/80">{message}</div>
      <div className="mt-3 text-xs text-rose-200/60">
        Backend'in çalıştığından emin ol: <code>http://127.0.0.1:8000/health</code>
      </div>
    </div>
  );
}
