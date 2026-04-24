/**
 * Autenticação:
 * - Access token no localStorage (curta duração).
 * - Refresh token em cookie HttpOnly no backend (não acessível a JS).
 * Renovação do JWT antes de expirar para evitar logout a cada 60 minutos.
 */

import { apiPath } from "./apiConfig";

const TOKEN_KEY = "token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Guarda access token (após login ou após refresh). */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function isAuthenticated(): boolean {
  const token = getToken();
  return token != null && token.length > 0;
}

/**
 * Renova o access token usando o refresh token.
 * Atualiza localStorage com os novos token e refreshToken.
 * @returns Novo access token ou null em caso de erro.
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(apiPath("api/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      token?: string;
    };
    const token = data.token;
    if (token) {
      setToken(token);
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

/** Revoga o refresh token no servidor (opcional) e limpa tokens locais. */
export function logout(): void {
  if (typeof window === "undefined") return;
  try {
    fetch(apiPath("api/auth/logout"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("pirofafe-user");
  } catch {}
  window.location.href = "/login";
}

/**
 * Decodifica o payload do JWT (sem verificar assinatura) e devolve o exp em segundos, ou null.
 */
export function getTokenExpirationSeconds(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const exp = payload.exp;
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}
