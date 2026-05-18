/**
 * Content-Security-Policy — nonce por pedido (App Router).
 * Em desenvolvimento: `unsafe-eval` só em script-src (requerido pelo React/Next para debugging).
 * Em produção: sem `unsafe-inline` / `unsafe-eval` em script-src e style-src.
 */

export function buildConnectSrc(): string {
  const parts = [
    "'self'",
    "https://localhost:7225",
    "http://localhost:5078",
    "http://127.0.0.1:5078",
    "https://127.0.0.1:7225",
    "ws://localhost:*",
    "ws://127.0.0.1:*",
  ];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (apiUrl) {
    try {
      const origin = new URL(apiUrl).origin;
      if (!parts.includes(origin)) parts.push(origin);
    } catch {
      /* ignorar */
    }
  }
  return parts.join(" ");
}

export function buildContentSecurityPolicy(nonce: string, isDev: boolean): string {
  const connectSrc = buildConnectSrc();
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;
  const styleSrc = `style-src 'self' 'nonce-${nonce}'`;

  return [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
    `connect-src ${connectSrc}`,
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
    "font-src 'self' data:",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function normalizeCspHeader(value: string): string {
  return value.replace(/\s{2,}/g, " ").trim();
}
