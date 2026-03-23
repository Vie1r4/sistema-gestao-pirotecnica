/**
 * API Serviços: lista, create, edit, delete, detalhe, documentos, licenças, distâncias de segurança.
 */

import { apiPath } from "./apiConfig";

const API_SERVICOS = apiPath("api/servicos");

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export type ServicosListFilters = {
  clienteId?: number | string;
  dataDesde?: string;
  dataAte?: string;
};

/** GET api/servicos — lista com filtros e paginação */
export async function fetchServicos(
  token: string,
  filters: ServicosListFilters | undefined,
  pagina: number,
  itensPorPagina: number
): Promise<{
  lista: Array<Record<string, unknown>>;
  clientes: Array<{ id: number; nome: string }>;
  clienteIdFiltro: number | null;
  dataDesde: string;
  dataAte: string;
  paginaAtual: number;
  itensPorPagina: number;
  totalRegistos: number;
}> {
  const params = new URLSearchParams();
  if (filters?.clienteId != null && filters.clienteId !== "") params.set("clienteId", String(filters.clienteId));
  if (filters?.dataDesde) params.set("dataDesde", filters.dataDesde);
  if (filters?.dataAte) params.set("dataAte", filters.dataAte);
  params.set("pagina", String(pagina));
  params.set("itensPorPagina", String(itensPorPagina));
  const res = await fetch(`${API_SERVICOS}?${params}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
  return res.json();
}

/** GET api/servicos/create — dados para formulário criar (encomendas, responsáveis, equipa, tipos) */
export async function fetchServicosCreate(
  token: string,
  encomendaId?: number
): Promise<{
  encomendas: Array<{ id: number; texto: string }>;
  responsaveisTecnicos: Array<Record<string, unknown>>;
  funcionariosEquipa: Array<Record<string, unknown>>;
  tiposAcesso: string[];
  servico: { dataServico: string; encomendaId: number };
}> {
  const q = encomendaId != null ? `?encomendaId=${encomendaId}` : "";
  const res = await fetch(`${API_SERVICOS}/create${q}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
  const data = await res.json();
  return {
    encomendas: (data.encomendas ?? []).map((e: { id?: number; texto?: string; Id?: number; Texto?: string }) => ({
      id: e.id ?? e.Id ?? 0,
      texto: e.texto ?? e.Texto ?? "",
    })),
    responsaveisTecnicos: data.responsaveisTecnicos ?? data.ResponsaveisTecnicos ?? [],
    funcionariosEquipa: data.funcionariosEquipa ?? data.FuncionariosEquipa ?? [],
    tiposAcesso: data.tiposAcesso ?? data.TiposAcesso ?? ["Público", "Privado"],
    servico: data.servico ?? data.Servico ?? { dataServico: new Date().toISOString().slice(0, 10), encomendaId: 0 },
  };
}

/** POST api/servicos — criar serviço (FormData) */
export async function postServico(token: string, formData: FormData): Promise<{ servico: Record<string, unknown> }> {
  const res = await fetch(API_SERVICOS, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : `Erro ${res.status}`);
  return data;
}

/** GET api/servicos/{id} — detalhe completo (servico, resumoMaterial, itensEncomenda, distanciasSeguranca, licencasEvento, etc.) */
export async function fetchServicoById(
  token: string,
  id: number | string
): Promise<{
  servico: Record<string, unknown>;
  resumoMaterial: Record<string, unknown> | null;
  itensEncomenda: Array<Record<string, unknown>>;
  distanciasSeguranca: Array<Record<string, unknown>>;
  paiolParaRota: Record<string, unknown> | null;
  distanciaPaiolKm: number | null;
  licencasEvento: Array<Record<string, unknown>>;
  licencasObrigatoriasTotal: number;
  licencasObrigatoriasEntregues: number;
}> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
  const res = await fetch(`${API_SERVICOS}/${numId}`, { headers: authHeaders(token) });
  if (!res.ok) {
    if (res.status === 404) throw new Error("NOT_FOUND");
    throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
  }
  return res.json();
}

/** GET api/servicos/{id}/edit — dados para editar */
export async function fetchServicosEdit(
  token: string,
  id: number | string
): Promise<{
  servico: Record<string, unknown>;
  encomendas: Array<{ id: number; texto: string }>;
  responsaveisTecnicos: Array<Record<string, unknown>>;
  funcionariosEquipa: Array<Record<string, unknown>>;
  tiposAcesso: string[];
  equipaIds: number[];
}> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
  const res = await fetch(`${API_SERVICOS}/${numId}/edit`, { headers: authHeaders(token) });
  if (!res.ok) {
    if (res.status === 404) throw new Error("NOT_FOUND");
    throw new Error(`Erro ${res.status}`);
  }
  const data = await res.json();
  return {
    servico: data.servico ?? data.Servico ?? {},
    encomendas: (data.encomendas ?? []).map((e: { id?: number; texto?: string; Id?: number; Texto?: string }) => ({
      id: e.id ?? e.Id ?? 0,
      texto: e.texto ?? e.Texto ?? "",
    })),
    responsaveisTecnicos: data.responsaveisTecnicos ?? data.ResponsaveisTecnicos ?? [],
    funcionariosEquipa: data.funcionariosEquipa ?? data.FuncionariosEquipa ?? [],
    tiposAcesso: data.tiposAcesso ?? data.TiposAcesso ?? ["Público", "Privado"],
    equipaIds: data.equipaIds ?? data.EquipaIds ?? [],
  };
}

