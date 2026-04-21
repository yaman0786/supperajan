import type { AnalyzeResponse, DecisionColor } from "../types";

interface Props {
  result: AnalyzeResponse;
}

const COLOR_STYLES: Record<DecisionColor, { chip: string; bar: string; ring: string; dot: string }> = {
  green: {
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    bar: "bg-emerald-400",
    ring: "ring-emerald-400/30",
    dot: "bg-emerald-400",
  },
  yellow: {
    chip: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    bar: "bg-amber-400",
    ring: "ring-amber-400/30",
    dot: "bg-amber-400",
  },
  red: {
    chip: "bg-rose-500/15 text-rose-300 border-rose-400/30",
    bar: "bg-rose-500",
    ring: "ring-rose-400/30",
    dot: "bg-rose-500",
  },
};

export default function ResultCard({ result }: Props) {
  const styles = COLOR_STYLES[result.decision_color];

  return (
    <div className={`glass rounded-2xl p-5 shadow-glow ring-1 ${styles.ring}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${styles.dot}`} />
          <div>
            <div className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${styles.chip}`}>
              {result.decision}
            </div>
            <div className="mt-1 text-sm text-slate-400">{result.category}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold tabular-nums text-white">{result.risk}</div>
          <div className="text-xs uppercase tracking-wider text-slate-500">Risk / 100</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full ${styles.bar} transition-all`}
            style={{ width: `${Math.max(3, result.risk)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-slate-500">
          <span>Güven: {result.confidence}%</span>
          <span>
            {result.risk < 30 ? "Düşük risk" : result.risk < 65 ? "Orta risk" : "Yüksek risk"}
          </span>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-slate-300">{result.summary}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Section title="Nedenler">
          <ul className="space-y-2 text-sm text-slate-300">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-slate-400" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Öneriler">
          <ul className="space-y-2 text-sm text-slate-300">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-slate-400" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">{title}</div>
      {children}
    </div>
  );
}
