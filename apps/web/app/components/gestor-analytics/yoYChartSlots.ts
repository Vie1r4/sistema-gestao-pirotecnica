/**
 * Eixo X fixo por preset (espelha YoYHomologaBuilder no backend).
 * Toda a aritmética de datas é UTC para evitar chaves duplicadas (ex. dois «2026-03»).
 */

import { format, getISOWeek, getISOWeekYear, parse, startOfISOWeek } from "date-fns";
import { pt } from "date-fns/locale";

export type PeriodoYoYId = "7" | "30" | "90" | "180" | "365" | "730" | "1095";

export type YoYSlotDef = {
  indice: number;
  chave: string;
  rotulo: string;
  futuro: boolean;
};

const DAY_MS = 86_400_000;

function utcToday(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

function utcNoon(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12)
  );
}

function cap(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function utcAddDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * DAY_MS);
}

function utcStartOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function utcAddMonths(d: Date, months: number): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1)
  );
}

function chaveDia(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function chaveMes(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function chaveSemana(d: Date): string {
  return `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, "0")}`;
}

function fmtUtc(d: Date, pattern: string): string {
  return format(utcNoon(d), pattern, { locale: pt });
}

function inicioSemanaIsoUtc(d: Date): Date {
  const day = d.getUTCDay() || 7;
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate() - day + 1
    )
  );
}

function inicioSemanaIsoUtcAnoSemana(ano: number, semana: number): Date {
  const parsed = parse(
    `${ano}-W${String(semana).padStart(2, "0")}`,
    "RRRR-'W'II",
    new Date()
  );
  const monday = startOfISOWeek(parsed);
  return new Date(
    Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate())
  );
}

function semanaFuturaNoAno(ano: number, semanaIso: number, hoje: Date): boolean {
  if (ano !== hoje.getUTCFullYear()) return false;
  return semanaIso > getISOWeek(hoje);
}

function rotuloMes(cursor: Date, variosAnos: boolean): string {
  if (variosAnos) return cap(fmtUtc(cursor, "MMM yy"));
  return cap(fmtUtc(cursor, "MMM"));
}

function dedupeSlotsPorChave(slots: YoYSlotDef[]): YoYSlotDef[] {
  const seen = new Set<string>();
  const out: YoYSlotDef[] = [];
  for (const slot of slots) {
    if (seen.has(slot.chave)) continue;
    seen.add(slot.chave);
    out.push({ ...slot, indice: out.length + 1 });
  }
  return out;
}

function addSemanasRolling(
  slots: YoYSlotDef[],
  hoje: Date,
  dias: number
): void {
  const inicio = utcAddDays(hoje, -(dias - 1));
  let cursor = inicioSemanaIsoUtc(inicio);
  const fimMs = hoje.getTime();
  const seen = new Set<string>();
  while (cursor.getTime() <= fimMs) {
    const chave = chaveSemana(cursor);
    if (!seen.has(chave)) {
      seen.add(chave);
      slots.push({
        indice: slots.length + 1,
        chave,
        rotulo: cap(fmtUtc(cursor, "d MMM")),
        futuro: cursor.getTime() > fimMs,
      });
    }
    cursor = utcAddDays(cursor, 7);
  }
}

function addMesesRolling(
  slots: YoYSlotDef[],
  hoje: Date,
  meses: number
): void {
  const fim = utcStartOfMonth(hoje);
  const inicio = utcAddMonths(fim, -(meses - 1));
  const variosAnos = inicio.getUTCFullYear() !== fim.getUTCFullYear();
  let cursor = inicio;
  const seen = new Set<string>();
  while (cursor.getTime() <= fim.getTime()) {
    const chave = chaveMes(cursor);
    if (!seen.has(chave)) {
      seen.add(chave);
      const futuro =
        cursor.getUTCFullYear() > hoje.getUTCFullYear() ||
        (cursor.getUTCFullYear() === hoje.getUTCFullYear() &&
          cursor.getUTCMonth() > hoje.getUTCMonth());
      slots.push({
        indice: slots.length + 1,
        chave,
        rotulo: rotuloMes(cursor, variosAnos),
        futuro,
      });
    }
    cursor = utcAddMonths(cursor, 1);
  }
}

/** Gera a grelha fixa do eixo X para o preset activo. */
export function buildYoYSlotDefs(
  periodoId: PeriodoYoYId | string,
  hoje: Date = utcToday()
): YoYSlotDef[] {
  const pid = (periodoId || "365") as PeriodoYoYId;
  const ano = hoje.getUTCFullYear();
  const slots: YoYSlotDef[] = [];

  switch (pid) {
    case "7":
      for (let d = 6; d >= 0; d--) {
        const dt = utcAddDays(hoje, -d);
        slots.push({
          indice: slots.length + 1,
          chave: chaveDia(dt),
          rotulo: cap(fmtUtc(dt, "d MMM")),
          futuro: dt.getTime() > hoje.getTime(),
        });
      }
      break;
    case "30":
      addSemanasRolling(slots, hoje, 30);
      break;
    case "90":
      addSemanasRolling(slots, hoje, 90);
      break;
    case "180":
      addMesesRolling(slots, hoje, 6);
      break;
    case "365":
      addMesesRolling(slots, hoje, 12);
      break;
    case "730":
      for (let m = 1; m <= 12; m++) {
        const dt = new Date(Date.UTC(ano, m - 1, 1));
        slots.push({
          indice: slots.length + 1,
          chave: chaveMes(dt),
          rotulo: cap(fmtUtc(dt, "MMM")),
          futuro: ano === hoje.getUTCFullYear() && m > hoje.getUTCMonth() + 1,
        });
      }
      break;
    case "1095":
      for (let w = 1; w <= 52; w++) {
        const dt = inicioSemanaIsoUtcAnoSemana(ano, w);
        const chave = chaveSemana(dt);
        slots.push({
          indice: slots.length + 1,
          chave,
          rotulo: cap(fmtUtc(dt, "d MMM")),
          futuro: semanaFuturaNoAno(ano, w, hoje),
        });
      }
      break;
    default:
      addMesesRolling(slots, hoje, 12);
      break;
  }

  return dedupeSlotsPorChave(slots);
}
