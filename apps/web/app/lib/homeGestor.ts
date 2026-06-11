/**
 * API Home — dashboard do Gestor/Admin (estatísticas, gráficos, alertas, atividade recente).
 * GET api/home/gestor-dashboard — apenas para roles Admin e Gestor.
 */

import type { QueryClient } from "@tanstack/react-query";
import { apiPath } from "./apiConfig";

/** Chave React Query do painel gestor — invalidar após criar/editar dados no site. */
export const gestorDashboardQueryKey = ["gestor-dashboard"] as const;

export function invalidateGestorDashboard(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: gestorDashboardQueryKey });
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export type GestorDashboardStats = {
  totalClientes: number;
  totalServicos: number;
  totalProdutos: number;
  totalPaioisAtivos: number;
  totalFuncionarios: number;
  encomendasPendentes: number;
};

export type EncomendaPorMes = { mes: string; total: number };

export type PaiolEmManutencao = { id: number; nome: string };

export type UltimaEncomendaDto = {
  id: number;
  clienteId: number;
  estado: string;
  dataCriacao: string;
  dataEntrega?: string;
  cliente?: { id: number; nome: string };
};

export type MovimentoRecenteDto = {
  tipo: "Entrada" | "Saída";
  id: number;
  data: string;
  paiolNome: string;
  produtoNome: string;
  quantidade: number;
  encomendaId?: number | null;
};

export type KpiContextoItem = {
  texto?: string;
  deltaSemana?: number;
  recebidasSemana?: number;
  novosSemana?: number;
  emManutencao?: number;
  total?: number;
};

export type GestorDashboardResponse = {
  totalClientes: number;
  totalServicos: number;
  totalProdutos: number;
  totalPaioisAtivos: number;
  totalFuncionarios: number;
  encomendasPendentes: number;
  encomendasPorEstado: Record<string, number>;
  encomendasPorMes: EncomendaPorMes[];
  paioisEmManutencao: PaiolEmManutencao[];
  ultimasEncomendas: UltimaEncomendaDto[];
  encomendasPendentesLista: UltimaEncomendaDto[];
  entradasRecentes: MovimentoRecenteDto[];
  saidasRecentes: MovimentoRecenteDto[];
  kpiContexto?: {
    encomendasPendentes?: KpiContextoItem;
    servicos?: KpiContextoItem;
    clientes?: KpiContextoItem;
    produtos?: KpiContextoItem;
    paiois?: KpiContextoItem;
    funcionarios?: KpiContextoItem;
  };
};

function readOptionalInt(...values: unknown[]): number | undefined {
  for (const v of values) {
    if (v === null || v === undefined) continue;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

function mapKpiItem(raw: unknown): KpiContextoItem | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  return {
    texto: String(o.texto ?? o.Texto ?? "") || undefined,
    deltaSemana: readOptionalInt(o.deltaSemana, o.DeltaSemana),
    recebidasSemana: readOptionalInt(o.recebidasSemana, o.RecebidasSemana),
    novosSemana: readOptionalInt(o.novosSemana, o.NovosSemana),
    emManutencao: readOptionalInt(o.emManutencao, o.EmManutencao),
    total: readOptionalInt(o.total, o.Total),
  };
}

function mapKpiContexto(raw: unknown): GestorDashboardResponse["kpiContexto"] {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const pick = (camel: string, pascal: string) => mapKpiItem(o[camel] ?? o[pascal]);
  return {
    encomendasPendentes: pick("encomendasPendentes", "EncomendasPendentes"),
    servicos: pick("servicos", "Servicos"),
    clientes: pick("clientes", "Clientes"),
    produtos: pick("produtos", "Produtos"),
    paiois: pick("paiois", "Paiois"),
    funcionarios: pick("funcionarios", "Funcionarios"),
  };
}

/** Delta vs total de há 7 dias para setas nos cartões KPI (null = sem seta, incl. quando igual). */
export function kpiTrendDelta(item?: KpiContextoItem): number | null {
  const d = item?.deltaSemana;
  if (d === undefined || d === null || Number.isNaN(d) || d === 0) return null;
  return d;
}

function mapUltimaEncomenda(item: Record<string, unknown>): UltimaEncomendaDto {
  const cliente = (item.cliente ?? item.Cliente) as { id?: number; nome?: string } | undefined;
  return {
    id: Number(item.id ?? item.Id ?? 0),
    clienteId: Number(item.clienteId ?? item.ClienteId ?? 0),
    estado: String(item.estado ?? item.Estado ?? ""),
    dataCriacao: String(item.dataCriacao ?? item.DataCriacao ?? ""),
    dataEntrega: item.dataEntrega != null ? String(item.dataEntrega) : undefined,
    cliente: cliente ? { id: cliente.id ?? 0, nome: cliente.nome ?? "" } : undefined,
  };
}

/** GET api/home/gestor-dashboard — dados completos do dashboard Gestor/Admin */
export async function getGestorDashboard(token: string): Promise<GestorDashboardResponse> {
  const res = await fetch(`${apiPath("api/home")}/gestor-dashboard`, { headers: authHeaders(token) });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
    if (res.status === 403) throw new Error("Sem permissão para ver o painel do gestor.");
    throw new Error(text || "Falha ao obter dashboard do gestor");
  }
  const raw = (await res.json()) as Record<string, unknown>;
  const ultimasEncomendasRaw = Array.isArray(raw.ultimasEncomendas) ? raw.ultimasEncomendas : [];
  return {
    totalClientes: Number(raw.totalClientes ?? 0),
    totalServicos: Number(raw.totalServicos ?? 0),
    totalProdutos: Number(raw.totalProdutos ?? 0),
    totalPaioisAtivos: Number(raw.totalPaioisAtivos ?? 0),
    totalFuncionarios: Number(raw.totalFuncionarios ?? 0),
    encomendasPendentes: Number(raw.encomendasPendentes ?? 0),
    encomendasPorEstado: (raw.encomendasPorEstado as Record<string, number>) ?? {},
    encomendasPorMes: Array.isArray(raw.encomendasPorMes) ? (raw.encomendasPorMes as EncomendaPorMes[]) : [],
    paioisEmManutencao: Array.isArray(raw.paioisEmManutencao) ? (raw.paioisEmManutencao as PaiolEmManutencao[]) : [],
    ultimasEncomendas: ultimasEncomendasRaw.map((e) => mapUltimaEncomenda(e as Record<string, unknown>)),
    encomendasPendentesLista: (Array.isArray(raw.encomendasPendentesLista) ? raw.encomendasPendentesLista : []).map((e) =>
      mapUltimaEncomenda(e as Record<string, unknown>)
    ),
    entradasRecentes: Array.isArray(raw.entradasRecentes) ? (raw.entradasRecentes as MovimentoRecenteDto[]) : [],
    saidasRecentes: Array.isArray(raw.saidasRecentes) ? (raw.saidasRecentes as MovimentoRecenteDto[]) : [],
    kpiContexto: mapKpiContexto(raw.kpiContexto ?? raw.KpiContexto),
  };
}
