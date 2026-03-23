import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Em dev, Strict Mode monta componentes duas vezes; desativar reduz a sensação de "carregar duas vezes"
  reactStrictMode: false,
};

export default nextConfig;
