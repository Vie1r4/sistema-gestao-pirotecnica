/**
 * Ticks e formatação do eixo X (tempo em ms) — regras por agrupamentoAtual.
 */

import { format, parse, startOfISOWeek } from "date-fns";
import { pt } from "date-fns/locale";
import type { VolumeChartRange } from "./volumeChartSeries";

export type VolumeGran = "dia" | "semana" | "mes" | "ano";

const MESES_CURTOS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

function capitalizar(s: string): string {
  const t = s.replace(/\./g, "").trim();
  if (!t) return s;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function parseBucketDate(chave: string, gran: VolumeGran): Date | null {
  try {
    if (gran === "ano") {
      const m = /^(\d{4})$/.exec(chave);
      if (!m) return null;
      return new Date(Date.UTC(Number(m[1]), 0, 1));
    }
    if (gran === "mes") {
      const m = /^(\d{4})-(\d{2})$/.exec(chave);
      if (!m) return null;
      return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1));
    }
    if (gran === "dia") {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(chave);
      if (!m) return null;
      return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    }
    const m = /^(\d{4})-W(\d{2})$/.exec(chave);
    if (!m) return null;
    return startOfISOWeek(parse(`${m[1]}-W${m[2]}`, "RRRR-'W'II", new Date()));
  } catch {
    return null;
  }
}

export type VolumeXAxisConfig = {
  ticks: number[];
  formatTick: (ms: number) => string;
  layout: "horizontal" | "angled";
  intervaloLegivel: string;
};

function intervaloLegivel(range: VolumeChartRange): string {
  return `${format(range.start, "MMM yyyy", { locale: pt })} – ${format(
    new Date(range.endMs - 1),
    "MMM yyyy",
    { locale: pt }
  )}`;
}

function reduzirTicks(msList: number[], maxTicks: number): number[] {
  if (msList.length <= maxTicks) return msList;
  const passo = Math.ceil(msList.length / maxTicks);
  const out: number[] = [];
  for (let i = 0; i < msList.length; i++) {
    if (i % passo === 0 || i === msList.length - 1) out.push(msList[i]);
  }
  return out;
}

function criarFormatTick(
  gran: VolumeGran,
  dias: number,
  range: VolumeChartRange
): (ms: number) => string {
  const variosAnos = range.end.getUTCFullYear() > range.start.getUTCFullYear();

  switch (gran) {
    case "dia":
      return (ms) => {
        const d = new Date(ms);
        if (dias <= 7) {
          return capitalizar(format(d, "EEE d MMM", { locale: pt }));
        }
        return format(d, "d MMM", { locale: pt });
      };
    case "semana":
      return (ms) => {
        const d = new Date(ms);
        return variosAnos
          ? format(d, "d MMM yy", { locale: pt })
          : format(d, "d MMM", { locale: pt });
      };
    case "mes":
      return (ms) => {
        const d = new Date(ms);
        const abrev = MESES_CURTOS[d.getUTCMonth()] ?? format(d, "MMM", { locale: pt });
        return variosAnos ? `${abrev} ${d.getUTCFullYear()}` : abrev;
      };
    case "ano":
      return (ms) => format(new Date(ms), "yyyy", { locale: pt });
  }
}

function limiteTicks(gran: VolumeGran, dias: number, nPontos: number): number {
  if (gran === "dia" && dias <= 7) return nPontos;
  if (gran === "semana" && dias <= 90) return nPontos;
  if (gran === "semana") return Math.min(nPontos, 26);
  if (gran === "mes") return nPontos;
  return nPontos;
}

function layoutPara(gran: VolumeGran, dias: number, nTicks: number): "horizontal" | "angled" {
  if (gran === "dia" && dias <= 7) return "horizontal";
  if (gran === "semana" && dias <= 90) return "horizontal";
  if (gran === "ano") return "horizontal";
  if (gran === "mes" && dias <= 400 && nTicks <= 14) return "horizontal";
  return nTicks > 10 ? "angled" : "horizontal";
}

/** Ticks alinhados aos buckets reais do gráfico (dataKey=ms). */
export function buildVolumeXAxisConfig(
  range: VolumeChartRange,
  gran: VolumeGran,
  pontosMs: number[],
  dias: number
): VolumeXAxisConfig {
  const ordenados = [...pontosMs].sort((a, b) => a - b);
  const max = limiteTicks(gran, dias, ordenados.length);
  const ticks = reduzirTicks(ordenados, max);

  return {
    ticks,
    formatTick: criarFormatTick(gran, dias, range),
    layout: layoutPara(gran, dias, ticks.length),
    intervaloLegivel: intervaloLegivel(range),
  };
}
