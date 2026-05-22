/** Dados ilustrativos (tracejados) quando o painel tem pouco histórico real. */

import { format, getISOWeek, getISOWeekYear, subDays } from "date-fns";
import { pt } from "date-fns/locale";
import {
  buildYoYSlotDefs,
  type PeriodoYoYId,
} from "@/app/components/gestor-analytics/yoYChartSlots";
import type {
  ComparacaoAnualResponse,
  ConsumoClienteResponse,
  PrevisaoResponse,
  TopClientesResponse,
  VolumePeriodo,
  VolumeResponse,
} from "./gestorAnalytics";

export const DEMO_STORAGE_KEY = "gestor-painel-modo-demo";

export function isDemoModeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_STORAGE_KEY) === "1";
}

export function setDemoModeEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_STORAGE_KEY, on ? "1" : "0");
}

type GranDemo = "dia" | "semana" | "mes" | "ano";

function utcToday(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

function chaveBucket(d: Date, gran: GranDemo): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  if (gran === "ano") return `${y}`;
  if (gran === "mes") return `${y}-${m}`;
  if (gran === "semana") {
    return `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, "0")}`;
  }
  return `${y}-${m}-${day}`;
}

function rotuloBucket(d: Date, gran: GranDemo): string {
  if (gran === "ano") return String(d.getUTCFullYear());
  if (gran === "mes") {
    const s = format(d, "MMM", { locale: pt });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  if (gran === "semana") {
    const s = format(d, "d MMM", { locale: pt });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  const s = format(d, "EEE d MMM", { locale: pt });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Gera série de volume alinhada ao agrupamento e janela do filtro activo. */
export function buildDemoVolume(
  gran: GranDemo,
  dias: number
): VolumeResponse {
  const hoje = utcToday();
  const periodos: VolumePeriodo[] = [];
  const seen = new Set<string>();

  const push = (d: Date, i: number) => {
    const chave = chaveBucket(d, gran);
    if (seen.has(chave)) return;
    seen.add(chave);
    const total = 3 + (i % 5) + (i % 11 === 0 ? 4 : 0);
    const prev = i > 0 ? 3 + ((i - 1) % 5) : total;
    periodos.push({
      chave,
      rotulo: rotuloBucket(d, gran),
      total,
      variacaoPct: prev > 0 ? Math.round(((total - prev) / prev) * 100) : null,
      mediaMovel30: gran === "dia" ? 3.2 : null,
    });
  };

  if (gran === "dia") {
    for (let i = dias - 1; i >= 0; i--) {
      push(subDays(hoje, i), periodos.length);
    }
  } else if (gran === "semana") {
    let cursor = subDays(hoje, dias - 1);
    while (cursor <= hoje) {
      push(cursor, periodos.length);
      cursor = new Date(cursor.getTime() + 7 * 86_400_000);
    }
  } else if (gran === "mes") {
    const meses = Math.max(1, Math.ceil(dias / 30));
    for (let m = meses - 1; m >= 0; m--) {
      const d = new Date(
        Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - m, 1)
      );
      push(d, periodos.length);
    }
  } else {
    const anos = Math.max(1, Math.ceil(dias / 365));
    for (let a = anos - 1; a >= 0; a--) {
      const d = new Date(Date.UTC(hoje.getUTCFullYear() - a, 0, 1));
      push(d, periodos.length);
    }
  }

  return { granularidade: gran, periodos };
}

const DEMO_CONSUMO_MATERIAIS = [
  { id: 1, nome: "Produto A" },
  { id: 2, nome: "Produto Festivo" },
  { id: 3, nome: "Produto B" },
];

const DEMO_CONSUMO_CLIENTES = [
  { id: 1, nome: "Empresa Alpha" },
  { id: 2, nome: "Beta Comércio" },
];

function parseIsoDateOnly(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function dentroDoIntervalo(dataIso: string, desde: string, ate: string): boolean {
  const t = new Date(dataIso).getTime();
  const ini = parseIsoDateOnly(desde);
  const fim = parseIsoDateOnly(ate) + 86_400_000 - 1;
  return t >= ini && t <= fim;
}

export function buildDemoConsumoCliente(
  clienteId: number,
  desde: string,
  ate: string,
  produtoId?: number
): ConsumoClienteResponse {
  const clienteNome =
    DEMO_CONSUMO_CLIENTES.find((c) => c.id === clienteId)?.nome ?? "Cliente demo";
  const base = [
    {
      encomendaId: 201,
      produtoId: 1,
      produtoNome: "Produto A",
      quantidade: 120,
      estado: "Concluída",
      dataCriacao: "2025-04-16T10:30:00.000Z",
    },
    {
      encomendaId: 201,
      produtoId: 3,
      produtoNome: "Produto B",
      quantidade: 40,
      estado: "Concluída",
      dataCriacao: "2025-04-16T10:30:00.000Z",
    },
    {
      encomendaId: 188,
      produtoId: 2,
      produtoNome: "Produto Festivo",
      quantidade: 85,
      estado: "Concluída",
      dataCriacao: "2025-04-19T14:00:00.000Z",
    },
    {
      encomendaId: 175,
      produtoId: 1,
      produtoNome: "Produto A",
      quantidade: 60,
      estado: "Em preparação",
      dataCriacao: "2026-05-18T09:00:00.000Z",
    },
    {
      encomendaId: 160,
      produtoId: 1,
      produtoNome: "Produto A",
      quantidade: 30,
      estado: "Concluída",
      dataCriacao: "2025-03-10T11:00:00.000Z",
    },
  ];

  const linhas = base.filter(
    (r) =>
      dentroDoIntervalo(r.dataCriacao, desde, ate) &&
      (!produtoId || r.produtoId === produtoId)
  );

  const totalQuantidade = linhas.reduce((s, l) => s + l.quantidade, 0);

  return {
    clienteId,
    clienteNome,
    desde,
    ate,
    produtoIdFiltro: produtoId ?? null,
    totalQuantidade,
    totalLinhas: linhas.length,
    totalEncomendas: new Set(linhas.map((l) => l.encomendaId)).size,
    linhas,
    materiais: DEMO_CONSUMO_MATERIAIS,
    clientes: DEMO_CONSUMO_CLIENTES,
  };
}

export const demoPrevisao: PrevisaoResponse = {
  dias: 30,
  crescimentoPct: 5,
  historico: Array.from({ length: 14 }, (_, i) => ({
    data: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
    valor: 3 + (i % 5),
    min: 1,
    max: 6,
  })),
  previsao: Array.from({ length: 14 }, (_, i) => ({
    data: new Date(Date.now() + (i + 1) * 86400000).toISOString().slice(0, 10),
    valor: 4 + (i % 4),
    min: 2,
    max: 8,
  })),
  totalPrevisto14Dias: 42,
  resumoDestaque: "Tendência estável com ligeiro aumento",
};

const DEMO_MATERIAIS = [
  { id: 1, nome: "Produto A" },
  { id: 2, nome: "Produto Festivo" },
];

const DEMO_CLIENTES = [
  { id: 1, nome: "Empresa Alpha" },
  { id: 2, nome: "Beta Comércio" },
];

const DEMO_ZONAS: ComparacaoAnualResponse["zonasPico"] = [
  { semanaInicio: 45, semanaFim: 45, texto: "Semana 45 (2025): pico — prepara stock" },
  { semanaInicio: 12, semanaFim: 12, texto: "Semana 12 (2025): ~120 un. Produto A" },
];

/** Dados YoY de exemplo distintos por preset (7d, 30d, …, 3a). */
export function buildDemoComparacaoAnual(
  periodoId: PeriodoYoYId,
  opts?: { produtoId?: number; clienteId?: number }
): ComparacaoAnualResponse {
  const ano = new Date().getFullYear();
  const slots = buildYoYSlotDefs(periodoId);
  const factor =
    opts?.produtoId === 2 ? 0.45 : opts?.clienteId === 2 ? 0.55 : 1;

  const semanas = slots.map((slot, i) => {
    const baseAtual = slot.futuro ? 0 : 2 + (i % 5) + (i % 9 === 0 ? 3 : 0);
    const baseAnt = 3 + (i % 6) + (i % 11 === 0 ? 5 : 0);
    return {
      semana: slot.indice,
      chave: slot.chave,
      rotulo: slot.rotulo,
      futuro: slot.futuro,
      atual: Math.round(baseAtual * factor),
      anoAnterior: Math.round(baseAnt * factor),
      produtoDestaque: i % 11 === 0 ? "Produto Festivo" : "Produto A",
      quantidadeDestaque: i % 11 === 0 ? 340 : 120,
    };
  });

  const mostraPicos = periodoId === "365" || periodoId === "730" || periodoId === "1095";

  return {
    ano,
    anoAnterior: ano - 1,
    semanas,
    zonasPico: mostraPicos
      ? opts?.produtoId === 2
        ? DEMO_ZONAS.filter((z) => z.texto.includes("Festivo"))
        : DEMO_ZONAS
      : [],
    materiais: DEMO_MATERIAIS,
    clientes: DEMO_CLIENTES,
    produtoIdFiltro: opts?.produtoId ?? null,
    clienteIdFiltro: opts?.clienteId ?? null,
  };
}

/** Resposta demo por defeito (12 meses) — compatibilidade. */
export const demoYoY: ComparacaoAnualResponse = buildDemoComparacaoAnual("365");

export const demoTopClientes: TopClientesResponse = {
  porEncomendas: [
    { clienteId: 1, nome: "Empresa Alpha", valor: 24, totalEncomendas: 24, totalServicos: 8, ultimaEncomenda: "2026-05-18", tendencia: "subida", risco: false },
    { clienteId: 2, nome: "Beta Comércio", valor: 15, totalEncomendas: 15, totalServicos: 12, ultimaEncomenda: "2026-05-10", tendencia: "descida", risco: true },
  ],
  porServicos: [
    { clienteId: 2, nome: "Beta Comércio", valor: 12, totalEncomendas: 15, totalServicos: 12, ultimaEncomenda: "2026-05-10", tendencia: "estavel", risco: false },
    { clienteId: 1, nome: "Empresa Alpha", valor: 8, totalEncomendas: 24, totalServicos: 8, ultimaEncomenda: "2026-05-18", tendencia: "subida", risco: false },
  ],
};

