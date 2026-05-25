/** Valores aceites por `GET /api/admin/logs?entidade=` */

export type LogEntidadeFilter = "" | "encomenda" | "stock" | "admin" | "conta";



export const LOG_ENTIDADE_OPTIONS: { id: LogEntidadeFilter; label: string }[] = [

  { id: "", label: "Todas" },

  { id: "encomenda", label: "Encomendas" },

  { id: "stock", label: "Armazém" },

  { id: "admin", label: "Administração" },

  { id: "conta", label: "Contas / auth" },

];



/** Atalhos de texto em `Acao` (API: Contains). Não duplicar filtros de área. */

export const LOG_TIPO_OPTIONS = [

  { id: "criad", label: "Criações", keyword: "CRIAD" },

  { id: "edit", label: "Alterações", keyword: "EDIT" },

  { id: "rejeit", label: "Rejeições", keyword: "REJEIT" },

] as const;



export type LogTipoFilterId = (typeof LOG_TIPO_OPTIONS)[number]["id"];



export function logEntidadeLabel(id: LogEntidadeFilter): string {

  return LOG_ENTIDADE_OPTIONS.find((o) => o.id === id)?.label ?? id;

}



export function logTipoLabel(id: LogTipoFilterId): string {

  return LOG_TIPO_OPTIONS.find((o) => o.id === id)?.label ?? id;

}



/** Indica se o texto da ação corresponde a um atalho de tipo (para sincronizar UI). */

export function matchLogTipoId(acao: string): LogTipoFilterId | null {

  const upper = acao.trim().toUpperCase();

  if (!upper) return null;

  const hit = LOG_TIPO_OPTIONS.find((o) => o.keyword === upper);

  return hit?.id ?? null;

}


