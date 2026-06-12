/**
 * Tipos e constantes para a área Armazém (Paióis).
 * Dados vêm apenas da API (paiolApi). Sem localStorage.
 */

import { getter } from "./apiCase";

/** Perfil de risco (classificação licença): 1.1 a 1.6 — exibido como 1.1G, 1.2G, etc. */
export const PERFIS_RISCO = ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6"] as const;
export type PerfilRiscoPaiol = (typeof PERFIS_RISCO)[number];

/** Estados do paiol: Ativo = pode receber; Em Manutenção = bloqueado */
export const ESTADOS_PAIOL = ["Ativo", "Em Manutenção"] as const;
export type EstadoPaiol = (typeof ESTADOS_PAIOL)[number];

export type PaiolDocumentoExtra = {
  id: string;
  nome: string;
  caminho?: string;
};

export type Paiol = {
  id: string;
  nome: string;
  localizacao?: string;
  coordenadasLat?: number;
  coordenadasLng?: number;
  /** Teto de segurança NEM (kg) — valor positivo */
  limiteMLE: number;
  perfilRisco: PerfilRiscoPaiol;
  estado: EstadoPaiol;
  /** Data de validade da licença PSP (ISO) */
  dataValidadeLicenca?: string;
  numeroLicenca?: string;
  /** Divisão dominante (preenchido pelo motor no backend; opcional no frontend) */
  divisaoDominante?: string;
  documentosExtras: PaiolDocumentoExtra[];
  dataRegisto: string;
};

/** Label do perfil para exibição (ex.: 1.3 → "1.3G") */
export function labelPerfilRisco(value: string): string {
  return value === "1.4S" ? value : `${value}G`;
}

/** Valida limite MLE: número positivo */
export function validarLimiteMLE(val: number): boolean {
  return typeof val === "number" && !Number.isNaN(val) && val > 0;
}

/**
 * Mapeia a resposta da API para o tipo `Paiol`, aceitando chaves em camelCase
 * ou PascalCase. Aceita tanto `{ paiol: {...} }` como o objeto do paiol direto.
 * Fonte única usada pelas páginas de detalhe, edição e listagens.
 */
export function mapPaiolFromApi(data: Record<string, unknown>, fallbackId = ""): Paiol {
  const p = (data.paiol ?? data.Paiol ?? data) as Record<string, unknown>;
  const get = getter(p);
  const docExtras = (get("documentosExtras") ?? get("DocumentosExtras") ?? []) as Array<Record<string, unknown>>;
  return {
    id: String(get("id") ?? get("Id") ?? fallbackId),
    nome: String(get("nome") ?? get("Nome") ?? ""),
    localizacao: (get("localizacao") ?? get("Localizacao")) as string | undefined,
    coordenadasLat: (get("coordenadasLat") ?? get("CoordenadasLat")) as number | undefined,
    coordenadasLng: (get("coordenadasLng") ?? get("CoordenadasLng")) as number | undefined,
    limiteMLE: Number(get("limiteMLE") ?? get("LimiteMLE") ?? 0),
    perfilRisco: String(get("perfilRisco") ?? get("PerfilRisco") ?? "1.1") as PerfilRiscoPaiol,
    estado: String(get("estado") ?? get("Estado") ?? "Ativo") as EstadoPaiol,
    dataValidadeLicenca: (get("dataValidadeLicenca") ?? get("DataValidadeLicenca")) as string | undefined,
    numeroLicenca: (get("numeroLicenca") ?? get("NumeroLicenca")) as string | undefined,
    divisaoDominante: (get("divisaoDominante") ?? get("DivisaoDominante")) as string | undefined,
    documentosExtras: docExtras.map((d) => ({
      id: String(d.id ?? d.Id ?? ""),
      nome: String(d.nome ?? d.Nome ?? ""),
      caminho: (d.caminho ?? d.Caminho) as string | undefined,
    })),
    dataRegisto: (get("dataRegisto") ?? get("DataRegisto") ?? new Date().toISOString()) as string,
  };
}

/** Paiol enriquecido com a percentagem de ocupação (para a lista do Armazém). */
export type PaiolComOcupacao = {
  id: string;
  nome: string;
  localizacao?: string;
  perfilRisco: string;
  estado: string;
  limiteMLE: number;
  percentagemOcupacao: number;
};

/** Mapeia um item da listagem (paiol + ocupação) da API para `PaiolComOcupacao`. */
export function mapPaiolComOcupacao(item: Record<string, unknown>): PaiolComOcupacao {
  const p = (item.Paiol ?? item.paiol ?? {}) as Record<string, unknown>;
  const pct = Number(item.PercentagemOcupacao ?? item.percentagemOcupacao ?? 0);
  const limite = Number(p.LimiteMLE ?? p.limiteMLE ?? 0);
  return {
    id: String(p.Id ?? p.id ?? ""),
    nome: String(p.Nome ?? p.nome ?? "").trim() || "—",
    localizacao: (p.Localizacao ?? p.localizacao) as string | undefined,
    perfilRisco: String(p.PerfilRisco ?? p.perfilRisco ?? ""),
    estado: String(p.Estado ?? p.estado ?? ""),
    limiteMLE: Number.isFinite(limite) ? limite : 0,
    percentagemOcupacao: Number.isFinite(pct) ? pct : 0,
  };
}
