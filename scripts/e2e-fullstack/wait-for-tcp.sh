#!/usr/bin/env bash
# Espera até uma porta TCP aceitar ligações (ex.: SQL Server 1433).
set -euo pipefail

HOST="${1:?host}"
PORT="${2:?port}"
MAX_ATTEMPTS="${3:-60}"
SLEEP_SEC="${4:-2}"

for ((i = 1; i <= MAX_ATTEMPTS; i++)); do
  if (echo >/dev/tcp/"$HOST"/"$PORT") >/dev/null 2>&1; then
    echo "OK: $HOST:$PORT"
    exit 0
  fi
  echo "A aguardar $HOST:$PORT ($i/$MAX_ATTEMPTS)..."
  sleep "$SLEEP_SEC"
done

echo "Timeout à espera de $HOST:$PORT" >&2
exit 1
