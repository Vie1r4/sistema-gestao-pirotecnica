import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Em dev, Strict Mode monta componentes duas vezes; desativar reduz a sensação de "carregar duas vezes"
  reactStrictMode: false,
  // Permite abrir o dev server pelo IP da LAN (telefone); sem isto o Next avisa e pode bloquear /_next/*.
  // Padrões alinhados com isCsrfOriginAllowed (hostname, sem porta).
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*", "172.*.*.*"],
  async headers() {
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
            key: "Content-Security-Policy-Report-Only",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://localhost:7225 http://localhost:5078 http://127.0.0.1:5078; img-src 'self' data: blob:; font-src 'self' data:",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
