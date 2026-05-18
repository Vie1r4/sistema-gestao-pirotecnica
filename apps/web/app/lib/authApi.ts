/**
 * API de autenticação pública e sessão: existem utilizadores, login, primeiro registo, /me.
 */

import { apiPath } from "./apiConfig";

/** GET api/auth/existem-utilizadores — sem token (bootstrap). */
export async function fetchExistemUtilizadores(): Promise<boolean> {
  const res = await fetch(apiPath("api/auth/existem-utilizadores"));
  if (!res.ok) throw new Error("http");
  const data = (await res.json()) as { existem?: boolean };
  if (data && typeof data.existem === "boolean") return data.existem;
  throw new Error("invalid");
}

/** POST api/auth/login — devolve Response para a página tratar 200/401 e tokens. */
export async function postLogin(email: string, password: string): Promise<Response> {
  return fetch(apiPath("api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
}

/** POST api/auth/registar-primeiro-utilizador */
export async function postRegistarPrimeiroUtilizador(body: {
  email: string;
  password: string;
  nome?: string;
}): Promise<Response> {
  return fetch(apiPath("api/auth/registar-primeiro-utilizador"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email.trim(),
      password: body.password,
      nome: body.nome?.trim() || undefined,
    }),
  });
}

/** POST api/auth/forgot-password — inicia o reset e envia email (resposta 200 sempre). */
export async function postForgotPassword(email: string): Promise<Response> {
  return fetch(apiPath("api/auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });
}

/** POST api/auth/reset-password — aplica token e define nova palavra-passe. */
export async function postResetPassword(body: {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword?: string;
}): Promise<Response> {
  return fetch(apiPath("api/auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email.trim(),
      token: body.token,
      newPassword: body.newPassword,
      confirmPassword: body.confirmPassword,
    }),
  });
}

/** GET api/auth/me — payload do utilizador atual ou null se 401/outro erro. */
export async function fetchAuthMe(token: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(apiPath("api/auth/me"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || !res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}
