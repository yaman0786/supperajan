# NETKARAR — Architecture (MVP)

## Shape

```
┌────────────────────┐         POST /analyze          ┌──────────────────────┐
│  React + Vite UI   │ ─────────────────────────────▶ │   FastAPI backend    │
│  (Tailwind, dark)  │ ◀───────── JSON result ─────── │   (uvicorn, CORS)    │
└────────────────────┘                                │                      │
                                                      │  analyzer.analyze()  │
                                                      │    └─ rules.SIGNALS  │
                                                      │                      │
                                                      │  db.record_analysis  │
                                                      │    └─ SQLite file    │
                                                      └──────────────────────┘
```

## Backend flow

1. `POST /analyze` accepts `{ "text": string }`.
2. `analyzer.analyze()`:
   - Normalizes text (lowercase, collapse whitespace).
   - Scans across six categories in `rules.SIGNALS`.
   - Scores each category (capped per category), then combines into an
     overall 0–100 risk score.
   - Derives decision via thresholds: `<30 → YAP`, `30–64 → DİKKATLİ OL`, `>=65 → YAPMA`.
   - Builds category-aware suggestions from `SUGGESTION_BANK`.
3. Response shape matches `AnalyzeResponse`.
4. `db.record_analysis()` persists a row in `data/netkarar.db` (best-effort).

## Frontend flow

- `App.tsx` renders a single-page layout: header, textarea, example chips,
  action row, result card.
- `api.ts` wraps `fetch` against `VITE_API_BASE` (default `http://127.0.0.1:8000`).
- `ResultCard.tsx` styles the decision using green/yellow/red variants.

## Why these choices

- **FastAPI + SQLite**: smallest correct backend, no ORM, zero infra.
- **React + Vite + Tailwind**: fastest modern DX, instant reload, tiny config.
- **Rule-based analyzer**: deterministic, fast, easy to test, and
  explainable — the API surface is stable so it can be swapped for an
  LLM/ML classifier later without touching the frontend.
- **Bash bootstrap**: macOS-first, no extra tooling to install.
