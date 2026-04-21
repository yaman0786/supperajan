# NETKARAR

**Duyguyla değil, net kararla.**

NETKARAR is a mobile-first web app that analyzes free-form Turkish text and
returns a clear decision — **YAP**, **YAPMA**, or **DİKKATLİ OL** — with a
risk score, category, short summary, reasons and suggestions. The MVP uses a
deterministic rule-based analyzer across six risk dimensions:

- Dolandırıcılık / Sahtekârlık (scam)
- Aciliyet / Baskı (urgency)
- Ürün / Satıcı Riski (product / seller)
- Finansal Risk (financial)
- Hukuki Uyuşmazlık (legal)
- Manipülasyon (manipulation)

---

## Project structure

```
netkarar/
├── backend/               FastAPI service
│   ├── app/
│   │   ├── main.py        App + CORS + routes
│   │   ├── analyzer.py    Rule-based scoring
│   │   ├── rules.py       Turkish keyword patterns
│   │   ├── schemas.py     Pydantic request/response
│   │   └── db.py          SQLite history store
│   ├── tests/             pytest suite
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/              React + Vite + Tailwind
│   ├── src/
│   │   ├── App.tsx        Single-page UI
│   │   ├── api.ts         fetch client
│   │   └── components/
│   ├── index.html
│   └── package.json
├── scripts/
│   ├── bootstrap.sh       One-command setup + run
│   └── stop.sh            Stop background services
├── data/                  SQLite file lives here
├── docs/ARCHITECTURE.md
├── .env.example
├── Makefile
└── README.md
```

---

## Prerequisites

- **macOS** or **Linux** terminal
- **Python 3.10+** (`python3 --version`)
- **Node.js 18+** and **npm** (`node -v`, `npm -v`)
- `curl` (used by the bootstrap health-check)

On macOS: `brew install python node`.

---

## One-command setup

From the `netkarar/` directory:

```bash
./scripts/bootstrap.sh
```

Or, equivalently:

```bash
make start
```

This single command:

1. Verifies Python and Node versions.
2. Creates `backend/.venv` if missing and installs backend deps.
3. Installs frontend deps via `npm install`.
4. Copies `.env` from `.env.example` if missing.
5. Initializes the SQLite database at `data/netkarar.db`.
6. Starts the backend (uvicorn) and frontend (vite) in the background.
7. Waits for `/health` to return 200, then prints the local URLs.

Re-running the command is safe (idempotent). Previously-started services are
stopped automatically before new ones start.

**Local URLs once it's up:**

- Frontend : <http://127.0.0.1:5173>
- Backend  : <http://127.0.0.1:8000>
- API docs : <http://127.0.0.1:8000/docs>

### Setup-only / start-only

```bash
./scripts/bootstrap.sh --setup-only   # install + init, don't start
./scripts/bootstrap.sh --start-only   # skip install, just start services
```

---

## Stopping services

```bash
./scripts/stop.sh
# or
make stop
```

Logs land in `logs/backend.log` and `logs/frontend.log`. Process IDs are tracked in `.pids/`.

---

## Running components separately

```bash
make backend    # uvicorn with --reload on port 8000
make frontend   # vite dev server on port 5173
```

---

## Testing

### Backend

```bash
make test
```

Expected: all tests pass (`5+ passed`).

### Health check

```bash
curl -s http://127.0.0.1:8000/health
# -> {"status":"ok","version":"0.1.0"}
```

### Sample analyze call

```bash
curl -s -X POST http://127.0.0.1:8000/analyze \
  -H 'Content-Type: application/json' \
  -d '{"text": "Hemen IBAN'\''a para gönder, OTP kodunu yolla, son gün."}' | python3 -m json.tool
```

Expected (shape):

```json
{
  "decision": "YAPMA",
  "decision_color": "red",
  "risk": 95,
  "confidence": 80,
  "category": "Dolandırıcılık / Sahtekârlık",
  "summary": "…",
  "reasons": ["…"],
  "suggestions": ["…"]
}
```

### Frontend manual verification

1. Open <http://127.0.0.1:5173>.
2. Header shows "API çevrimiçi" with a green dot.
3. Click an example chip → "Analiz Et" → result card renders with a colored decision chip, risk bar, reasons and suggestions.
4. Clear with the "Temizle" button, submit a safe sentence → "YAP" (green).

---

## Troubleshooting

**`python3: command not found`**
Install Python 3.10+ (`brew install python`). The script tries `python3.12 → python3.11 → python3.10 → python3`.

**`node: command not found` or version < 18**
Install Node 18+ (`brew install node` or use `nvm install 20`).

**Port already in use (8000 or 5173)**
Run `./scripts/stop.sh` to clean up prior runs. If another app holds the port, change `NETKARAR_PORT` in `.env` (backend) or edit `vite.config.ts` (frontend).

**CORS errors in the browser console**
Ensure `NETKARAR_CORS_ORIGINS` in `.env` includes your frontend origin (default: `http://127.0.0.1:5173`).

**Backend didn't become healthy in 20s**
Check `logs/backend.log`. Most often caused by a stale venv; fix with `make reset && make start`.

**Virtualenv gets stuck after a Python upgrade**
`make clean && make start` rebuilds everything.

---

## Next improvement

After MVP, the highest-leverage next step is to replace the static keyword
rules with a pluggable **classifier layer** — e.g. a small transformer or an
LLM call behind the same `/analyze` interface — while keeping the existing
rules as a fast, deterministic fallback. Add request logging + a tiny
history view to the frontend to make retrieval and trust-building easy.
