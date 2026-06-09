/**
 * API Serviços: lista, create, edit, delete, detalhe, documentos, licenças, distâncias de segurança.
 */

import { apiPath } from "./apiConfig";

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export type ServicosListFilters = {
  clienteId?: number | string;
  dataDesde?: string;
  dataAte?: string;
};

export type ServicoZonaLinhaInput = {
  id?: number;
  data: string;
  horaInicio?: string;
  horaFim?: string;
  produtoId: number;
  quantidade: number;
};

export type ServicoZonaLancamentoInput = {
  id?: number;
  designacao?: string;
  coordenadasLat: number;
  coordenadasLng: number;
  raioPublico?: number;
  responsavelPirotecnicoId?: number;
  observacoes?: string;
  linhas: ServicoZonaLinhaInput[];
};

export type ServicoSaveRequest = {
  id?: number;
  encomendaId: number;
  nomeEvento?: string;
  dataServico: string;
  local?: string;
  moradaCompleta?: string;
  distrito?: string;
  cidade?: string;
  municipio?: string;
  publicoPrivado?: string;
  coordenadorPirotecnicoId?: number;
  observacoes?: string;
  equipaIds?: number[];
  zonas: ServicoZonaLancamentoInput[];
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
  const res = await fetch(`${apiPath("api/servicos")}?${params}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
  return res.json();
}

/** GET api/servicos/create — dados para formulário criar (encomendas, funcionários, tipos) */
export async function fetchServicosCreate(
  token: string,
  encomendaId?: number
): Promise<{
  encomendas: Array<{ id: number; texto: string }>;
  funcionarios: Array<Record<string, unknown>>;
  tiposAcesso: string[];
  itensEncomenda: Array<Record<string, unknown>>;
  servico: { dataServico: string; encomendaId: number; nomeEventoSugerido?: string | null };
}> {
  const q = encomendaId != null ? `?encomendaId=${encomendaId}` : "";
  const res = await fetch(`${apiPath("api/servicos")}/create${q}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
  const data = await res.json();
  const funcionarios =
    data.funcionarios ??
    data.Funcionarios ??
    data.responsaveisTecnicos ??
    data.ResponsaveisTecnicos ??
    data.funcionariosEquipa ??
    data.FuncionariosEquipa ??
    [];
  return {
    encomendas: (data.encomendas ?? []).map((e: { id?: number; texto?: string; Id?: number; Texto?: string }) => ({
      id: e.id ?? e.Id ?? 0,
      texto: e.texto ?? e.Texto ?? "",
    })),
    funcionarios,
    tiposAcesso: data.tiposAcesso ?? data.TiposAcesso ?? ["Público", "Privado"],
    itensEncomenda: data.itensEncomenda ?? data.ItensEncomenda ?? [],
    servico: (() => {
      const raw = data.servico ?? data.Servico ?? {};
      const s = raw as Record<string, unknown>;
      return {
        dataServico: String(s.dataServico ?? s.DataServico ?? new Date().toISOString().slice(0, 10)).slice(0, 10),
        encomendaId: Number(s.encomendaId ?? s.EncomendaId ?? 0),
        nomeEventoSugerido: (s.nomeEventoSugerido ?? s.NomeEventoSugerido) as string | null | undefined,
      };
    })(),
  };
}

function jsonHeaders(token: string): HeadersInit {
  return { "Content-Type": "application/json", ...authHeaders(token) };
}

function extractApiError(data: Record<string, unknown>, status: number): string {
  const err = data.error ?? data.Error;
  if (typeof err === "string" && err.trim()) return err;

  const title = data.title ?? data.Title;
  const errors = (data.errors ?? data.Errors) as Record<string, string[]> | undefined;
  if (errors && typeof errors === "object") {
    for (const msgs of Object.values(errors)) {
      const first = Array.isArray(msgs) ? msgs.find((m) => typeof m === "string" && m.trim()) : undefined;
      if (first) return first;
    }
  }

  if (typeof title === "string" && title.trim()) return title;
  return `Erro ${status}`;
}

/** POST api/servicos — criar serviço (JSON com zonas de lançamento) */
export async function postServico(token: string, body: ServicoSaveRequest): Promise<{ servico: Record<string, unknown> }> {
  const res = await fetch(apiPath("api/servicos"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(extractApiError(data, res.status));
  return data as { servico: Record<string, unknown> };
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
  const res = await fetch(`${apiPath("api/servicos")}/${numId}`, { headers: authHeaders(token) });
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
  funcionarios: Array<Record<string, unknown>>;
  tiposAcesso: string[];
  equipaIds: number[];
  itensEncomenda: Array<Record<string, unknown>>;
}> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
  const res = await fetch(`${apiPath("api/servicos")}/${numId}/edit`, { headers: authHeaders(token) });
  if (!res.ok) {
    if (res.status === 404) throw new Error("NOT_FOUND");
    throw new Error(`Erro ${res.status}`);
  }
  const data = await res.json();
  const funcionarios =
    data.funcionarios ??
    data.Funcionarios ??
    data.responsaveisTecnicos ??
    data.ResponsaveisTecnicos ??
    data.funcionariosEquipa ??
    data.FuncionariosEquipa ??
    [];
  return {
    servico: data.servico ?? data.Servico ?? {},
    encomendas: (data.encomendas ?? []).map((e: { id?: number; texto?: string; Id?: number; Texto?: string }) => ({
      id: e.id ?? e.Id ?? 0,
      texto: e.texto ?? e.Texto ?? "",
    })),
    funcionarios,
    tiposAcesso: data.tiposAcesso ?? data.TiposAcesso ?? ["Público", "Privado"],
    equipaIds: data.equipaIds ?? data.EquipaIds ?? [],
    itensEncomenda: data.itensEncomenda ?? data.ItensEncomenda ?? [],
  };
}

/** PUT api/servicos/{id} — atualizar serviço (JSON com zonas) */
export async function putServico(
  token: string,
  id: number | string,
  body: ServicoSaveRequest
): Promise<{ servico: Record<string, unknown> }> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
  const res = await fetch(`${apiPath("api/servicos")}/${numId}`, {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify({ ...body, id: numId }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(extractApiError(data, res.status));
  return data as { servico: Record<string, unknown> };
}

/** POST api/servicos/{id}/documentos-extras — anexar documento */
export async function postDocumentoExtra(
  token: string,
  id: number | string,
  nome: string,
  ficheiro: File
): Promise<{ servico: Record<string, unknown> }> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  const fd = new FormData();
  fd.append("nome", nome);
  fd.append("ficheiro", ficheiro);
  const res = await fetch(`${apiPath("api/servicos")}/${numId}/documentos-extras`, {
    method: "POST",
    headers: authHeaders(token),
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : `Erro ${res.status}`);
  return data;
}

/** DELETE api/servicos/{id}/documentos-extras/{extraId} */
export async function deleteDocumentoExtra(token: string, id: number | string, extraId: number | string): Promise<void> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  const eId = typeof extraId === "string" ? parseInt(extraId, 10) : extraId;
  const res = await fetch(`${apiPath("api/servicos")}/${numId}/documentos-extras/${eId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(typeof data.error === "string" ? data.error : `Erro ${res.status}`);
  }
}

/** Uma zona com todo o material da encomenda (compatibilidade formulário simples). */
export function buildZonaUnicaFromItens(
  itens: Array<{ produtoId?: number; ProdutoId?: number; quantidadePedida?: number; QuantidadePedida?: number }>,
  opts: {
    dataServico: string;
    designacao?: string;
    coordenadasLat: number;
    coordenadasLng: number;
    raioPublico?: number;
    responsavelPirotecnicoId?: number;
  }
): ServicoZonaLancamentoInput {
  const linhas = itens
    .map((i) => {
      const produtoId = i.produtoId ?? i.ProdutoId ?? 0;
      const q = i.quantidadePedida ?? i.QuantidadePedida ?? 0;
      if (!produtoId || q <= 0) return null;
      return {
        data: opts.dataServico,
        produtoId,
        quantidade: Number(q),
      };
    })
    .filter((l): l is ServicoZonaLinhaInput => l != null);
  return {
    designacao: opts.designacao ?? "Zona principal",
    coordenadasLat: opts.coordenadasLat,
    coordenadasLng: opts.coordenadasLng,
    raioPublico: opts.raioPublico,
    responsavelPirotecnicoId: opts.responsavelPirotecnicoId,
    linhas,
  };
}

/** GET api/servicos/{id}/delete — dados para confirmação de eliminação */
export async function fetchServicosDelete(
  token: string,
  id: number | string
): Promise<Record<string, unknown>> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
  const res = await fetch(`${apiPath("api/servicos")}/${numId}/delete`, { headers: authHeaders(token) });
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
  const res = await fetch(`${apiPath("api/servicos")}/${numId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok && res.status !== 204) throw new Error(`Erro ${res.status}`);
}

/** GET api/servicos/{id}/documentos/{extraId} — devolve ficheiro; usar fetch + blob para abrir */
export function documentoUrl(id: number | string, extraId: number | string): string {
  const n = typeof id === "string" ? id : String(id);
  const e = typeof extraId === "string" ? extraId : String(extraId);
  return `${apiPath("api/servicos")}/${n}/documentos/${e}`;
}

/** GET api/servicos/{id}/licenca/{licencaId}/ficheiro — devolve ficheiro da licença */
export function licencaFicheiroUrl(id: number | string, licencaId: number | string): string {
  const n = typeof id === "string" ? id : String(id);
  const l = typeof licencaId === "string" ? licencaId : String(licencaId);
  return `${apiPath("api/servicos")}/${n}/licenca/${l}/ficheiro`;
}

/** Transfere ficheiro com token (descarrega para o disco). */
export async function downloadComToken(
  token: string,
  url: string,
  options?: { fileName?: string; mimeType?: string }
): Promise<void> {
  const res = await fetch(url, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Erro ${res.status}`);

  let fileName = options?.fileName;
  const disposition = res.headers.get("Content-Disposition");
  if (!fileName && disposition) {
    const utf8 = /filename\*=UTF-8''([^;\s]+)/i.exec(disposition);
    const quoted = /filename="([^"]+)"/i.exec(disposition);
    if (utf8?.[1]) fileName = decodeURIComponent(utf8[1]);
    else if (quoted?.[1]) fileName = quoted[1];
  }
  fileName ??= "documento";

  const mime =
    options?.mimeType ??
    res.headers.get("Content-Type")?.split(";")[0]?.trim() ??
    "application/octet-stream";
  const blob = new Blob([await res.arrayBuffer()], { type: mime });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

/** Abre ficheiro com token numa nova janela (visualização no browser). */
export async function abrirFicheiroComToken(
  token: string,
  url: string,
  targetWindow?: Window | null,
  options?: { mimeType?: string }
): Promise<void> {
  const res = await fetch(url, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Erro ${res.status}`);

  const mime =
    options?.mimeType ??
    res.headers.get("Content-Type")?.split(";")[0]?.trim() ??
    "application/octet-stream";
  const blob = new Blob([await res.arrayBuffer()], { type: mime });
  const blobUrl = URL.createObjectURL(blob);

  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = blobUrl;
  } else {
    const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");
    if (!opened) window.location.assign(blobUrl);
  }

  setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000);
}

/** GET api/servicos/{id}/upload-licenca?tipo=0&licencaId=1&origem=0|1 — dados para formulário licença */
export async function fetchUploadLicenca(
  token: string,
  id: number | string,
  tipo: number,
  licencaId?: number | null,
  origem?: 0 | 1
): Promise<{
  servicoId: number;
  tipoLicenca: number;
  tipoNome: string;
  origemRegisto?: number;
  licenca: Record<string, unknown>;
}> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
  const params = new URLSearchParams({ tipo: String(tipo) });
  if (licencaId != null) params.set("licencaId", String(licencaId));
  if (origem !== undefined) params.set("origem", String(origem));
  const res = await fetch(`${apiPath("api/servicos")}/${numId}/upload-licenca?${params}`, { headers: authHeaders(token) });
  if (!res.ok) {
    if (res.status === 404) throw new Error("NOT_FOUND");
    throw new Error(`Erro ${res.status}`);
  }
  const data = await res.json();
  return {
    servicoId: data.servicoId ?? data.ServicoId ?? numId,
    tipoLicenca: data.tipoLicenca ?? data.TipoLicenca ?? tipo,
    tipoNome: data.tipoNome ?? data.TipoNome ?? "",
    origemRegisto: data.origemRegisto ?? data.OrigemRegisto,
    licenca: data.licenca ?? data.Licenca ?? {},
  };
}

/** POST api/servicos/{id}/licenca/gerar — gera declaração PSP (Admin/Gestor) */
export async function postGerarDeclaracaoPsp(
  token: string,
  id: number | string
): Promise<{ licencaId: number; nomeFicheiro: string; servico?: Record<string, unknown> }> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  const res = await fetch(`${apiPath("api/servicos")}/${numId}/licenca/gerar`, {
    method: "POST",
    headers: authHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 404) throw new Error("NOT_FOUND");
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : `Erro ${res.status}`);
  return {
    licencaId: data.licencaId ?? data.LicencaId,
    nomeFicheiro: data.nomeFicheiro ?? data.NomeFicheiro ?? "declaracao_psp.pdf",
    servico: data.servico ?? data.Servico,
  };
}

/** POST api/servicos/{id}/upload-licenca — enviar dados e ficheiro da licença (FormData) */
export async function postUploadLicenca(
  token: string,
  id: number | string,
  tipo: number,
  formData: FormData,
  licencaId?: number | null,
  origem?: 0 | 1
): Promise<{ licenca: Record<string, unknown> }> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
  const params = new URLSearchParams({ tipo: String(tipo) });
  if (licencaId != null) params.set("licencaId", String(licencaId));
  if (origem !== undefined) params.set("origem", String(origem));
  const res = await fetch(`${apiPath("api/servicos")}/${numId}/upload-licenca?${params}`, {
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
  const res = await fetch(`${apiPath("api/servicos")}/${numId}/distancia-seguranca/${dId}`, {
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
