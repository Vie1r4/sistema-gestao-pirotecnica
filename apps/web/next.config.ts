import type { NextConfig } from "next";

/** CSP completa com nonce: ver `proxy.ts` e `lib/csp.ts`. */
const nextConfig: NextConfig = {
  experimental: {
    /** Hashes SRI em build — complementa CSP strict em produção. */
    sri: {
      algorithm: "sha256",
    },
  },
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
        ],
      },
    ];
  },
};

export default nextConfig;
