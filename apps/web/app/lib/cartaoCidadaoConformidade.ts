/** Dias antes da validade em que começam os avisos (2 meses). */
export const DIAS_AVISO_EXPIRACAO_CARTAO_CIDADAO = 60;

export type EstadoCartaoCidadao =
  | "Ausente"
  | "Incompleta"
  | "Valida"
  | "AExpirar"
  | "Expirada";

export function calcularEstadoCartaoCidadao(
  temFicheiro: boolean,
  nif?: string,
  morada?: string,
  dataValidade?: string | null,
  referencia: Date = new Date()
): EstadoCartaoCidadao {
  const hoje = startOfDay(referencia);
  const nifTrim = nif?.trim();
  const moradaTrim = morada?.trim();
  const validade = dataValidade?.trim();

  if (!temFicheiro && !nifTrim && !moradaTrim && !validade) return "Ausente";
  if (!temFicheiro || !nifTrim || !moradaTrim || !validade) return "Incompleta";

  const fim = startOfDay(new Date(validade));
  if (Number.isNaN(fim.getTime())) return "Incompleta";
  if (fim < hoje) return "Expirada";
  const limiteAviso = new Date(hoje);
  limiteAviso.setDate(limiteAviso.getDate() + DIAS_AVISO_EXPIRACAO_CARTAO_CIDADAO);
  if (fim <= limiteAviso) return "AExpirar";
  return "Valida";
}

export function rotuloEstadoCartaoCidadao(estado: EstadoCartaoCidadao): string {
  switch (estado) {
    case "Valida":
      return "Válido";
    case "AExpirar":
      return "Prestes a expirar";
    case "Expirada":
      return "Expirado";
    case "Incompleta":
      return "Incompleto";
    default:
      return "Sem cartão";
  }
}

export function classeBadgeEstadoCartaoCidadao(estado: EstadoCartaoCidadao): string {
  switch (estado) {
    case "Valida":
      return "border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-200";
    case "AExpirar":
      return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200";
    case "Expirada":
    case "Incompleta":
      return "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700 dark:border-[#333] dark:bg-[#111] dark:text-gray-300";
  }
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export { toDateInputValue } from "./licencaOperadorConformidade";
