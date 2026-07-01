#!/usr/bin/env bash
# Confirma login API + /me (nome ou email) antes do Playwright — evita falhas tardias na navbar.
set -euo pipefail

API_URL="${E2E_API_URL:-https://127.0.0.1:7225}"
EMAIL="${E2E_ADMIN_EMAIL:-e2e-fullstack@pirofafe.pt}"
PASSWORD="${E2E_ADMIN_PASSWORD:-Teste123!Aa}"
NOME="${E2E_ADMIN_NOME:-Admin E2E Fullstack}"
CURL_FLAGS=(-sf)
[[ "$API_URL" == https:* ]] && CURL_FLAGS+=(-k)

BODY_FILE="$(mktemp)"
trap 'rm -f "$BODY_FILE" "$ME_FILE"' EXIT
ME_FILE="$(mktemp)"

HTTP_CODE="$(curl "${CURL_FLAGS[@]}" -o "$BODY_FILE" -w "%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")"

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "Login E2E falhou (HTTP $HTTP_CODE):" >&2
  cat "$BODY_FILE" >&2
  exit 1
fi

TOKEN="$(python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(d.get('token') or d.get('Token') or '')" "$BODY_FILE")"
if [[ -z "$TOKEN" ]]; then
  echo "Resposta de login sem token JWT:" >&2
  cat "$BODY_FILE" >&2
  exit 1
fi

ME_CODE="$(curl "${CURL_FLAGS[@]}" -o "$ME_FILE" -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/auth/me")"

if [[ "$ME_CODE" != "200" ]]; then
  echo "GET /me falhou (HTTP $ME_CODE):" >&2
  cat "$ME_FILE" >&2
  exit 1
fi

python3 - "$ME_FILE" "$NOME" "$EMAIL" <<'PY'
import json, sys
path, expected_nome, expected_email = sys.argv[1:4]
me = json.load(open(path, encoding="utf-8"))
nome = (me.get("nome") or me.get("Nome") or "").strip()
email = (me.get("email") or me.get("Email") or "").strip()
if nome == expected_nome or email == expected_email:
    print(f"OK /me — nome={nome!r} email={email!r}")
    sys.exit(0)
print(f"::error::/me sem nome/email esperados (nome={nome!r}, email={email!r})", file=sys.stderr)
print(json.dumps(me, ensure_ascii=False), file=sys.stderr)
sys.exit(1)
PY

echo "Login API + /me OK para $EMAIL"
