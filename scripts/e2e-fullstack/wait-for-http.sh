#!/usr/bin/env bash
# Espera até URL responder HTTP 2xx/3xx (curl -f).
set -euo pipefail

URL="${1:?URL em falta}"
MAX_ATTEMPTS="${2:-60}"
SLEEP_SEC="${3:-2}"

CURL_OPTS=(-sf)
[[ "$URL" == https:* ]] && CURL_OPTS+=(-k)

for ((i = 1; i <= MAX_ATTEMPTS; i++)); do
  if curl "${CURL_OPTS[@]}" "$URL" > /dev/null; then
    echo "OK: $URL"
    exit 0
  fi
  echo "A aguardar $URL ($i/$MAX_ATTEMPTS)..."
  sleep "$SLEEP_SEC"
done

echo "Timeout à espera de $URL" >&2
exit 1
