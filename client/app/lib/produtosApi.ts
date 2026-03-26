/**
 * API Produtos: lista, gerir, detalhe, create, edit, delete.
 */

import { apiPath } from "./apiConfig";
import { parseApiErrorBody } from "./apiErrors";

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function jsonHeaders(token: string): HeadersInit {
  return { "Content-Type": "application/json", ...authHeaders(token) };
}

export type ProdutoApiPayload = {
  id?: number;
  nome: string;
  nemPorUnidade: number;
  familiaRisco: string;
  unidade?: string | null;
  filtroTecnico?: string | null;
  calibre?: string | null;
  grupoCompatibilidade?: string | null;
};

type ListFilters = {
  pesquisa?: string;
  classificacao?: string;
  grupoCompatibilidade?: string;
  filtroTecnico?: string;
  calibre?: string;
};

/** GET api/produtos — lista com filtros */
export async function fetchList(
  token: string,
  filters?: ListFilters
): Promise<{
  items: Array<Record<string, unknown>>;
  pesquisa: string;
  classificacao: string;
  grupoCompatibilidade: string;
  filtroTecnico: string;
  calibre: string;
}> {
  const params = new URLSearchParams();
  if (filters?.pesquisa) params.set("pesquisa", filters.pesquisa);
  if (filters?.classificacao) params.set("classificacao", filters.classificacao);
  if (filters?.grupoCompatibilidade) params.set("grupoCompatibilidade", filters.grupoCompatibilidade);
  if (filters?.filtroTecnico) params.set("filtroTecnico", filters.filtroTecnico);
  if (filters?.calibre) params.set("calibre", filters.calibre);
  const q = params.toString();
  const res = await fetch(`${apiPath("api/produtos")}${q ? `?${q}` : ""}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar produtos");
  return res.json();
}

/** GET api/produtos/gerir — lista para gestão (mesmos filtros) */
export async function fetchGerir(token: string, filters?: ListFilters): Promise<{
  items: Array<Record<string, unknown>>;
  pesquisa: string;
  classificacao: string;
  grupoCompatibilidade: string;
  filtroTecnico: string;
  calibre: string;
}> {
  const params = new URLSearchParams();
  if (filters?.pesquisa) params.set("pesquisa", filters.pesquisa);
  if (filters?.classificacao) params.set("classificacao", filters.classificacao);
  if (filters?.grupoCompatibilidade) params.set("grupoCompatibilidade", filters.grupoCompatibilidade);
  if (filters?.filtroTecnico) params.set("filtroTecnico", filters.filtroTecnico);
  if (filters?.calibre) params.set("calibre", filters.calibre);
  const q = params.toString();
  const res = await fetch(`${apiPath("api/produtos")}/gerir${q ? `?${q}` : ""}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar produtos");
  return res.json();
}

/** GET api/produtos/{id} — detalhe */
export async function fetchDetails(token: string, id: number): Promise<Record<string, unknown>> {
  const res = await fetch(`${apiPath("api/produtos")}/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Produto não encontrado");
  return res.json();
}

/** GET api/produtos/create — opções para formulário (Admin) */
export async function fetchCreate(token: string): Promise<{
  produto: Record<string, unknown>;
  familiaRisco: string[];
  grupoCompatibilidade: string[];
  filtroTecnico: string[];
  calibre: string[];
}> {
  const res = await fetch(`${apiPath("api/produtos")}/create`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar formulário");
  return res.json();
}

/** POST api/produtos — criar produto (Admin) */
export async function postCreate(token: string, payload: ProdutoApiPayload): Promise<{ produto: Record<string, unknown> }> {
  const body = {
    Id: 0,
    Nome: payload.nome,
    NEMPorUnidade: payload.nemPorUnidade,
    FamiliaRisco: payload.familiaRisco,
    Unidade: payload.unidade ?? null,
    FiltroTecnico: payload.filtroTecnico ?? null,
    Calibre: payload.calibre ?? null,
    GrupoCompatibilidade: payload.grupoCompatibilidade ?? null,
  };
  const res = await fetch(apiPath("api/produtos"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { errors?: unknown }).errors ? "Dados inválidos" : "Falha ao criar");
  return data as { produto: Record<string, unknown> };
}

/** GET api/produtos/{id}/edit — dados para editar */
export async function fetchEdit(token: string, id: number): Promise<{
  produto: Record<string, unknown>;
  familiaRisco: string[];
  grupoCompatibilidade: string[];
  filtroTecnico: string[];
  calibre: string[];
}> {
  const res = await fetch(`${apiPath("api/produtos")}/${id}/edit`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Produto não encontrado");
  return res.json();
}

/** PUT api/produtos/{id} — atualizar produto (Admin) */
export async function putEdit(token: string, id: number, payload: ProdutoApiPayload): Promise<{ produto: Record<string, unknown> }> {
  const body = {
    Id: id,
    Nome: payload.nome,
    NEMPorUnidade: payload.nemPorUnidade,
    FamiliaRisco: payload.familiaRisco,
    Unidade: payload.unidade ?? null,
    FiltroTecnico: payload.filtroTecnico ?? null,
    Calibre: payload.calibre ?? null,
    GrupoCompatibilidade: payload.grupoCompatibilidade ?? null,
  };
  const res = await fetch(`${apiPath("api/produtos")}/${id}`, {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiErrorBody(data).message);
  return data as { produto: Record<string, unknown> };
}

/** GET api/produtos/{id}/delete — dados para página eliminar (Admin) */
export async function fetchDeleteGet(token: string, id: number): Promise<Record<string, unknown>> {
  const res = await fetch(`${apiPath("api/produtos")}/${id}/delete`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Produto não encontrado");
  return res.json();
}

/** DELETE api/produtos/{id} — eliminar produto (Admin) */
export async function deleteProdutoApi(token: string, id: number): Promise<void> {
  const res = await fetch(`${apiPath("api/produtos")}/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok && res.status !== 204) throw new Error("Falha ao eliminar");
}

/** Converte objeto da API (PascalCase) para formato frontend (camelCase) */
export function mapApiToProduto(p: Record<string, unknown>): {
  id: string;
  nome: string;
  nemPorUnidade: number;
  familiaRisco: string;
  referencia?: string;
  filtroTecnico?: string;
  calibre?: string;
  grupoCompatibilidade?: string;
} {
  const get = (k: string) => p[k] ?? p[k.charAt(0).toUpperCase() + k.slice(1)];
  return {
    id: String(get("id") ?? get("Id") ?? ""),
    nome: String(get("nome") ?? get("Nome") ?? ""),
    nemPorUnidade: Number(get("nemPorUnidade") ?? get("NEMPorUnidade") ?? 0),
    familiaRisco: String(get("familiaRisco") ?? get("FamiliaRisco") ?? ""),
    referencia: (get("referencia") ?? get("Referencia") ?? get("unidade") ?? get("Unidade")) as string | undefined,
    filtroTecnico: (get("filtroTecnico") ?? get("FiltroTecnico")) as string | undefined,
    calibre: (get("calibre") ?? get("Calibre")) as string | undefined,
    grupoCompatibilidade: (get("grupoCompatibilidade") ?? get("GrupoCompatibilidade")) as string | undefined,
  };
}
