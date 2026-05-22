/** Valores aceites por `GET /api/admin/logs?entidade=` */
export type LogEntidadeFilter = "" | "encomenda" | "stock" | "admin" | "conta";

export const LOG_ENTIDADE_OPTIONS: { id: LogEntidadeFilter; label: string }[] = [
  { id: "", label: "Todas" },
  { id: "encomenda", label: "Encomendas" },
  { id: "stock", label: "Armazém / stock" },
  { id: "admin", label: "Administração" },
  { id: "conta", label: "Contas / auth" },
];

export function logEntidadeLabel(id: LogEntidadeFilter): string {
  return LOG_ENTIDADE_OPTIONS.find((o) => o.id === id)?.label ?? id;
}
