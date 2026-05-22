import type {
  ComparacaoAnualResponse,
  ComparacaoAnualSemana,
  ZonaPico,
} from "@/app/lib/gestorAnalytics";
import {
  buildYoYSlotDefs,
  type PeriodoYoYId,
  type YoYSlotDef,
} from "./yoYChartSlots";

export type { PeriodoYoYId } from "./yoYChartSlots";

export type PicoHistorico = {
  indice: number;
  semanaFim?: number;
  texto: string;
};

export type YoYChartRow = {
  indice: number;
  chave: string;
  rotulo: string;
  atual: number | null;
  anoAnterior: number;
  futuro: boolean;
  produtoDestaque?: string | null;
  quantidadeDestaque?: number;
};

function indexarSemanasApi(
  semanas: ComparacaoAnualSemana[] | undefined
): {
  porChave: Map<string, ComparacaoAnualSemana>;
  porIndice: Map<number, ComparacaoAnualSemana>;
} {
  const porChave = new Map<string, ComparacaoAnualSemana>();
  const porIndice = new Map<number, ComparacaoAnualSemana>();
  for (const s of semanas ?? []) {
    if (s.chave?.trim()) porChave.set(s.chave, s);
    if (s.semana > 0) porIndice.set(s.semana, s);
  }
  return { porChave, porIndice };
}

function resolverSemanaApi(
  slot: YoYSlotDef,
  porChave: Map<string, ComparacaoAnualSemana>,
  porIndice: Map<number, ComparacaoAnualSemana>
): ComparacaoAnualSemana | undefined {
  return porChave.get(slot.chave) ?? porIndice.get(slot.indice);
}

/**
 * Eixo X = slots do preset; valores fundidos da API por chave/índice.
 * Garante forma distinta em 7d vs 2a vs 3a mesmo se a API devolver outro formato.
 */
export function buildYoYChartRows(
  data: ComparacaoAnualResponse | undefined,
  periodoId: PeriodoYoYId
): YoYChartRow[] {
  const slots = buildYoYSlotDefs(periodoId);
  const { porChave, porIndice } = indexarSemanasApi(data?.semanas);

  const rows: YoYChartRow[] = [];
  const used = new Set<string>();

  for (const slot of slots) {
    if (used.has(slot.chave)) continue;
    used.add(slot.chave);
    const api = resolverSemanaApi(slot, porChave, porIndice);
    const futuro = api?.futuro ?? slot.futuro;
    rows.push({
      indice: rows.length + 1,
      chave: slot.chave,
      rotulo: slot.rotulo,
      futuro,
      atual: futuro ? null : (api?.atual ?? 0),
      anoAnterior: api?.anoAnterior ?? 0,
      produtoDestaque: api?.produtoDestaque,
      quantidadeDestaque: api?.quantidadeDestaque,
    });
  }

  return rows;
}

export function mapZonasToPicos(
  zonas: ZonaPico[] | undefined,
  indicePorSemanaIso: Map<number, number>
): PicoHistorico[] {
  return (zonas ?? [])
    .filter((z) => z.semanaInicio >= 1 && z.semanaInicio <= 52)
    .map((z) => ({
      indice: indicePorSemanaIso.get(z.semanaInicio) ?? z.semanaInicio,
      semanaFim:
        z.semanaFim !== z.semanaInicio
          ? indicePorSemanaIso.get(z.semanaFim) ?? z.semanaFim
          : undefined,
      texto: z.texto,
    }))
    .filter((p) => p.indice > 0);
}

/** Faixa entre categorias do eixo (valores = `indice` do ponto). */
export function indiceFaixaX(
  indice: number,
  indiceFim: number | undefined,
  maxIndice: number
): { x1: number; x2: number } | null {
  if (indice < 1 || indice > maxIndice) return null;
  const fim = indiceFim ?? indice;
  const x2 = fim + 1;
  if (x2 > maxIndice + 1) return null;
  return { x1: indice, x2: x2 };
}

export function intervaloLegivel(rows: YoYChartRow[]): string {
  if (rows.length === 0) return "—";
  if (rows.length === 1) return rows[0].rotulo;
  return `${rows[0].rotulo} – ${rows[rows.length - 1].rotulo}`;
}
