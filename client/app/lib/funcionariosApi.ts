/**
 * API Funcionários: create (GET/POST), delete (GET/DELETE).
 * Lista, detalhe, edit e desassociar já usados nas páginas com fetch direto; aqui centralizamos create e delete.
 */

import { apiPath } from "./apiConfig";
import { parseApiErrorBody } from "./apiErrors";

const API_FUNCIONARIOS = apiPath("api/funcionarios");

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** GET api/funcionarios/create — opções para formulário (Admin) */
export async function fetchCreate(token: string): Promise<{
  funcionario: Record<string, unknown>;
  cargos: string[];
  rolesConta: string[];
}> {
  const res = await fetch(`${API_FUNCIONARIOS}/create`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar formulário");
  return res.json();
}

/** POST api/funcionarios — criar funcionário (Admin). Enviar FormData (multipart/form-data). */
export async function postCreate(token: string, formData: FormData): Promise<{ funcionario: Record<string, unknown>; funcionarioCriado: boolean }> {
  const res = await fetch(API_FUNCIONARIOS, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiErrorBody(data).message);
  return data as { funcionario: Record<string, unknown>; funcionarioCriado: boolean };
}

/** GET api/funcionarios/{id}/delete — dados para página eliminar (Admin) */
export async function fetchDeleteGet(token: string, id: number): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_FUNCIONARIOS}/${id}/delete`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Funcionário não encontrado");
  return res.json();
}

/** DELETE api/funcionarios/{id} — eliminar funcionário (Admin) */
export async function deleteFuncionarioApi(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_FUNCIONARIOS}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok && res.status !== 204) throw new Error("Falha ao eliminar");
}
