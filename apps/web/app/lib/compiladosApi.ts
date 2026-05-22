/**
 * API Compilados: atalhos que expandem para produtos nas encomendas.
 */

import { apiPath } from "./apiConfig";
import { parseApiErrorBody } from "./apiErrors";

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function jsonHeaders(token: string): HeadersInit {
  return { "Content-Type": "application/json", ...authHeaders(token) };
}

export type CompiladoItem = {
  id?: number;
  produtoId: number;
  produtoNome?: string;
  quantidadePorUnidade: number;
};

export type Compilado = {
  id: number;
  nome: string;
  itens: CompiladoItem[];
};

export type SaveCompiladoBody = {
  nome: string;
  itens: Array<{ produtoId: number; quantidadePorUnidade: number }>;
};

export async function fetchCompilados(token: string): Promise<Compilado[]> {
  const res = await fetch(apiPath("api/compilados"), { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar compilados");
  const data = (await res.json()) as { items?: Compilado[] };
  return (data.items ?? []).map(mapCompilado);
}

export async function fetchCompilado(token: string, id: number): Promise<Compilado> {
  const res = await fetch(apiPath(`api/compilados/${id}`), { headers: authHeaders(token) });
  if (res.status === 404) throw new Error("Compilado não encontrado");
  if (!res.ok) throw new Error("Falha ao carregar compilado");
  return mapCompilado(await res.json());
}

export async function postCompilado(token: string, body: SaveCompiladoBody): Promise<Compilado> {
  const res = await fetch(apiPath("api/compilados"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(parseApiErrorBody(data).message);
  return mapCompilado(data);
}

export async function putCompilado(token: string, id: number, body: SaveCompiladoBody): Promise<Compilado> {
  const res = await fetch(apiPath(`api/compilados/${id}`), {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(parseApiErrorBody(data).message);
  return mapCompilado(data);
}

export async function deleteCompilado(token: string, id: number): Promise<void> {
  const res = await fetch(apiPath(`api/compilados/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (res.status === 404) throw new Error("Compilado não encontrado");
  if (!res.ok) throw new Error("Falha ao eliminar compilado");
}

function mapCompilado(raw: Record<string, unknown>): Compilado {
  const itensRaw = (raw.itens ?? raw.Itens ?? []) as Array<Record<string, unknown>>;
  return {
    id: Number(raw.id ?? raw.Id),
    nome: String(raw.nome ?? raw.Nome ?? ""),
    itens: itensRaw.map((i) => ({
      id: i.id != null || i.Id != null ? Number(i.id ?? i.Id) : undefined,
      produtoId: Number(i.produtoId ?? i.ProdutoId),
      produtoNome: String(i.produtoNome ?? i.ProdutoNome ?? ""),
      quantidadePorUnidade: Number(i.quantidadePorUnidade ?? i.QuantidadePorUnidade),
    })),
  };
}
