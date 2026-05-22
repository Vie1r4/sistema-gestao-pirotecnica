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

export type ComparacaoAnualSemana = {
  semana: number;
  chave?: string;
  rotulo: string;
  futuro?: boolean;
  atual: number;
  anoAnterior: number;
  produtoDestaque?: string | null;
  quantidadeDestaque: number;
};

export type ZonaPico = {
  semanaInicio: number;
  semanaFim: number;
  texto: string;
};

export type FiltroOpcao = {
  id: number;
  nome: string;
};

export type ComparacaoAnualResponse = {
  ano: number;
  anoAnterior?: number;
  semanas: ComparacaoAnualSemana[];
  zonasPico: ZonaPico[];
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

function mapComparacaoAnualSemana(raw: Record<string, unknown>): ComparacaoAnualSemana {
  return {
    semana: Number(raw.semana ?? raw.Semana ?? 0),
    chave: String(raw.chave ?? raw.Chave ?? ""),
    rotulo: String(raw.rotulo ?? raw.Rotulo ?? ""),
    futuro: Boolean(raw.futuro ?? raw.Futuro ?? false),
    atual: Number(raw.atual ?? raw.Atual ?? 0),
    anoAnterior: Number(raw.anoAnterior ?? raw.AnoAnterior ?? 0),
    produtoDestaque:
      raw.produtoDestaque != null || raw.ProdutoDestaque != null
        ? String(raw.produtoDestaque ?? raw.ProdutoDestaque)
        : null,
    quantidadeDestaque: Number(raw.quantidadeDestaque ?? raw.QuantidadeDestaque ?? 0),
  };
}

function normalizeComparacaoAnual(raw: Record<string, unknown>): ComparacaoAnualResponse {
  const semanasRaw = raw.semanas ?? raw.Semanas;
  const zonasRaw = raw.zonasPico ?? raw.ZonasPico;
  return {
    ano: Number(raw.ano ?? raw.Ano ?? new Date().getFullYear()),
    anoAnterior: Number(
      raw.anoAnterior ?? raw.AnoAnterior ?? Number(raw.ano ?? raw.Ano ?? new Date().getFullYear()) - 1
    ),
    semanas: Array.isArray(semanasRaw)
      ? (semanasRaw as Record<string, unknown>[]).map(mapComparacaoAnualSemana)
      : [],
    zonasPico: Array.isArray(zonasRaw)
      ? (zonasRaw as Record<string, unknown>[]).map((z) => ({
          semanaInicio: Number(z.semanaInicio ?? z.SemanaInicio ?? 0),
          semanaFim: Number(z.semanaFim ?? z.SemanaFim ?? 0),
          texto: String(z.texto ?? z.Texto ?? ""),
        }))
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
  opts?: { periodoId?: string; produtoId?: number; clienteId?: number }
) {
  const params = new URLSearchParams();
  if (opts?.periodoId) params.set("periodoId", opts.periodoId);
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
