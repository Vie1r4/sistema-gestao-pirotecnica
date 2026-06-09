/**
 * API Encomendas: lista, criar (create + adicionar-itens + adicionar/remover item + submeter),
 * detalhe, aceitar, rejeitar, preparar, registar-preparacao, concluir.
 * Para o fluxo de criação (draft no servidor) usar credentials: 'include' para manter sessão.
 */

import { safeParseJson } from "./api";
import { apiPath } from "./apiConfig";
import { parseApiErrorBody } from "./apiErrors";

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function jsonHeaders(token: string): HeadersInit {
  return { "Content-Type": "application/json", ...authHeaders(token) };
}

/** GET api/encomendas — lista com filtro estado e paginação */
export async function fetchList(
  token: string,
  opts: { estado?: string; pagina?: number; itensPorPagina?: number } = {}
): Promise<{
  items: Array<Record<string, unknown>>;
  estado: string;
  estadosParaFiltro: string[];
  totaisPorEstado: Record<string, number>;
  totalGeral: number;
  paginaAtual: number;
  itensPorPagina: number;
  totalRegistos: number;
}> {
  const { estado = "", pagina = 1, itensPorPagina = 20 } = opts;
  const params = new URLSearchParams();
  if (estado) params.set("estado", estado);
  params.set("pagina", String(pagina));
  params.set("itensPorPagina", String(itensPorPagina));
  const res = await fetch(`${apiPath("api/encomendas")}?${params}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Lista encomendas: ${res.status}`);
  return res.json();
}

/** GET api/encomendas/create — clientes e model para criar */
export async function fetchCreate(
  token: string,
  clienteId?: number
): Promise<{ clientes: Array<{ id: number; nome: string }>; model: { clienteId: number } }> {
  const q = clienteId != null ? `?clienteId=${clienteId}` : "";
  const res = await fetch(`${apiPath("api/encomendas")}/create${q}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Create: ${res.status}`);
  return res.json();
}

/** POST api/encomendas/create — confirma cliente, nextStep AdicionarItens */
export async function postCreate(
  token: string,
  body: { clienteId: number }
): Promise<{ nextStep: string; clienteId: number }> {
  const res = await fetch(`${apiPath("api/encomendas")}/create`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ clienteId: Number(body.clienteId) }),
    credentials: "include",
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    if (res.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
    if (res.status === 403) throw new Error("Sem permissão para criar encomendas.");
    throw new Error(parseApiErrorBody(data).message);
  }
  return data as { nextStep: string; clienteId: number };
}

