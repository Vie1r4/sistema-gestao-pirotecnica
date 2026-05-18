/**
 * Tipos e API para a área Clientes.
 * Lista, detalhe, criar, editar e eliminar usam apenas a API do backend (api/clientes).
 */

import { apiPath } from "./apiConfig";
import { parseApiErrorBody } from "./apiErrors";

export const TIPOS_CLIENTE = ["Particular", "Empresa"] as const;
export type TipoCliente = (typeof TIPOS_CLIENTE)[number];

export type ClienteDocumentoExtra = {
  id: string;
  nome: string;
  caminho?: string;
};

export type Cliente = {
  id: string;
  nome: string;
  tipoCliente: TipoCliente;
  nif?: string;
  email?: string;
  telefone?: string;
  morada?: string;
  notas?: string;
  dataRegisto: string;
  documentosExtras: ClienteDocumentoExtra[];
};

/** Resposta do detalhe: cliente + encomendas ativas e histórico */
export type ClienteDetalheApi = {
  cliente: Cliente;
  encomendasAtivas: { id: number; estado?: string; dataCriacao?: string }[];
  encomendasHistorico: { id: number; estado?: string; dataConclusao?: string; dataCriacao?: string }[];
  historicoPagina?: number;
  totalPaginasHistorico?: number;
  totalHistorico?: number;
};

/** Mapeia objeto da API (camelCase ou PascalCase) para Cliente (id sempre string). */
export function mapApiToCliente(p: Record<string, unknown>): Cliente {
  const docs = (p.documentosExtras ?? p.DocumentosExtras) as Array<Record<string, unknown>> | undefined;
  return {
    id: String(p.id ?? p.Id ?? ""),
    nome: String(p.nome ?? p.Nome ?? ""),
    tipoCliente: (p.tipoCliente ?? p.TipoCliente ?? "Particular") as TipoCliente,
    nif: p.nif != null || p.NIF != null ? String(p.nif ?? p.NIF ?? "") : undefined,
    email: p.email != null || p.Email != null ? String(p.email ?? p.Email ?? "") : undefined,
    telefone: p.telefone != null || p.Telefone != null ? String(p.telefone ?? p.Telefone ?? "") : undefined,
    morada: p.morada != null || p.Morada != null ? String(p.morada ?? p.Morada ?? "") : undefined,
    notas: p.notas != null || p.Notas != null ? String(p.notas ?? p.Notas ?? "") : undefined,
    dataRegisto: p.dataRegisto != null || p.DataRegisto != null
      ? (typeof p.dataRegisto === "string" ? p.dataRegisto : (p.DataRegisto as string) ?? new Date().toISOString())
      : new Date().toISOString(),
    documentosExtras: Array.isArray(docs)
      ? docs.map((d, i) => ({
          id: String(d.id ?? d.Id ?? `ex-${i}`),
          nome: String(d.nome ?? d.Nome ?? ""),
          caminho: d.caminho != null || d.Caminho != null ? String(d.caminho ?? d.Caminho ?? "") : undefined,
        }))
      : [],
  };
}

