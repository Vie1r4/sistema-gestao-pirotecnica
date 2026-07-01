#!/usr/bin/env bash
# Arranca a API para E2E full-stack. Requer SQL Server acessível.
# E2E_USE_HTTPS=1 (recomendado/CI): HTTPS em 7225 — refresh cookie cross-origin com o frontend.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PID_FILE="${E2E_API_PID_FILE:-$ROOT/.e2e-api.pid}"
LOG_FILE="${E2E_API_LOG_FILE:-$ROOT/.e2e-api.log}"

export ASPNETCORE_ENVIRONMENT="${ASPNETCORE_ENVIRONMENT:-Development}"
export Jwt__Secret="${Jwt__Secret:-e2e-fullstack-jwt-secret-minimum-32-characters}"
export Cors__AllowedOrigins="${Cors__AllowedOrigins:-http://127.0.0.1:3000}"
export Bootstrap__AllowFirstUserRegistration="${Bootstrap__AllowFirstUserRegistration:-true}"

if [[ "${E2E_USE_HTTPS:-}" == "1" ]]; then
  export ASPNETCORE_URLS="${ASPNETCORE_URLS:-https://127.0.0.1:7225}"
else
  export ASPNETCORE_URLS="${ASPNETCORE_URLS:-http://127.0.0.1:5078}"
fi

if [[ -z "${ConnectionStrings__FinalprojContext:-}" ]]; then
  echo "ConnectionStrings__FinalprojContext em falta." >&2
  exit 1
fi

SQL_HOST="${E2E_SQL_HOST:-localhost}"
bash "$ROOT/scripts/e2e-fullstack/wait-for-tcp.sh" "$SQL_HOST" 1433 60 2

if [[ -f "$PID_FILE" ]]; then
  bash "$ROOT/scripts/e2e-fullstack/stop-api.sh"
fi

cd "$ROOT"
dotnet build src/Finalproj.Api/Finalproj.Api.csproj -c Release --no-restore 2>/dev/null || dotnet build src/Finalproj.Api/Finalproj.Api.csproj -c Release

nohup dotnet run --project src/Finalproj.Api/Finalproj.Api.csproj -c Release --no-launch-profile --no-build >"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"
echo "API PID $(cat "$PID_FILE") — $ASPNETCORE_URLS — log: $LOG_FILE"
