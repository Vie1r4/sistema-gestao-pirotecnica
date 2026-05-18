import type { NextConfig } from "next";

function buildConnectSrc(): string {
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
      /* ignorar URL inválida */
    }
  }
  return parts.join(" ");
}

const nextConfig: NextConfig = {
  // Em dev, Strict Mode monta componentes duas vezes; desativar reduz a sensação de "carregar duas vezes"
  reactStrictMode: false,
  // Permite abrir o dev server pelo IP da LAN (telefone); sem isto o Next avisa e pode bloquear /_next/*.
  // Padrões alinhados com isCsrfOriginAllowed (hostname, sem porta).
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*", "172.*.*.*"],
  async headers() {
    const connectSrc = buildConnectSrc();
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
          },
          {
            // Report-Only: iterar violações em dev antes de reforçar enforcement completo.
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              `connect-src ${connectSrc}`,
              "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
              "font-src 'self' data:",
              "worker-src 'self' blob:",
              "form-action 'self'",
              "frame-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