/** PUT api/servicos/{id} — atualizar serviço (FormData) */
export async function putServico(
  token: string,
  id: number | string,
  formData: FormData
): Promise<{ servico: Record<string, unknown> }> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
  const res = await fetch(`${API_SERVICOS}/${numId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : `Erro ${res.status}`);
  return data;
}

/** GET api/servicos/{id}/delete — dados para confirmação de eliminação */
export async function fetchServicosDelete(
  token: string,
  id: number | string
): Promise<Record<string, unknown>> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
  const res = await fetch(`${API_SERVICOS}/${numId}/delete`, { headers: authHeaders(token) });
  if (!res.ok) {
    if (res.status === 404) throw new Error("NOT_FOUND");
    throw new Error(`Erro ${res.status}`);
  }
  return res.json();
}

/** DELETE api/servicos/{id} */
export async function deleteServico(token: string, id: number | string): Promise<void> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
  const res = await fetch(`${API_SERVICOS}/${numId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok && res.status !== 204) throw new Error(`Erro ${res.status}`);
}

/** GET api/servicos/{id}/documentos/{extraId} — devolve ficheiro; usar fetch + blob para abrir */
export function documentoUrl(id: number | string, extraId: number | string): string {
  const n = typeof id === "string" ? id : String(id);
  const e = typeof extraId === "string" ? extraId : String(extraId);
  return `${API_SERVICOS}/${n}/documentos/${e}`;
}

/** GET api/servicos/{id}/licenca/{licencaId}/ficheiro — devolve ficheiro da licença */
export function licencaFicheiroUrl(id: number | string, licencaId: number | string): string {
  const n = typeof id === "string" ? id : String(id);
  const l = typeof licencaId === "string" ? licencaId : String(licencaId);
  return `${API_SERVICOS}/${n}/licenca/${l}/ficheiro`;
}

/** Baixar ficheiro com token e abrir em nova janela (blob URL) */
export async function downloadComToken(
  token: string,
  url: string
): Promise<void> {
  const res = await fetch(url, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
}

/** GET api/servicos/{id}/upload-licenca?tipo=0&licencaId=1 — dados para formulário licença */
export async function fetchUploadLicenca(
  token: string,
  id: number | string,
  tipo: number,
  licencaId?: number | null
): Promise<{
  servicoId: number;
  tipoLicenca: number;
  tipoNome: string;
  licenca: Record<string, unknown>;
}> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
  const params = new URLSearchParams({ tipo: String(tipo) });
  if (licencaId != null) params.set("licencaId", String(licencaId));
  const res = await fetch(`${API_SERVICOS}/${numId}/upload-licenca?${params}`, { headers: authHeaders(token) });
  if (!res.ok) {
    if (res.status === 404) throw new Error("NOT_FOUND");
    throw new Error(`Erro ${res.status}`);
  }
  const data = await res.json();
  return {
    servicoId: data.servicoId ?? data.ServicoId ?? numId,
    tipoLicenca: data.tipoLicenca ?? data.TipoLicenca ?? tipo,
    tipoNome: data.tipoNome ?? data.TipoNome ?? "",
    licenca: data.licenca ?? data.Licenca ?? {},
  };
}

/** POST api/servicos/{id}/upload-licenca — enviar dados e ficheiro da licença (FormData) */
export async function postUploadLicenca(
  token: string,
  id: number | string,
  tipo: number,
  formData: FormData,
  licencaId?: number | null
): Promise<{ licenca: Record<string, unknown> }> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
  const params = new URLSearchParams({ tipo: String(tipo) });
  if (licencaId != null) params.set("licencaId", String(licencaId));
  const res = await fetch(`${API_SERVICOS}/${numId}/upload-licenca?${params}`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : `Erro ${res.status}`);
  return data;
}

/** PUT api/servicos/{id}/distancia-seguranca/{distanciaId} — atualizar distância medida */
export async function putDistanciaSeguranca(
  token: string,
  id: number | string,
  distanciaId: number | string,
  distanciaMedida_m: number | null
): Promise<{ distancia: Record<string, unknown> }> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  const dId = typeof distanciaId === "string" ? parseInt(distanciaId, 10) : distanciaId;
  if (Number.isNaN(numId) || Number.isNaN(dId)) throw new Error("Id inválido");
  const res = await fetch(`${API_SERVICOS}/${numId}/distancia-seguranca/${dId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ DistanciaMedida_m: distanciaMedida_m }),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("NOT_FOUND");
    throw new Error(`Erro ${res.status}`);
  }
  return res.json();
}
