import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Em dev, Strict Mode monta componentes duas vezes; desativar reduz a sensação de "carregar duas vezes"
  reactStrictMode: false,
  // Permite abrir o dev server pelo IP da LAN (telefone); sem isto o Next avisa e pode bloquear /_next/*.
  // Padrões alinhados com isCsrfOriginAllowed (hostname, sem porta).
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*", "172.*.*.*"],
};

export default nextConfig;
