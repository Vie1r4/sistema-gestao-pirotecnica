/**
 * Base URL da API do backend.
 * Definir NEXT_PUBLIC_API_URL no .env (ex.: https://localhost:7225 para dev, https://api.seudominio.pt para prod).
 * Em desenvolvimento, sem variável definida, usa https://localhost:7225.
 */
const base =
  typeof process.env.NEXT_PUBLIC_API_URL === "string" && process.env.NEXT_PUBLIC_API_URL.trim() !== ""
    ? process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/$/, "")
    : "https://localhost:7225";

export const API_BASE_URL = base;

/** URL completa para um path da API (ex.: apiPath("api/encomendas") => "https://localhost:7225/api/encomendas") */
export function apiPath(path: string): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${base}/${p}`;
}
