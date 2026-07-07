/** Dias antes da validade em que começam os avisos (2 meses). */
export const DIAS_AVISO_EXPIRACAO_LICENCA = 60;

export type EstadoLicencaOperador =
  | "Ausente"
  | "Incompleta"
  | "Valida"
  | "AExpirar"
  | "Expirada";

export function calcularEstadoLicencaOperador(
  temFicheiro: boolean,
  numeroCredencial?: string,
  dataValidade?: string | null,
  referencia: Date = new Date()
): EstadoLicencaOperador {
  const hoje = startOfDay(referencia);
  const cred = numeroCredencial?.trim();
  const validade = dataValidade?.trim();

  if (!temFicheiro && !cred && !validade) return "Ausente";
  if (!temFicheiro || !cred || !validade) return "Incompleta";

  const fim = startOfDay(new Date(validade));
  if (Number.isNaN(fim.getTime())) return "Incompleta";
  if (fim < hoje) return "Expirada";
  const limiteAviso = new Date(hoje);
  limiteAviso.setDate(limiteAviso.getDate() + DIAS_AVISO_EXPIRACAO_LICENCA);
  if (fim <= limiteAviso) return "AExpirar";
  return "Valida";
}

export function rotuloEstadoLicenca(estado: EstadoLicencaOperador): string {
  switch (estado) {
    case "Valida":
      return "Válida";
    case "AExpirar":
      return "Prestes a expirar";
    case "Expirada":
      return "Expirada";
    case "Incompleta":
      return "Incompleta";
    default:
      return "Sem credencial";
  }
}

export function classeBadgeEstadoLicenca(estado: EstadoLicencaOperador): string {
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

/** Converte ISO/date da API para input type=date (yyyy-mm-dd). */
export function toDateInputValue(value?: string | null): string {
  if (!value?.trim()) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
