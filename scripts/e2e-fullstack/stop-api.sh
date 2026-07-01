#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PID_FILE="${E2E_API_PID_FILE:-$ROOT/.e2e-api.pid}"

if [[ -f "$PID_FILE" ]]; then
  PID="$(cat "$PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
    echo "API terminada (PID $PID)"
  fi
  rm -f "$PID_FILE"
fi
