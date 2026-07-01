#!/usr/bin/env bash
# Regista o primeiro admin na API (bootstrap) se ainda não existirem utilizadores.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
API_URL="${E2E_API_URL:-$([[ "${E2E_USE_HTTPS:-}" == "1" ]] && echo "https://127.0.0.1:7225" || echo "http://127.0.0.1:5078")}"
EMAIL="${E2E_ADMIN_EMAIL:-e2e-fullstack@pirofafe.pt}"
PASSWORD="${E2E_ADMIN_PASSWORD:-Teste123!Aa}"
NOME="${E2E_ADMIN_NOME:-Admin E2E Fullstack}"

CURL_INSECURE=()
[[ "$API_URL" == https:* ]] && CURL_INSECURE=(-k)

bash "$ROOT/scripts/e2e-fullstack/wait-for-http.sh" "$API_URL/api/auth/existem-utilizadores"

STATUS_JSON="$(curl -sf "${CURL_INSECURE[@]}" "$API_URL/api/auth/existem-utilizadores")"
if echo "$STATUS_JSON" | grep -q '"primeiroRegistoDisponivel":true'; then
  echo "A registar primeiro administrador E2E..."
  HTTP_CODE="$(curl -s "${CURL_INSECURE[@]}" -o /tmp/e2e-seed-body.json -w "%{http_code}" -X POST "$API_URL/api/auth/registar-primeiro-utilizador" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"nome\":\"$NOME\"}")"
  if [[ "$HTTP_CODE" != "200" && "$HTTP_CODE" != "201" ]]; then
    echo "Falha ao registar admin (HTTP $HTTP_CODE):" >&2
    cat /tmp/e2e-seed-body.json >&2
    exit 1
  fi
  echo "Admin E2E criado: $EMAIL"
else
  echo "Já existem utilizadores — a usar conta existente ($EMAIL)."
fi
