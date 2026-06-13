/**
 * API Paiol: stock, gestao, create, edit, delete, documentos, movimentos.
 */

import { apiPath } from "./apiConfig";
import { parseApiErrorBody } from "./apiErrors";
import { safeParseJson } from "./api";

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** GET api/paiol — lista com ocupação (Armazém / gestão sem permissão admin). */
export async function fetchListaPaiol(token: string): Promise<unknown> {
  const res = await fetch(apiPath("api/paiol"), { headers: authHeaders(token) });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(res.status === 404 ? "Não encontrado" : `Erro ${res.status}`);
  return res.json();
}

/** GET api/paiol/{id} — detalhe (404/403 → null; 401 → UNAUTHORIZED). */
export async function fetchPaiolDetalheJson(
  token: string,
  id: number
): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${apiPath("api/paiol")}/${id}`, { headers: authHeaders(token) });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

/** DELETE api/paiol/{id} — eliminar paiol (Admin). */
export async function deletePaiol(token: string, id: number): Promise<void> {
  const res = await fetch(`${apiPath("api/paiol")}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (res.status === 401) throw new Error("Não autenticado");
  if (res.status !== 204 && !res.ok) throw new Error("Falha ao eliminar");
}

/** GET api/paiol/{id}/conteudo — stock no paiol + metadados */
export async function fetchConteudoPaiol(
  token: string,
  id: number
): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${apiPath("api/paiol")}/${id}/conteudo`, { headers: authHeaders(token) });
  if (res.status === 401) throw new Error("UNAUTH");
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

/** GET api/paiol/stock — catálogo com coluna stock (produtos + stockPorProduto) */
export async function fetchStock(
  token: string,
  filters?: {
    pesquisa?: string;
    classificacao?: string;
    categoria?: string;
    filtroTecnico?: string;
    calibre?: string;
  }
): Promise<{
  items: Array<Record<string, unknown>>;
  stockPorProduto: Record<string, number>;
  pesquisa: string;
  classificacao: string;
  categoria: string;
  filtroTecnico: string;
  calibre: string;
}> {
  const params = new URLSearchParams();
  if (filters?.pesquisa) params.set("pesquisa", filters.pesquisa);
  if (filters?.classificacao) params.set("classificacao", filters.classificacao);
  if (filters?.categoria) params.set("categoria", filters.categoria);
  if (filters?.filtroTecnico) params.set("filtroTecnico", filters.filtroTecnico);
  if (filters?.calibre) params.set("calibre", filters.calibre);
  const q = params.toString();
  const res = await fetch(`${apiPath("api/paiol")}/stock${q ? `?${q}` : ""}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar stock");
  return res.json();
}

/** GET api/paiol/gestao — lista de paióis com ocupação (Admin) */
export async function fetchGestao(token: string): Promise<Array<Record<string, unknown>>> {
  const res = await fetch(`${apiPath("api/paiol")}/gestao`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar gestão");
  return res.json();
}

/** POST api/paiol — criar paiol (FormData). */
export async function postCreatePaiol(
  token: string,
  formData: FormData
): Promise<{ paiol?: { Id?: number; id?: number } }> {
  const res = await fetch(apiPath("api/paiol"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (res.status === 401) throw new Error("Não autenticado");
  if (res.status === 403) throw new Error("Sem permissão para criar paiol (requer perfil Admin).");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(parseApiErrorBody(err).message);
  }
  return res.json();
}

/** GET api/paiol/create — dados para formulário criar (perfisRisco, estados) */
export async function fetchCreate(token: string): Promise<{
  paiol: Record<string, unknown>;
  perfisRisco: string[];
  estados: string[];
}> {
  const res = await fetch(`${apiPath("api/paiol")}/create`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar formulário");
  return res.json();
}

/** GET api/paiol/{id}/edit — dados para editar (paiol, opções) */
export async function fetchEdit(token: string, id: number): Promise<{
  paiol: Record<string, unknown>;
  perfisRisco: string[];
  estados: string[];
}> {
  const res = await fetch(`${apiPath("api/paiol")}/${id}/edit`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar dados para editar");
  return res.json();
}

/** PUT api/paiol/{id} — atualizar paiol (FormData) */
export async function putEdit(token: string, id: number, formData: FormData): Promise<{ paiol: Record<string, unknown> }> {
  const res = await fetch(`${apiPath("api/paiol")}/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Falha ao guardar");
  }
  return res.json();
}

/** GET api/paiol/{id}/delete — dados do paiol para página eliminar (Admin) */
export async function fetchDeleteGet(token: string, id: number): Promise<Record<string, unknown>> {
  const res = await fetch(`${apiPath("api/paiol")}/${id}/delete`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar");
  return res.json();
}

/** GET api/paiol/{id}/documentos/{extraId} — obtém ficheiro e abre numa nova janela */
export async function openDocumento(token: string, paiolId: number, extraId: number): Promise<void> {
  const res = await fetch(`${apiPath("api/paiol")}/${paiolId}/documentos/${extraId}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Documento não encontrado");
  const blob = await res.blob();
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const url = URL.createObjectURL(new Blob([blob], { type: contentType }));
  const w = window.open(url, "_blank", "noopener");
  if (!w) URL.revokeObjectURL(url);
}

/** GET api/paiol/movimentos — entradas/saídas paginadas (gestão armazém). */
export async function fetchPaiolMovimentos(
  token: string,
  params: { tipo?: string; paiolId?: string; pagina: number; itensPorPagina: number }
): Promise<Record<string, unknown>> {
  const q = new URLSearchParams();
  if (params.tipo) q.set("tipo", params.tipo);
  if (params.paiolId) q.set("paiolId", params.paiolId);
  q.set("pagina", String(params.pagina));
  q.set("itensPorPagina", String(params.itensPorPagina));
  const res = await fetch(`${apiPath("api/paiol/movimentos")}?${q.toString()}`, {
    method: "GET",
    headers: authHeaders(token),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ${res.status}`);
  }
  const data = (await safeParseJson(res)) as Record<string, unknown> | null;
  if (!data) throw new Error("Resposta inválida");
  return data;
}
