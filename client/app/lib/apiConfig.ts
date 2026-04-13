/**
 * Base URL da API do backend.
 *
 * - **NEXT_PUBLIC_API_URL** no `.env` tem prioridade (ex.: produção ou porta personalizada).
 * - Sem variável: em **localhost** no browser usa `https://localhost:7225`.
 * - Se abrir o site pelo **IP da LAN** (ex.: `http://192.168.x.x:3000` no telemóvel), usa
 *   automaticamente `http://<mesmo-host>:5078` — o telemóvel não pode usar `localhost` para
 *   chegar ao PC. A API em Development deve escutar em `0.0.0.0` e não redirecionar HTTP→HTTPS.
 *
 * CORS em Development já aceita origens em IPs privados na porta 3000.
 */

const DEFAULT_HTTPS_PORT = 7225;
const DEFAULT_HTTP_PORT = 5078;

/** Alinhado com `RequestDiagnosticsMiddleware` no backend — envio opcional e leitura na resposta. */
export const API_CORRELATION_ID_HEADER = "X-Correlation-Id";

/** Id por pedido ou ação; pode ser enviado em `fetch` e comparado com o header da resposta. */
export function createClientCorrelationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:${DEFAULT_HTTP_PORT}`;
    }
  }

  return `https://localhost:${DEFAULT_HTTPS_PORT}`;
}

/** URL completa para um path da API */
export function apiPath(path: string): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${getApiBaseUrl()}/${p}`;
}
