/**
 * Série temporal do gráfico de volume: timeline completa do filtro + merge com API.
 * O eixo X usa timestamps (ms) para posicionamento proporcional ao tempo real.
 */

import { format, getISOWeek, getISOWeekYear } from "date-fns";
import { pt } from "date-fns/locale";
import type { VolumePeriodo } from "@/app/lib/gestorAnalytics";
import type { VolumeGran } from "./volumeChartAxis";
import { parseBucketDate } from "./volumeChartAxis";

const DAY_MS = 86_400_000;

function utcToday(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

function utcStartOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function utcStartOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function utcStartOfISOWeek(d: Date): Date {
  const day = d.getUTCDay() || 7;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - day + 1);
  return utcStartOfDay(monday);
}

function utcAddDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * DAY_MS);
}

function utcAddMonths(d: Date, months: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
}

function utcAddWeeks(d: Date, weeks: number): Date {
  return utcAddDays(d, weeks * 7);
}

export type VolumeChartPoint = VolumePeriodo & {
  total: number;
  ms: number;
  tooltipTitulo: string;
};

export type VolumeChartRange = {
  start: Date;
  end: Date;
  startMs: number;
  endMs: number;
};

function utcStartOfYear(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
}

function utcAddYears(d: Date, years: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear() + years, 0, 1));
}

function bucketChave(date: Date, gran: VolumeGran): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  if (gran === "ano") return `${y}`;
  if (gran === "mes") return `${y}-${m}`;
  if (gran === "semana") {
    return `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, "0")}`;
  }
  return `${y}-${m}-${d}`;
}

function alignToBucketStart(date: Date, gran: VolumeGran): Date {
  if (gran === "ano") return utcStartOfYear(date);
  if (gran === "mes") return utcStartOfMonth(date);
  if (gran === "semana") return utcStartOfISOWeek(date);
  return utcStartOfDay(date);
}

function advanceBucket(date: Date, gran: VolumeGran): Date {
  if (gran === "ano") return utcAddYears(date, 1);
  if (gran === "mes") return utcAddMonths(date, 1);
  if (gran === "semana") return utcAddWeeks(date, 1);
  return utcAddDays(date, 1);
}

/** Chave do mesmo bucket no ano civil anterior (dia/mês/semana ISO). */
export function chaveAnoAnterior(chave: string, gran: VolumeGran): string | null {
  if (gran === "ano") {
    const m = /^(\d{4})$/.exec(chave);
    if (!m) return null;
    return `${Number(m[1]) - 1}`;
  }
  if (gran === "mes") {
    const m = /^(\d{4})-(\d{2})$/.exec(chave);
    if (!m) return null;
    return `${Number(m[1]) - 1}-${m[2]}`;
  }
  if (gran === "dia") {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(chave);
    if (!m) return null;
    return `${Number(m[1]) - 1}-${m[2]}-${m[3]}`;
  }
  const m = /^(\d{4})-W(\d{2})$/.exec(chave);
  if (!m) return null;
  return `${Number(m[1]) - 1}-W${m[2]}`;
}

/**
 * Variação % vs o mesmo período no ano anterior.
 * Só devolve valor se o período actual e o do ano passado tiverem encomendas (&gt; 0).
 */
export function variacaoHomologaPct(
  totalAtual: number,
  chave: string,
  gran: VolumeGran,
  totaisPorChave: Map<string, number>
): number | null {
  if (totalAtual <= 0) return null;
  const chaveAnt = chaveAnoAnterior(chave, gran);
  if (!chaveAnt) return null;
  const totalAnt = totaisPorChave.get(chaveAnt);
  if (totalAnt == null || totalAnt <= 0) return null;
  return Math.round(((totalAtual - totalAnt) / totalAnt) * 1000) / 10;
}

/** Alinhado ao backend (UTC): [desde, ate[ com ate = amanhã 00:00 UTC. */
export function getVolumeChartRange(dias: number): VolumeChartRange {
  const end = utcAddDays(utcToday(), 1);
  const start = utcAddDays(end, -dias);
  return { start, end, startMs: start.getTime(), endMs: end.getTime() };
}

/** Gera todos os buckets do intervalo do filtro (inclui zeros). */
export function generateTimelineBuckets(
  dias: number,
  gran: VolumeGran
): { chave: string; ms: number; rotulo: string }[] {
  const { start, end } = getVolumeChartRange(dias);
  const variosAnos = end.getUTCFullYear() > start.getUTCFullYear();
  const buckets: { chave: string; ms: number; rotulo: string }[] = [];
  let cursor = alignToBucketStart(start, gran);

  while (cursor < end) {
    const chave = bucketChave(cursor, gran);
    const rotulo =
      gran === "ano"
        ? `${cursor.getUTCFullYear()}`
        : gran === "mes"
          ? format(new Date(cursor.getTime()), "MMM yyyy", { locale: pt })
          : gran === "semana"
            ? format(
                new Date(cursor.getTime()),
                variosAnos ? "d MMM yyyy" : "d MMM",
                { locale: pt }
              )
            : format(new Date(cursor.getTime()), "dd MMM", { locale: pt });
    buckets.push({ chave, ms: cursor.getTime(), rotulo });
    cursor = advanceBucket(cursor, gran);
  }

  return buckets;
}

function formatTooltip(date: Date, gran: VolumeGran): string {
  switch (gran) {
    case "ano":
      return `Ano ${date.getUTCFullYear()}`;
    case "dia":
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt });
    case "semana":
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: pt });
    case "mes":
      return format(date, "MMMM 'de' yyyy", { locale: pt });
  }
}

/** Junta timeline do filtro com totais da API (por chave). */
export function prepareVolumeChartData(
  apiPeriodos: VolumePeriodo[] | undefined,
  dias: number,
  gran: VolumeGran
): { points: VolumeChartPoint[]; range: VolumeChartRange } {
  const range = getVolumeChartRange(dias);
  const byChave = new Map(
    (apiPeriodos ?? []).map((p) => [p.chave, p] as const)
  );
  const totaisPorChave = new Map(
    (apiPeriodos ?? []).map((p) => [p.chave, Math.max(0, p.total)] as const)
  );
  const timeline = generateTimelineBuckets(dias, gran);

  const points: VolumeChartPoint[] = timeline.map((b) => {
    const api = byChave.get(b.chave);
    const total = Math.max(0, api?.total ?? 0);
    const date = parseBucketDate(b.chave, gran) ?? new Date(b.ms);
    return {
      chave: b.chave,
      rotulo: api?.rotulo ?? b.rotulo,
      ms: b.ms,
      total,
      variacaoPct: variacaoHomologaPct(total, b.chave, gran, totaisPorChave),
      mediaMovel30:
        api?.mediaMovel30 != null ? Math.max(0, Number(api.mediaMovel30)) : null,
      detalhes: api?.detalhes,
      tooltipTitulo: formatTooltip(date, gran),
    };
  });

  return { points, range };
}