/** Lista clientes da API. */
export async function fetchClientes(
  token: string,
  opts?: { pesquisa?: string; ordenar?: string }
): Promise<{ items: Cliente[]; pesquisa: string; ordenar: string }> {
  const params = new URLSearchParams();
  if (opts?.pesquisa) params.set("pesquisa", opts.pesquisa);
  if (opts?.ordenar) params.set("ordenar", opts.ordenar);
  const res = await fetch(`${apiPath("api/clientes")}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
  const data = (await res.json()) as { items?: unknown[]; Items?: unknown[] };
  const raw = data.items ?? data.Items ?? [];
  return {
    items: (raw as Record<string, unknown>[]).map(mapApiToCliente),
    pesquisa: (data as { pesquisa?: string }).pesquisa ?? "",
    ordenar: (data as { ordenar?: string }).ordenar ?? "nome",
  };
}

/** Detalhe do cliente + encomendas ativas e histórico paginado. */
export async function fetchClienteDetalhe(
  token: string,
  id: string,
  historicoPagina?: number
): Promise<ClienteDetalheApi | null> {
  const numId = parseInt(id, 10);
  if (Number.isNaN(numId)) return null;
  const url =
    historicoPagina != null && historicoPagina > 1
      ? `${apiPath("api/clientes")}/${numId}?historicoPagina=${historicoPagina}`
      : `${apiPath("api/clientes")}/${numId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const clienteRaw = data.cliente ?? data.Cliente;
  if (!clienteRaw || typeof clienteRaw !== "object") return null;
  return {
    cliente: mapApiToCliente(clienteRaw as Record<string, unknown>),
    encomendasAtivas: (data.encomendasAtivas ?? data.EncomendasAtivas ?? []) as ClienteDetalheApi["encomendasAtivas"],
    encomendasHistorico: (data.encomendasHistorico ?? data.EncomendasHistorico ?? []) as ClienteDetalheApi["encomendasHistorico"],
    historicoPagina: (data.historicoPagina ?? data.HistoricoPagina) as number | undefined,
    totalPaginasHistorico: (data.totalPaginasHistorico ?? data.TotalPaginasHistorico) as number | undefined,
    totalHistorico: (data.totalHistorico ?? data.TotalHistorico) as number | undefined,
  };
}

/** Formulário de edição: item + tiposCliente. */
export async function fetchClienteEdit(
  token: string,
  id: string
): Promise<{ item: Cliente; tiposCliente: string[] } | null> {
  const numId = parseInt(id, 10);
  if (Number.isNaN(numId)) return null;
  const res = await fetch(`${apiPath("api/clientes")}/${numId}/edit`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const itemRaw = data.item ?? data.Item;
  const tipos = (data.tiposCliente ?? data.TiposCliente ?? TIPOS_CLIENTE) as string[];
  if (!itemRaw || typeof itemRaw !== "object") return null;
  return { item: mapApiToCliente(itemRaw as Record<string, unknown>), tiposCliente: tipos };
}

/** GET delete: dados do cliente para confirmação. */
export async function fetchClienteDelete(
  token: string,
  id: string
): Promise<Cliente | null> {
  const numId = parseInt(id, 10);
  if (Number.isNaN(numId)) return null;
  const res = await fetch(`${apiPath("api/clientes")}/${numId}/delete`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
  const raw = (await res.json()) as Record<string, unknown>;
  return mapApiToCliente(raw);
}

/** Cria cliente (POST). FormData com Cliente.* e DocumentosExtras[i].Nome, DocumentosExtras[i].Ficheiro. */
export async function createClienteApi(
  token: string,
  fd: FormData
): Promise<{ id: number; cliente: Cliente }> {
  const res = await fetch(apiPath("api/clientes"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 201) {
    const c = (body.cliente ?? body.Cliente) as Record<string, unknown>;
    return { id: c?.id ?? c?.Id ?? body.id ?? body.Id, cliente: mapApiToCliente(c ?? {}) };
  }
  const parsed = parseApiErrorBody(body);
  throw new Error(parsed.message);
}

/** Atualiza cliente (PUT). FormData com Cliente.*, DocumentosExtras, RemoverDocumentoExtraIds. */
export async function updateClienteApi(
  token: string,
  id: string,
  fd: FormData
): Promise<void> {
  const numId = parseInt(id, 10);
  if (Number.isNaN(numId)) throw new Error("Id inválido");
  const res = await fetch(`${apiPath("api/clientes")}/${numId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (res.status === 200) return;
  const body = await res.json().catch(() => ({}));
  const parsed = parseApiErrorBody(body);
  throw new Error(parsed.message);
}

/** Elimina cliente (DELETE). */
export async function deleteClienteApi(token: string, id: string): Promise<void> {
  const numId = parseInt(id, 10);
  if (Number.isNaN(numId)) throw new Error("Id inválido");
  const res = await fetch(`${apiPath("api/clientes")}/${numId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204 || res.status === 200) return;
  throw new Error(`Erro ${res.status}`);
}

/** URL para abrir documento extra (com token não funciona em nova janela; use fetchDocumentoUrl). */
export function documentoClienteUrl(clienteId: string, extraId: string): string {
  return `${apiPath("api/clientes")}/${clienteId}/documentos/${extraId}`;
}

/** Faz fetch do ficheiro com Authorization e devolve blob URL para abrir no browser. */
export async function fetchDocumentoClienteBlobUrl(
  token: string,
  clienteId: string,
  extraId: string
): Promise<string> {
  const url = documentoClienteUrl(clienteId, extraId);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/** Valida NIF: exatamente 9 dígitos */
export function validarNif(nif: string): boolean {
  const digits = nif.replace(/\D/g, "");
  return digits.length === 0 || digits.length === 9;
}