/** GET api/encomendas/adicionar-itens — cliente, produtos filtrados, itens do rascunho (session) */
export async function fetchAdicionarItens(
  token: string,
  clienteId: number,
  filtros: {
    pesquisa?: string;
    classificacao?: string;
    grupoCompatibilidade?: string;
    filtroTecnico?: string;
    calibre?: string;
  } = {}
): Promise<{
  cliente: { id: number; nome: string };
  clienteId: number;
  produtosFiltrados: Array<{ id: number; nome: string; [k: string]: unknown }>;
  compilados: Array<{ id: number; nome: string; itens: Array<{ produtoId: number; produtoNome?: string; quantidadePorUnidade: number }> }>;
  itensRascunho: Array<{ produtoId: number; produtoNome?: string; quantidade: number }>;
}> {
  const params = new URLSearchParams({ clienteId: String(clienteId) });
  if (filtros.pesquisa) params.set("pesquisa", filtros.pesquisa);
  if (filtros.classificacao) params.set("classificacao", filtros.classificacao);
  if (filtros.grupoCompatibilidade) params.set("grupoCompatibilidade", filtros.grupoCompatibilidade);
  if (filtros.filtroTecnico) params.set("filtroTecnico", filtros.filtroTecnico);
  if (filtros.calibre) params.set("calibre", filtros.calibre);
  const res = await fetch(`${apiPath("api/encomendas")}/adicionar-itens?${params}`, {
    headers: authHeaders(token),
    credentials: "include",
  });
  if (res.status === 404) throw new Error("CLIENTE_NAO_ENCONTRADO");
  if (!res.ok) throw new Error(`Adicionar-itens: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const rawCliente = data.cliente ?? data.Cliente;
  const cliente = rawCliente && typeof rawCliente === "object"
    ? { id: (rawCliente as Record<string, unknown>).id ?? (rawCliente as Record<string, unknown>).Id, nome: (rawCliente as Record<string, unknown>).nome ?? (rawCliente as Record<string, unknown>).Nome ?? "" }
    : null;
  return {
    cliente: cliente ? { id: Number(cliente.id), nome: String(cliente.nome) } : { id: clienteId, nome: "" },
    clienteId: (data.clienteId ?? data.ClienteId ?? clienteId) as number,
    produtosFiltrados: (data.produtosFiltrados ?? data.ProdutosFiltrados ?? []) as Array<{ id: number; nome: string; [k: string]: unknown }>,
    compilados: mapCompiladosFromApi(data.compilados ?? data.Compilados),
    itensRascunho: (data.itensRascunho ?? data.ItensRascunho ?? []) as Array<{ produtoId: number; produtoNome?: string; quantidade: number }>,
  };
}

function mapCompiladosFromApi(raw: unknown): Array<{
  id: number;
  nome: string;
  itens: Array<{ produtoId: number; produtoNome?: string; quantidadePorUnidade: number }>;
}> {
  if (!Array.isArray(raw)) return [];
  return raw.map((c) => {
    const row = c as Record<string, unknown>;
    const itensRaw = (row.itens ?? row.Itens ?? []) as Array<Record<string, unknown>>;
    return {
      id: Number(row.id ?? row.Id),
      nome: String(row.nome ?? row.Nome ?? ""),
      itens: itensRaw.map((i) => ({
        produtoId: Number(i.produtoId ?? i.ProdutoId),
        produtoNome: String(i.produtoNome ?? i.ProdutoNome ?? ""),
        quantidadePorUnidade: Number(i.quantidadePorUnidade ?? i.QuantidadePorUnidade),
      })),
    };
  });
}

/** POST api/encomendas/adicionar-item — adiciona ao rascunho (session) */
export async function postAdicionarItem(
  token: string,
  params: {
    clienteId: number;
    produtoId: number;
    quantidade: number;
    pesquisa?: string;
    classificacao?: string;
    grupoCompatibilidade?: string;
    filtroTecnico?: string;
    calibre?: string;
  }
): Promise<{ draft: { clienteId: number; itens: Array<{ produtoId: number; produtoNome?: string; quantidade: number }> }; message: string }> {
  const q = new URLSearchParams();
  q.set("clienteId", String(params.clienteId));
  q.set("produtoId", String(params.produtoId));
  q.set("quantidade", String(params.quantidade));
  if (params.pesquisa) q.set("pesquisa", params.pesquisa);
  if (params.classificacao) q.set("classificacao", params.classificacao);
  if (params.grupoCompatibilidade) q.set("grupoCompatibilidade", params.grupoCompatibilidade);
  if (params.filtroTecnico) q.set("filtroTecnico", params.filtroTecnico);
  if (params.calibre) q.set("calibre", params.calibre);
  const res = await fetch(`${apiPath("api/encomendas")}/adicionar-item?${q}`, {
    method: "POST",
    headers: authHeaders(token),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Adicionar-item: ${res.status}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const rawDraft = (data.draft ?? data.Draft) as { itens?: unknown[]; Itens?: unknown[]; clienteId?: number; ClienteId?: number } | undefined;
  return {
    draft: {
      clienteId: Number(rawDraft?.clienteId ?? rawDraft?.ClienteId ?? params.clienteId),
      itens: itensFromDraft(rawDraft),
    },
    message: String(data.message ?? data.Message ?? ""),
  };
}

/** POST api/encomendas/adicionar-compilado — expande atalho para produtos no rascunho */
export async function postAdicionarCompilado(
  token: string,
  params: {
    clienteId: number;
    compiladoId: number;
    quantidade: number;
    pesquisa?: string;
    classificacao?: string;
    grupoCompatibilidade?: string;
    filtroTecnico?: string;
    calibre?: string;
  }
): Promise<{ draft: { clienteId: number; itens: Array<{ produtoId: number; produtoNome?: string; quantidade: number }> }; message: string }> {
  const q = new URLSearchParams();
  q.set("clienteId", String(params.clienteId));
  q.set("compiladoId", String(params.compiladoId));
  q.set("quantidade", String(params.quantidade));
  if (params.pesquisa) q.set("pesquisa", params.pesquisa);
  if (params.classificacao) q.set("classificacao", params.classificacao);
  if (params.grupoCompatibilidade) q.set("grupoCompatibilidade", params.grupoCompatibilidade);
  if (params.filtroTecnico) q.set("filtroTecnico", params.filtroTecnico);
  if (params.calibre) q.set("calibre", params.calibre);
  const res = await fetch(`${apiPath("api/encomendas")}/adicionar-compilado?${q}`, {
    method: "POST",
    headers: authHeaders(token),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Adicionar-compilado: ${res.status}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const rawDraft = (data.draft ?? data.Draft) as { itens?: unknown[]; Itens?: unknown[]; clienteId?: number; ClienteId?: number } | undefined;
  return {
    draft: {
      clienteId: Number(rawDraft?.clienteId ?? rawDraft?.ClienteId ?? params.clienteId),
      itens: itensFromDraft(rawDraft),
    },
    message: String(data.message ?? data.Message ?? ""),
  };
}

/** POST api/encomendas/remover-item — remove do rascunho (session) */
export async function postRemoverItem(
  token: string,
  params: {
    clienteId: number;
    produtoId: number;
    pesquisa?: string;
    classificacao?: string;
    grupoCompatibilidade?: string;
    filtroTecnico?: string;
    calibre?: string;
  }
): Promise<{ draft: { clienteId: number; itens: Array<{ produtoId: number; produtoNome?: string; quantidade: number }> } }> {
  const q = new URLSearchParams();
  q.set("clienteId", String(params.clienteId));
  q.set("produtoId", String(params.produtoId));
  if (params.pesquisa) q.set("pesquisa", params.pesquisa);
  if (params.classificacao) q.set("classificacao", params.classificacao);
  if (params.grupoCompatibilidade) q.set("grupoCompatibilidade", params.grupoCompatibilidade);
  if (params.filtroTecnico) q.set("filtroTecnico", params.filtroTecnico);
  if (params.calibre) q.set("calibre", params.calibre);
  const res = await fetch(`${apiPath("api/encomendas")}/remover-item?${q}`, {
    method: "POST",
    headers: authHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Remover-item: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const rawDraft = (data.draft ?? data.Draft) as { itens?: unknown[]; Itens?: unknown[]; clienteId?: number; ClienteId?: number } | undefined;
  return {
    draft: {
      clienteId: Number(rawDraft?.clienteId ?? rawDraft?.ClienteId ?? params.clienteId),
      itens: itensFromDraft(rawDraft),
    },
  };
}

/** POST api/encomendas/submeter — cria encomenda a partir do rascunho */
export async function postSubmeter(
  token: string,
  body: { clienteId: number; nome?: string | null; dataEntrega?: string | null; observacoes?: string | null }
): Promise<{ encomenda: { id: number; [k: string]: unknown }; encomendaCriada: boolean }> {
  const res = await fetch(`${apiPath("api/encomendas")}/submeter`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({
      clienteId: body.clienteId,
      nome: body.nome?.trim() || null,
      dataEntrega: body.dataEntrega || null,
      observacoes: body.observacoes || null,
    }),
    credentials: "include",
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg = (data.error ?? data.Error) as string | undefined;
    if (msg) throw new Error(String(msg));
    if (res.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
    if (res.status === 403) throw new Error("Sem permissão para registar encomendas.");
    throw new Error(`Erro ao registar encomenda (${res.status}).`);
  }
  return data as { encomenda: { id: number }; encomendaCriada: boolean };
}

/**
 * Normaliza a lista de itens de um rascunho devolvido pela API.
 * Aceita tanto `{ itens: [...] }` como `{ Itens: [...] }` (case-insensitive do servidor).
 */
export function itensFromDraft(
  draft: { itens?: unknown[]; Itens?: unknown[] } | null | undefined
): Array<{ produtoId: number; produtoNome?: string; quantidade: number }> {
  const raw = draft?.itens ?? draft?.Itens;
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const i = item as Record<string, unknown>;
    return {
      produtoId: Number(i.produtoId ?? i.ProdutoId ?? 0),
      produtoNome: i.produtoNome != null || i.ProdutoNome != null
        ? String(i.produtoNome ?? i.ProdutoNome ?? "")
        : undefined,
      quantidade: Number(i.quantidade ?? i.Quantidade ?? 0),
    };
  });
}

/** POST api/encomendas/{id}/aceitar */
export async function postAceitar(token: string, id: number): Promise<{ encomenda: Record<string, unknown>; encomendaAceite: boolean }> {
  const res = await fetch(`${apiPath("api/encomendas")}/${id}/aceitar`, { method: "POST", headers: authHeaders(token) });
  const d = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg = (d.error ?? d.Error) as string | undefined;
    if (msg) throw new Error(String(msg));
    if (res.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
    if (res.status === 403) throw new Error("Sem permissão para aceitar encomendas (apenas Admin).");
    if (res.status === 404) throw new Error("Encomenda não encontrada.");
    throw new Error(`Erro ao aceitar (${res.status}).`);
  }
  return d as { encomenda: Record<string, unknown>; encomendaAceite: boolean };
}

/** GET api/encomendas/{id}/rejeitar — dados para formulário */
export async function fetchRejeitar(token: string, id: number): Promise<Record<string, unknown>> {
  const res = await fetch(`${apiPath("api/encomendas")}/${id}/rejeitar`, { headers: authHeaders(token) });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error ?? `Rejeitar GET: ${res.status}`);
  }
  return res.json();
}

/** POST api/encomendas/{id}/rejeitar */
export async function postRejeitar(
  token: string,
  id: number,
  body?: { motivoRejeicao?: string }
): Promise<{ encomenda: Record<string, unknown>; encomendaRejeitada: boolean }> {
  const res = await fetch(`${apiPath("api/encomendas")}/${id}/rejeitar`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error ?? `Rejeitar: ${res.status}`);
  }
  return res.json();
}

/** GET api/encomendas/{id}/preparar — encomenda, stockPorProduto, paióis, stockPaiolProduto */
export async function fetchPreparar(
  token: string,
  id: number
): Promise<{
  encomenda: Record<string, unknown>;
  stockPorProduto: Record<string, number>;
  paióis: Array<{ id: number; nome: string }>;
  stockPaiolProduto: Record<string, number>;
}> {
  const res = await fetch(`${apiPath("api/encomendas")}/${id}/preparar`, { headers: authHeaders(token) });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error ?? `Preparar: ${res.status}`);
  }
  return res.json();
}

export type RetiradaPreparacaoInput = { encomendaItemId: number; paiolId: number; quantidade: number };

/** POST api/encomendas/{id}/registar-preparacao */
export async function postRegistarPreparacao(
  token: string,
  id: number,
  retiradas: RetiradaPreparacaoInput[]
): Promise<{ encomendaPreparacao: boolean }> {
  const res = await fetch(`${apiPath("api/encomendas")}/${id}/registar-preparacao`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(retiradas),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error ?? `Registar preparação: ${res.status}`);
  }
  return res.json();
}

/** POST api/encomendas/{id}/concluir */
export async function postConcluir(token: string, id: number): Promise<{ encomenda: Record<string, unknown>; encomendaConcluida: boolean }> {
  const res = await fetch(`${apiPath("api/encomendas")}/${id}/concluir`, { method: "POST", headers: authHeaders(token) });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error ?? `Concluir: ${res.status}`);
  }
  return res.json();
}

/** GET api/encomendas/{id} — detalhe para edição (encomenda + itens + cliente) */
export async function fetchEncomendaDetalhe(
  token: string,
  id: number
): Promise<{ encomenda: Record<string, unknown>; stockPorProduto?: Record<string, number> }> {
  const res = await fetch(`${apiPath("api/encomendas")}/${id}`, { headers: authHeaders(token) });
  if (res.status === 404) throw new Error("NOT_FOUND");
  if (!res.ok) throw new Error(`Detalhe: ${res.status}`);
  return res.json();
}

/** GET api/encomendas/{id} — detalhe para a página (404 → null; 401 → UNAUTHORIZED). */
export async function fetchEncomendaDetalheParaPagina(
  token: string,
  id: number
): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${apiPath("api/encomendas")}/${id}`, { headers: authHeaders(token) });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return safeParseJson(res) as Promise<Record<string, unknown>>;
}

/** PUT api/encomendas/{id} — atualizar encomenda (data entrega, observações, itens). Apenas Pendente ou Aceite. */
export async function putEncomenda(
  token: string,
  id: number,
  body: {
    dataEntrega?: string | null;
    observacoes?: string | null;
    coordenadorPirotecnicoId?: number | null;
    itens: Array<{ produtoId: number; quantidade: number }>;
  }
): Promise<{ encomenda: Record<string, unknown>; encomendaEditada: boolean }> {
  const payload = {
    dataEntrega: body.dataEntrega?.trim() ? body.dataEntrega.trim().slice(0, 10) : null,
    observacoes: body.observacoes?.trim()?.slice(0, 2000) ?? null,
    coordenadorPirotecnicoId: body.coordenadorPirotecnicoId ?? null,
    itens: body.itens.map((i) => ({ produtoId: i.produtoId, quantidade: Number(i.quantidade) })),
  };
  const res = await fetch(`${apiPath("api/encomendas")}/${id}`, {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Atualizar: ${res.status}`);
  return data as { encomenda: Record<string, unknown>; encomendaEditada: boolean };
}
