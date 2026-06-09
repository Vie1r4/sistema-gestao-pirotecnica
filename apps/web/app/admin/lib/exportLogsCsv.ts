import type { LogSistemaItem } from "@/app/lib/admin";
import { fetchAdminLogs } from "@/app/lib/admin";
import { logEntidadeLabel, type LogEntidadeFilter } from "@/app/admin/lib/logEntityFilter";

/** Tamanho de lote alinhado ao máximo permitido pela API (`AdminController.Logs`). */
export const LOGS_EXPORT_BATCH_SIZE = 200;

/** Limite de segurança para não bloquear o browser em exportações enormes. */
export const LOGS_EXPORT_MAX_ROWS = 10_000;

export type LogsExportFilters = {
  acao?: string;
  userName?: string;
  entidade?: string;
  dataInicio?: string;
  dataFim?: string;
};

export type FetchAllLogsResult = {
  items: LogSistemaItem[];
  totalRegistos: number;
  /** Verdadeiro se existiam mais registos do que o limite de exportação. */
  truncated: boolean;
};

/** Calcula quantas páginas pedir para cobrir `total` linhas (função pura, testável). */
export function exportPageCount(
  total: number,
  batchSize: number,
  maxRows = LOGS_EXPORT_MAX_ROWS
): number {
  if (total <= 0 || batchSize <= 0) return 0;
  const cap = Math.min(total, maxRows);
  return Math.ceil(cap / batchSize);
}

/**
 * Obtém todos os logs que correspondem aos filtros actuais (várias páginas),
 * até ao limite `maxRows`.
 */
export async function fetchAllFilteredAdminLogs(
  token: string,
  filters: LogsExportFilters,
  options?: { batchSize?: number; maxRows?: number }
): Promise<FetchAllLogsResult> {
  const batchSize = options?.batchSize ?? LOGS_EXPORT_BATCH_SIZE;
  const maxRows = options?.maxRows ?? LOGS_EXPORT_MAX_ROWS;

  const first = await fetchAdminLogs(token, {
    ...filters,
    pagina: 1,
    itensPorPagina: batchSize,
  });

  const total = first.totalRegistos;
  if (total === 0) {
    return { items: [], totalRegistos: 0, truncated: false };
  }

  const pages = exportPageCount(total, batchSize, maxRows);
  const all: LogSistemaItem[] = [...first.items];

  for (let p = 2; p <= pages; p++) {
    const batch = await fetchAdminLogs(token, {
      ...filters,
      pagina: p,
      itensPorPagina: batchSize,
    });
    all.push(...batch.items);
    if (all.length >= maxRows) break;
  }

  const truncated = total > maxRows;
  const items = truncated ? all.slice(0, maxRows) : all;

  return { items, totalRegistos: total, truncated };
}

export type LogsCsvExportMeta = {
  filters: LogsExportFilters;
  exportedCount: number;
  totalFiltered: number;
  truncated: boolean;
  exportedAt?: Date;
};

/** Linhas de comentário (#) com filtros e data — ignoradas pela maioria dos parsers CSV. */
export function buildLogsCsvMetadataLines(meta: LogsCsvExportMeta): string[] {
  const f = meta.filters;
  const entidade = f.entidade
    ? logEntidadeLabel(f.entidade as LogEntidadeFilter)
    : "Todas";
  const acao = f.acao?.trim() || "(qualquer)";
  const utilizador = f.userName?.trim() || "(qualquer)";
  const periodo =
    f.dataInicio || f.dataFim
      ? `${f.dataInicio || "…"} → ${f.dataFim || "…"}`
      : "(qualquer)";
  const when = (meta.exportedAt ?? new Date()).toISOString();
  const truncado = meta.truncated ? " sim (limite de segurança)" : " não";

  return [
    "# Exportação PIROFAFE — logs de auditoria",
    `# Exportado em: ${when}`,
    `# Área: ${entidade}`,
    `# Ação: ${acao}`,
    `# Utilizador: ${utilizador}`,
    `# Período: ${periodo}`,
    `# Registos exportados: ${meta.exportedCount} de ${meta.totalFiltered}`,
    `# Truncado:${truncado}`,
  ];
}

function escapeCsvCell(v: string): string {
  const s = v.replace(/"/g, '""');
  return /[",\n\r]/.test(s) ? `"${s}"` : s;
}

/** Gera e descarrega CSV no browser. Devolve false se não houver linhas. */
export function downloadLogsCsv(
  items: LogSistemaItem[],
  options?: { filenamePrefix?: string; metadata?: LogsCsvExportMeta }
) {
  if (items.length === 0) return false;

  const header = ["id", "timestamp", "acao", "userName", "userId", "jsonDados"];
  const rows = items.map((log) =>
    [
      String(log.id),
      log.timestamp ?? "",
      log.acao,
      log.userName ?? "",
      log.userId ?? "",
      log.jsonDados ?? "",
    ]
      .map(escapeCsvCell)
      .join(",")
  );

  const metadataLines = options?.metadata ? buildLogsCsvMetadataLines(options.metadata) : [];
  const csv = [...metadataLines, header.join(","), ...rows].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  const prefix = options?.filenamePrefix ?? "logs-auditoria";
  a.href = url;
  a.download = `${prefix}-${stamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

/** Obtém todos os registos filtrados e inicia o download CSV. */
export async function exportFilteredLogsCsv(
  token: string,
  filters: LogsExportFilters
): Promise<{ ok: boolean; exported: number; total: number; truncated: boolean }> {
  const { items, totalRegistos, truncated } = await fetchAllFilteredAdminLogs(token, filters);
  if (items.length === 0) {
    return { ok: false, exported: 0, total: totalRegistos, truncated: false };
  }
  downloadLogsCsv(items, {
    metadata: {
      filters,
      exportedCount: items.length,
      totalFiltered: totalRegistos,
      truncated,
      exportedAt: new Date(),
    },
  });
  return { ok: true, exported: items.length, total: totalRegistos, truncated };
}
