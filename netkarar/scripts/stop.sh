#!/usr/bin/env bash
# Stop any background services started by bootstrap.sh
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
ROOT_DIR="$(cd -- "${SCRIPT_DIR}/.." &> /dev/null && pwd)"
PID_DIR="${ROOT_DIR}/.pids"

if [[ ! -d "${PID_DIR}" ]]; then
  echo "No PID directory found — nothing to stop."
  exit 0
fi

stopped=0
for pidfile in "${PID_DIR}"/*.pid; do
  [[ -e "$pidfile" ]] || continue
  pid="$(cat "$pidfile" 2>/dev/null || true)"
  name="$(basename "$pidfile" .pid)"
  if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
    kill "${pid}" 2>/dev/null || true
    echo "Stopped ${name} (PID ${pid})"
    stopped=$((stopped + 1))
  fi
  rm -f "$pidfile"
done

if [[ "${stopped}" -eq 0 ]]; then
  echo "No running NETKARAR services found."
fi
