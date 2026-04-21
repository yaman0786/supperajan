#!/usr/bin/env bash
# NETKARAR — one-command local bootstrap.
#   ./scripts/bootstrap.sh              # full setup + run backend & frontend
#   ./scripts/bootstrap.sh --setup-only # install deps, init db, then exit
#   ./scripts/bootstrap.sh --start-only # assume setup done, just start services

set -Eeuo pipefail

# Resolve project root regardless of where the script is invoked from.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
ROOT_DIR="$(cd -- "${SCRIPT_DIR}/.." &> /dev/null && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"
DATA_DIR="${ROOT_DIR}/data"
LOG_DIR="${ROOT_DIR}/logs"
PID_DIR="${ROOT_DIR}/.pids"
VENV_DIR="${BACKEND_DIR}/.venv"

MODE="full"
if [[ "${1:-}" == "--setup-only" ]]; then MODE="setup"; fi
if [[ "${1:-}" == "--start-only" ]]; then MODE="start"; fi

BOLD="\033[1m"; DIM="\033[2m"; OK="\033[32m"; WARN="\033[33m"; ERR="\033[31m"; OFF="\033[0m"
say()  { printf "%b▸%b %s\n" "${BOLD}" "${OFF}" "$*"; }
ok()   { printf "%b✓%b %s\n" "${OK}" "${OFF}" "$*"; }
warn() { printf "%b!%b %s\n" "${WARN}" "${OFF}" "$*"; }
die()  { printf "%b✗ %s%b\n" "${ERR}" "$*" "${OFF}" >&2; exit 1; }

trap 'die "Setup failed at line ${LINENO}. See messages above."' ERR

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required tool: $1 — $2"
}

pick_python() {
  for candidate in python3.12 python3.11 python3.10 python3; do
    if command -v "$candidate" >/dev/null 2>&1; then
      local ver
      ver="$($candidate -c 'import sys;print("%d.%d"%sys.version_info[:2])')"
      local major minor
      major="${ver%.*}"; minor="${ver#*.}"
      if [[ "$major" -eq 3 && "$minor" -ge 10 ]]; then
        echo "$candidate"
        return 0
      fi
    fi
  done
  return 1
}

check_prereqs() {
  say "Checking prerequisites"
  PY="$(pick_python || true)"
  [[ -n "${PY}" ]] || die "Python 3.10+ not found. Install it (e.g. 'brew install python')."
  ok "Python: $(${PY} --version)"

  require_cmd node "Install Node.js 18+ (e.g. 'brew install node' or nvm)."
  node_major="$(node -p 'process.versions.node.split(".")[0]')"
  [[ "${node_major}" -ge 18 ]] || die "Node 18+ required (have $(node -v))."
  ok "Node: $(node -v)"

  if command -v npm >/dev/null 2>&1; then
    ok "npm: $(npm -v)"
  else
    die "npm is required (bundled with Node.js)."
  fi
}

prepare_env_file() {
  if [[ ! -f "${ROOT_DIR}/.env" ]]; then
    say "Creating .env from .env.example"
    cp "${ROOT_DIR}/.env.example" "${ROOT_DIR}/.env"
    ok ".env created"
  else
    ok ".env already present"
  fi
}

setup_backend() {
  say "Setting up backend (Python virtualenv)"
  mkdir -p "${DATA_DIR}"
  if [[ ! -d "${VENV_DIR}" ]]; then
    "${PY}" -m venv "${VENV_DIR}"
    ok "Created venv at ${VENV_DIR#${ROOT_DIR}/}"
  else
    ok "Virtualenv already exists"
  fi
  # shellcheck disable=SC1091
  source "${VENV_DIR}/bin/activate"
  python -m pip install --upgrade pip >/dev/null
  pip install -r "${BACKEND_DIR}/requirements.txt"
  ok "Backend dependencies installed"

  say "Initializing SQLite database"
  (cd "${BACKEND_DIR}" && python -c "from app.db import init_db, db_path; init_db(); print('db:', db_path())")
  ok "Database ready"
}

setup_frontend() {
  say "Setting up frontend (npm install)"
  (cd "${FRONTEND_DIR}" && npm install --no-fund --no-audit --loglevel=error)
  ok "Frontend dependencies installed"
}

write_pid() {
  mkdir -p "${PID_DIR}"
  echo "$2" > "${PID_DIR}/$1.pid"
}

stop_previous() {
  if [[ -d "${PID_DIR}" ]]; then
    for pidfile in "${PID_DIR}"/*.pid; do
      [[ -e "$pidfile" ]] || continue
      local pid
      pid="$(cat "$pidfile" 2>/dev/null || true)"
      if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
        warn "Stopping previous process PID ${pid}"
        kill "${pid}" 2>/dev/null || true
      fi
      rm -f "$pidfile"
    done
  fi
}

start_services() {
  mkdir -p "${LOG_DIR}" "${PID_DIR}"
  stop_previous

  # shellcheck disable=SC1091
  set -a; [[ -f "${ROOT_DIR}/.env" ]] && source "${ROOT_DIR}/.env"; set +a
  HOST="${NETKARAR_HOST:-127.0.0.1}"
  PORT="${NETKARAR_PORT:-8000}"

  say "Starting backend  → http://${HOST}:${PORT}"
  (
    cd "${BACKEND_DIR}"
    # shellcheck disable=SC1091
    source "${VENV_DIR}/bin/activate"
    nohup python -m uvicorn app.main:app --host "${HOST}" --port "${PORT}" \
      > "${LOG_DIR}/backend.log" 2>&1 &
    echo $! > "${PID_DIR}/backend.pid"
  )

  say "Starting frontend → http://127.0.0.1:5173"
  (
    cd "${FRONTEND_DIR}"
    nohup npm run dev \
      > "${LOG_DIR}/frontend.log" 2>&1 &
    echo $! > "${PID_DIR}/frontend.pid"
  )

  # Wait until /health responds or time out.
  say "Waiting for backend health..."
  local attempts=0
  until curl -fsS "http://${HOST}:${PORT}/health" >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [[ $attempts -gt 40 ]]; then
      warn "Backend did not become healthy within 20s — check ${LOG_DIR}/backend.log"
      break
    fi
    sleep 0.5
  done
  if curl -fsS "http://${HOST}:${PORT}/health" >/dev/null 2>&1; then
    ok "Backend is healthy"
  fi

  printf "\n%b NETKARAR is up %b\n" "${OK}${BOLD}" "${OFF}"
  echo "   Frontend : http://127.0.0.1:5173"
  echo "   Backend  : http://${HOST}:${PORT}"
  echo "   Docs     : http://${HOST}:${PORT}/docs"
  echo
  printf "${DIM}  Logs: %s${OFF}\n" "${LOG_DIR}"
  printf "${DIM}  Stop: %s${OFF}\n" "./scripts/stop.sh  (or: make stop)"
}

main() {
  say "NETKARAR bootstrap (${MODE})"
  check_prereqs
  prepare_env_file
  if [[ "${MODE}" != "start" ]]; then
    setup_backend
    setup_frontend
  fi
  if [[ "${MODE}" == "setup" ]]; then
    ok "Setup complete. Start with: ./scripts/bootstrap.sh --start-only"
    exit 0
  fi
  start_services
}

main "$@"
