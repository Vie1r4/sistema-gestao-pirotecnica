/**
 * Tipos e constantes para a área Armazém (Paióis).
 * Dados vêm apenas da API (paiolApi). Sem localStorage.
 */

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
