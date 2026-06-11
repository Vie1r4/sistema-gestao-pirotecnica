/**
 * API Gestor Analytics — painel do gestor (volume, YoY, consumo por cliente, top clientes).
 */

import type { QueryClient } from "@tanstack/react-query";
import { apiPath } from "./apiConfig";

/** Invalidar após criar/editar clientes, produtos ou encomendas. */
export const gestorAnalyticsQueryKey = ["gestor-analytics"] as const;

export function invalidateGestorAnalytics(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: gestorAnalyticsQueryKey });
}

const BASE = () => `${apiPath("api/gestor-analytics")}`;

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

async function getJson<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${BASE()}${path}`, { headers: authHeaders(token) });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
    if (res.status === 403) throw new Error("Sem permissão para ver analytics.");
    throw new Error(text || "Falha ao obter dados de analytics");
  }
  return res.json() as Promise<T>;
}

export type VolumeEncomendaDetalhe = {
  encomendaId: number;
  clienteNome: string;
  produtoPrincipal: string;
  dataCriacao: string;
};

export type VolumePeriodo = {
  rotulo: string;
  chave: string;
  total: number;
  variacaoPct?: number | null;
  mediaMovel30?: number | null;
  detalhes?: VolumeEncomendaDetalhe[];
};

export type VolumeResponse = {
  granularidade: string;
  periodos: VolumePeriodo[];
};

export type ComparacaoAnualPonto = {
  mes: number;
  rotulo: string;
  total: number | null;
  futuro: boolean;
  encomendas: VolumeEncomendaDetalhe[];
};

export type ComparacaoAnualSerie = {
  ano: number;
  pontos: ComparacaoAnualPonto[];
};

export type FiltroOpcao = {
  id: number;
  nome: string;
};

export type ComparacaoAnualResponse = {
  anoAtual: number;
  anosDisponiveis: number[];
  series: ComparacaoAnualSerie[];
  materiais: FiltroOpcao[];
  clientes: FiltroOpcao[];
  produtoIdFiltro?: number | null;
  clienteIdFiltro?: number | null;
};

export type ConsumoClienteLinha = {
  encomendaId: number;
  dataCriacao: string;
  estado: string;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
};

export type ConsumoClienteResponse = {
  clienteId: number;
  clienteNome: string;
  desde: string;
  ate: string;
  produtoIdFiltro?: number | null;
  totalQuantidade: number;
  totalLinhas: number;
  totalEncomendas: number;
  linhas: ConsumoClienteLinha[];
  materiais: FiltroOpcao[];
  clientes: FiltroOpcao[];
};

export type PrevisaoPonto = {
  data: string;
  valor: number;
  min: number;
  max: number;
};

export type PrevisaoResponse = {
  dias: number;
  crescimentoPct: number;
  historico: PrevisaoPonto[];
  previsao: PrevisaoPonto[];
  totalPrevisto14Dias?: number;
  resumoDestaque?: string;
};

export type TopClienteLinha = {
  clienteId: number;
  nome: string;
  valor: number;
  totalEncomendas: number;
  totalServicos: number;
  ultimaEncomenda?: string | null;
  tendencia: string;
  risco: boolean;
};

export type TopClientesResponse = {
  porEncomendas: TopClienteLinha[];
  porServicos: TopClienteLinha[];
};

export function fetchVolume(
  token: string,
  granularidade: "dia" | "semana" | "mes" | "ano",
  dias = 90
) {
  return getJson<VolumeResponse>(token, `/volume?granularidade=${granularidade}&dias=${dias}`);
}

function mapFiltroOpcoes(raw: unknown): FiltroOpcao[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const o = item as Record<string, unknown>;
      const id = Number(o.id ?? o.Id);
      const nome = String(o.nome ?? o.Nome ?? "").trim();
      if (!id || !nome) return null;
      return { id, nome };
    })
    .filter((x): x is FiltroOpcao => x != null);
}

function mapVolumeEncomendaDetalhe(raw: Record<string, unknown>): VolumeEncomendaDetalhe {
  return {
    encomendaId: Number(raw.encomendaId ?? raw.EncomendaId ?? 0),
    clienteNome: String(raw.clienteNome ?? raw.ClienteNome ?? ""),
    produtoPrincipal: String(raw.produtoPrincipal ?? raw.ProdutoPrincipal ?? ""),
    dataCriacao: String(raw.dataCriacao ?? raw.DataCriacao ?? ""),
  };
}

function mapComparacaoAnualPonto(raw: Record<string, unknown>): ComparacaoAnualPonto {
  const encRaw = raw.encomendas ?? raw.Encomendas;
  const totalRaw = raw.total ?? raw.Total;
  const futuro = Boolean(raw.futuro ?? raw.Futuro ?? false);
  return {
    mes: Number(raw.mes ?? raw.Mes ?? 0),
    rotulo: String(raw.rotulo ?? raw.Rotulo ?? ""),
    futuro,
    total:
      totalRaw == null || futuro
        ? null
        : Number(totalRaw),
    encomendas: Array.isArray(encRaw)
      ? (encRaw as Record<string, unknown>[]).map(mapVolumeEncomendaDetalhe)
      : [],
  };
}

function mapComparacaoAnualSerie(raw: Record<string, unknown>): ComparacaoAnualSerie {
  const pontosRaw = raw.pontos ?? raw.Pontos;
  return {
    ano: Number(raw.ano ?? raw.Ano ?? 0),
    pontos: Array.isArray(pontosRaw)
      ? (pontosRaw as Record<string, unknown>[]).map(mapComparacaoAnualPonto)
      : [],
  };
}

function normalizeComparacaoAnual(raw: Record<string, unknown>): ComparacaoAnualResponse {
  const seriesRaw = raw.series ?? raw.Series;
  const anosRaw = raw.anosDisponiveis ?? raw.AnosDisponiveis;
  return {
    anoAtual: Number(raw.anoAtual ?? raw.AnoAtual ?? new Date().getFullYear()),
    anosDisponiveis: Array.isArray(anosRaw)
      ? (anosRaw as unknown[]).map((a) => Number(a)).filter((n) => !Number.isNaN(n))
      : [],
    series: Array.isArray(seriesRaw)
      ? (seriesRaw as Record<string, unknown>[]).map(mapComparacaoAnualSerie)
      : [],
    materiais: mapFiltroOpcoes(raw.materiais ?? raw.Materiais),
    clientes: mapFiltroOpcoes(raw.clientes ?? raw.Clientes),
    produtoIdFiltro:
      raw.produtoIdFiltro != null || raw.ProdutoIdFiltro != null
        ? Number(raw.produtoIdFiltro ?? raw.ProdutoIdFiltro)
        : null,
    clienteIdFiltro:
      raw.clienteIdFiltro != null || raw.ClienteIdFiltro != null
        ? Number(raw.clienteIdFiltro ?? raw.ClienteIdFiltro)
        : null,
  };
}

export function fetchComparacaoAnual(
  token: string,
  opts?: { produtoId?: number; clienteId?: number }
) {
  const params = new URLSearchParams();
  if (opts?.produtoId != null) params.set("produtoId", String(opts.produtoId));
  if (opts?.clienteId != null) params.set("clienteId", String(opts.clienteId));
  const q = params.toString() ? `?${params}` : "";
  return getJson<Record<string, unknown>>(token, `/comparacao-anual${q}`).then(
    normalizeComparacaoAnual
  );
}

function mapConsumoClienteLinha(raw: Record<string, unknown>): ConsumoClienteLinha {
  return {
    encomendaId: Number(raw.encomendaId ?? raw.EncomendaId ?? 0),
    dataCriacao: String(raw.dataCriacao ?? raw.DataCriacao ?? ""),
    estado: String(raw.estado ?? raw.Estado ?? ""),
    produtoId: Number(raw.produtoId ?? raw.ProdutoId ?? 0),
    produtoNome: String(raw.produtoNome ?? raw.ProdutoNome ?? ""),
    quantidade: Number(raw.quantidade ?? raw.Quantidade ?? 0),
  };
}

function normalizeConsumoCliente(raw: Record<string, unknown>): ConsumoClienteResponse {
  const linhasRaw = raw.linhas ?? raw.Linhas;
  return {
    clienteId: Number(raw.clienteId ?? raw.ClienteId ?? 0),
    clienteNome: String(raw.clienteNome ?? raw.ClienteNome ?? ""),
    desde: String(raw.desde ?? raw.Desde ?? ""),
    ate: String(raw.ate ?? raw.Ate ?? ""),
    produtoIdFiltro:
      raw.produtoIdFiltro != null || raw.ProdutoIdFiltro != null
        ? Number(raw.produtoIdFiltro ?? raw.ProdutoIdFiltro)
        : null,
    totalQuantidade: Number(raw.totalQuantidade ?? raw.TotalQuantidade ?? 0),
    totalLinhas: Number(raw.totalLinhas ?? raw.TotalLinhas ?? 0),
    totalEncomendas: Number(raw.totalEncomendas ?? raw.TotalEncomendas ?? 0),
    linhas: Array.isArray(linhasRaw)
      ? (linhasRaw as Record<string, unknown>[]).map(mapConsumoClienteLinha)
      : [],
    materiais: mapFiltroOpcoes(raw.materiais ?? raw.Materiais),
    clientes: mapFiltroOpcoes(raw.clientes ?? raw.Clientes),
  };
}

export function fetchConsumoCliente(
  token: string,
  opts: { clienteId: number; desde: string; ate: string; produtoId?: number }
) {
  const params = new URLSearchParams();
  params.set("clienteId", String(opts.clienteId));
  params.set("desde", opts.desde);
  params.set("ate", opts.ate);
  if (opts.produtoId != null) params.set("produtoId", String(opts.produtoId));
  return getJson<Record<string, unknown>>(token, `/consumo-cliente?${params}`).then(
    normalizeConsumoCliente
  );
}

export function fetchPrevisao(token: string, dias: 30 | 60 | 90, crescimentoPct: number) {
  return getJson<PrevisaoResponse>(token, `/previsao?dias=${dias}&crescimentoPct=${crescimentoPct}`);
}

export function fetchTopClientes(token: string, limite = 10) {
  return getJson<TopClientesResponse>(token, `/top-clientes?limite=${limite}`);
}
