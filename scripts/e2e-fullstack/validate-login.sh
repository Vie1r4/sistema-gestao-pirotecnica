#!/usr/bin/env bash
# Confirma que o admin E2E consegue autenticar-se na API (antes do Playwright).
set -euo pipefail

API_URL="${E2E_API_URL:-https://127.0.0.1:7225}"
EMAIL="${E2E_ADMIN_EMAIL:-e2e-fullstack@pirofafe.pt}"
PASSWORD="${E2E_ADMIN_PASSWORD:-Teste123!Aa}"
CURL_FLAGS=(-sf)
[[ "$API_URL" == https:* ]] && CURL_FLAGS+=(-k)

BODY_FILE="$(mktemp)"
HTTP_CODE="$(curl "${CURL_FLAGS[@]}" -o "$BODY_FILE" -w "%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")"

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "Login E2E falhou (HTTP $HTTP_CODE):" >&2
  cat "$BODY_FILE" >&2
  rm -f "$BODY_FILE"
  exit 1
fi

if ! grep -q '"token"' "$BODY_FILE"; then
  echo "Resposta de login sem token JWT:" >&2
  cat "$BODY_FILE" >&2
  rm -f "$BODY_FILE"
  exit 1
fi

rm -f "$BODY_FILE"
echo "Login API OK para $EMAIL"
