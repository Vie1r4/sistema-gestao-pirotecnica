/**
 * Autenticação: access token e refresh token no localStorage.
 * Renovação do JWT antes de expirar para evitar logout a cada 60 minutos.
 */

import { apiPath } from "./apiConfig";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Guarda access token e refresh token (após login ou após refresh). */
export function setTokens(token: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(apiPath("api/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      token?: string;
      refreshToken?: string;
    };
    const token = data.token;
    const newRefresh = data.refreshToken;
    if (token && newRefresh) {
      setTokens(token, newRefresh);
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
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      fetch(apiPath("api/auth/logout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
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
