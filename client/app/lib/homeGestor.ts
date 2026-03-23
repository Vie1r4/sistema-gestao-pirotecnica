/**
 * API Home — dashboard do Gestor/Admin (estatísticas, gráficos, alertas, atividade recente).
 * GET api/home/gestor-dashboard — apenas para roles Admin e Gestor.
 */

import { apiPath } from "./apiConfig";

const API_HOME = apiPath("api/home");

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
  entradasRecentes: MovimentoRecenteDto[];
  saidasRecentes: MovimentoRecenteDto[];
};

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
  const res = await fetch(`${API_HOME}/gestor-dashboard`, { headers: authHeaders(token) });
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
    entradasRecentes: Array.isArray(raw.entradasRecentes) ? (raw.entradasRecentes as MovimentoRecenteDto[]) : [],
    saidasRecentes: Array.isArray(raw.saidasRecentes) ? (raw.saidasRecentes as MovimentoRecenteDto[]) : [],
  };
}
