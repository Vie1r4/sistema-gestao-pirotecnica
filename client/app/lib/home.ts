/**
 * API Home: página inicial, privacidade, erro, limpar-dados, preferências (tema), alterar-password.
 */

import { apiPath } from "./apiConfig";

const API_HOME = apiPath("api/home");

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** GET api/home — mensagem da página inicial */
export async function getHomeMessage(token: string): Promise<{ message: string }> {
  const res = await fetch(API_HOME, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao obter página inicial");
  return res.json() as Promise<{ message: string }>;
}

/** GET api/home/stats — estatísticas reais (clientes, serviços, produtos, paióis ativos) */
export type HomeStats = {
  totalClientes: number;
  totalServicos: number;
  totalProdutos: number;
  totalPaioisAtivos: number;
};

export async function getHomeStats(token: string): Promise<HomeStats> {
  const res = await fetch(`${API_HOME}/stats`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao obter estatísticas");
  return res.json() as Promise<HomeStats>;
}

/** GET api/home/privacy — mensagem de privacidade */
export async function getPrivacy(token: string): Promise<{ message: string }> {
  const res = await fetch(`${API_HOME}/privacy`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao obter política de privacidade");
  return res.json() as Promise<{ message: string }>;
}

/** GET api/home/error — dados do erro (AllowAnonymous) */
export async function getError(): Promise<{ requestId?: string; isDevelopment?: boolean }> {
  const res = await fetch(`${API_HOME}/error`);
  if (!res.ok) throw new Error("Falha ao obter dados de erro");
  const data = (await res.json()) as { requestId?: string; isDevelopment?: boolean };
  return { requestId: data.requestId, isDevelopment: data.isDevelopment };
}

/** GET api/home/limpar-dados — mensagem de confirmação */
export async function getLimparDados(token: string): Promise<{ message: string }> {
  const res = await fetch(`${API_HOME}/limpar-dados`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao obter confirmação de limpeza");
  return res.json() as Promise<{ message: string }>;
}

/** POST api/home/limpar-dados — confirma limpeza; servidor termina sessão */
export async function postLimparDados(token: string): Promise<{ signedOut: boolean; message: string }> {
  const res = await fetch(`${API_HOME}/limpar-dados`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Falha ao limpar dados");
  return res.json() as Promise<{ signedOut: boolean; message: string }>;
}

/** GET api/home/preferencias — tema (Light/Dark) guardado no servidor */
export async function getPreferencias(token: string): Promise<{ tema: string }> {
  const res = await fetch(`${API_HOME}/preferencias`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao obter preferências");
  return res.json() as Promise<{ tema: string }>;
}

/** POST api/home/preferencias — guardar tema */
export async function postPreferencias(
  token: string,
  tema: "Light" | "Dark"
): Promise<{ temaGuardado: boolean; tema: string }> {
  const res = await fetch(`${API_HOME}/preferencias`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ tema }),
  });
  if (!res.ok) throw new Error("Falha ao guardar preferências");
  return res.json() as Promise<{ temaGuardado: boolean; tema: string }>;
}

export type AlterarPasswordPayload = {
  passwordAtual: string;
  novaPassword: string;
  confirmarNovaPassword: string;
};

/** POST api/home/alterar-password */
export async function postAlterarPassword(
  token: string,
  payload: AlterarPasswordPayload
): Promise<{ passwordAlterada: boolean }> {
  const res = await fetch(`${API_HOME}/alterar-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({
      passwordAtual: payload.passwordAtual,
      novaPassword: payload.novaPassword,
      confirmarNovaPassword: payload.confirmarNovaPassword,
    }),
  });
  const data = (await res.json()) as {
    passwordAlterada?: boolean;
    errors?: Record<string, string[] | { errors?: string[] }>;
  };
  if (res.ok && data.passwordAlterada) return { passwordAlterada: true };
  const errors = data.errors && typeof data.errors === "object" ? data.errors : {};
  const messages = Object.values(errors).flatMap((v) =>
    Array.isArray(v) ? v : (v && typeof v === "object" && "errors" in v && Array.isArray((v as { errors: string[] }).errors) ? (v as { errors: string[] }).errors : [])
  );
  throw new Error(messages.filter(Boolean).join(" ") || "Erro ao alterar palavra-passe");
}
