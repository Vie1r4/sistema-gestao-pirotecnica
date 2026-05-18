/**
 * Autenticação:
 * - Access token em memória (Zustand) — não persiste em localStorage (mitiga XSS).
 * - Refresh token em cookie HttpOnly no backend.
 */

import { apiPath } from "./apiConfig";
import { useAuthStore } from "@/app/stores/useAuthStore";

/** Token injectado por Playwright E2E (não usar em produção). */
declare global {
  interface Window {
    __PIROFAFE_E2E_TOKEN__?: string;
  }
}

function getE2eToken(): string | null {
  if (typeof window === "undefined") return null;
  const t = window.__PIROFAFE_E2E_TOKEN__;
  return t && t.length > 0 ? t : null;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return getE2eToken() ?? useAuthStore.getState().token;
}

/** Guarda access token (após login ou após refresh). */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  delete window.__PIROFAFE_E2E_TOKEN__;
  useAuthStore.getState().setToken(token);
}

/** Usado pelos testes E2E para simular sessão sem localStorage. */
export function setE2eToken(token: string): void {
  if (typeof window === "undefined") return;
  window.__PIROFAFE_E2E_TOKEN__ = token;
  useAuthStore.getState().setToken(token);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  return token != null && token.length > 0;
}

/** Renova o access token usando o cookie HttpOnly de refresh. */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(apiPath("api/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
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

/** Revoga o refresh token no servidor e limpa o access token em memória. */
export function logout(): void {
  if (typeof window === "undefined") return;
  try {
    fetch(apiPath("api/auth/logout"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    }).catch(() => {});
    useAuthStore.getState().setToken(null);
    localStorage.removeItem("pirofafe-user");
    localStorage.removeItem("token");
  } catch {}
  window.location.href = "/login";
}

/** Decodifica o payload do JWT (sem verificar assinatura) e devolve o exp em segundos, ou null. */
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
