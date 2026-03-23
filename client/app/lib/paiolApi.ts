/**
 * API Paiol: stock, gestao, create, edit, delete, documentos.
 */

import { apiPath } from "./apiConfig";

const API_PAIOL = apiPath("api/paiol");

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** GET api/paiol/stock — catálogo com coluna stock (produtos + stockPorProduto) */
export async function fetchStock(
  token: string,
  filters?: {
    pesquisa?: string;
    classificacao?: string;
    grupoCompatibilidade?: string;
    filtroTecnico?: string;
    calibre?: string;
  }
): Promise<{
  items: Array<Record<string, unknown>>;
  stockPorProduto: Record<string, number>;
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
  const res = await fetch(`${API_PAIOL}/stock${q ? `?${q}` : ""}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar stock");
  return res.json();
}

/** GET api/paiol/gestao — lista de paióis com ocupação (Admin) */
export async function fetchGestao(token: string): Promise<Array<Record<string, unknown>>> {
  const res = await fetch(`${API_PAIOL}/gestao`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar gestão");
  return res.json();
}

/** GET api/paiol/create — dados para formulário criar (perfisRisco, estados, cargosDisponiveis) */
export async function fetchCreate(token: string): Promise<{
  paiol: Record<string, unknown>;
  perfisRisco: string[];
  estados: string[];
  cargosDisponiveis: string[];
}> {
  const res = await fetch(`${API_PAIOL}/create`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar formulário");
  return res.json();
}

/** GET api/paiol/{id}/edit — dados para editar (paiol, cargosSelecionados, opções) */
export async function fetchEdit(token: string, id: number): Promise<{
  paiol: Record<string, unknown>;
  perfisRisco: string[];
  estados: string[];
  cargosDisponiveis: string[];
  cargosSelecionados: string[];
}> {
  const res = await fetch(`${API_PAIOL}/${id}/edit`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar dados para editar");
  return res.json();
}

/** PUT api/paiol/{id} — atualizar paiol (FormData) */
export async function putEdit(token: string, id: number, formData: FormData): Promise<{ paiol: Record<string, unknown> }> {
  const res = await fetch(`${API_PAIOL}/${id}`, {
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
  const res = await fetch(`${API_PAIOL}/${id}/delete`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar");
  return res.json();
}

/** GET api/paiol/{id}/documentos/{extraId} — obtém ficheiro e abre numa nova janela */
export async function openDocumento(token: string, paiolId: number, extraId: number): Promise<void> {
  const res = await fetch(`${API_PAIOL}/${paiolId}/documentos/${extraId}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Documento não encontrado");
  const blob = await res.blob();
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const url = URL.createObjectURL(new Blob([blob], { type: contentType }));
  const w = window.open(url, "_blank", "noopener");
  if (!w) URL.revokeObjectURL(url);
}
