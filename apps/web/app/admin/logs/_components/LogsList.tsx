"use client";

import type { LogSistemaItem } from "@/app/lib/admin";
import { logActionBadgeClass, logActionDotClass, AdminEmptyState } from "@/app/admin/_components";
import { adminTheme } from "@/app/admin/_components";

type Props = {
  items: LogSistemaItem[];
  total: number;
  pagina: number;
  itensPorPagina: number;
  onPageChange: (pagina: number) => void;
  onPerPageChange: (n: number) => void;
};

const PER_PAGE_OPTIONS = [25, 50, 100];

function formatHora(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return timestamp;
  }
}

function formatData(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleDateString("pt-PT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return timestamp.slice(0, 10);
  }
}

function groupByDate(items: LogSistemaItem[]): Map<string, LogSistemaItem[]> {
  const map = new Map<string, LogSistemaItem[]>();
  for (const item of items) {
    const day = item.timestamp ? item.timestamp.slice(0, 10) : "desconhecido";
    const existing = map.get(day);
    if (existing) {
      existing.push(item);
    } else {
      map.set(day, [item]);
    }
  }
  return map;
}

export default function LogsList({
  items,
  total,
  pagina,
  itensPorPagina,
  onPageChange,
  onPerPageChange,
}: Props) {
  if (items.length === 0) {
    return (
      <AdminEmptyState
        title="Sem logs para os filtros seleccionados."
        description="Ajusta os filtros ou limpa-os para ver todos os registos."
      />
    );
  }

  const totalPaginas = Math.max(1, Math.ceil(total / itensPorPagina));
  const grouped = groupByDate(items);

  return (
    <div className="space-y-4">
      {/* Lista agrupada por dia */}
      {Array.from(grouped.entries()).map(([day, dayItems]) => (
        <div key={day}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#a8a29e] dark:text-[#555]">
            {formatData(dayItems[0].timestamp)}
          </p>
          <div className="divide-y divide-[#f1f0ef] rounded-2xl border border-[#e7e5e4] bg-white dark:divide-[#1a1a1a] dark:border-[#222] dark:bg-[#111]">
            {dayItems.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                {/* Dot */}
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${logActionDotClass(log.acao)}`}
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${logActionBadgeClass(log.acao)}`}
                    >
                      {log.acao}
                    </span>
                    {log.userName && (
                      <span className="text-xs text-[#78716c] dark:text-[#888]">
                        por <strong className="font-medium text-[#1c1917] dark:text-white">{log.userName}</strong>
                      </span>
                    )}
                    <span className="ml-auto text-xs text-[#a8a29e] dark:text-[#555]">
                      {formatHora(log.timestamp)}
                    </span>
                  </div>

                  {log.jsonDados && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs text-[#a8a29e] hover:text-[#57534e] dark:text-[#555] dark:hover:text-[#888]">
                        Ver JSON
                      </summary>
                      <pre className="mt-1.5 overflow-x-auto rounded-xl bg-[#f8f7f5] p-3 text-[11px] leading-relaxed text-[#57534e] dark:bg-[#0d0d0d] dark:text-[#a3a3a3]">
                        {(() => {
                          try {
                            return JSON.stringify(JSON.parse(log.jsonDados!), null, 2);
                          } catch {
                            return log.jsonDados;
                          }
                        })()}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Paginação */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-sm text-[#78716c] dark:text-[#888]">
          <span>Por página:</span>
          <select
            value={itensPorPagina}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="rounded-lg border border-[#e7e5e4] bg-white px-2 py-1 text-sm text-[#1c1917] dark:border-[#333] dark:bg-[#111] dark:text-white"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>
            {(pagina - 1) * itensPorPagina + 1}–{Math.min(pagina * itensPorPagina, total)} de {total}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={pagina <= 1}
            onClick={() => onPageChange(pagina - 1)}
            className={`${adminTheme.btnSecondary} px-3 py-1.5 text-xs disabled:opacity-40`}
          >
            Anterior
          </button>
          <span className="px-2 text-xs text-[#78716c] dark:text-[#888]">
            {pagina} / {totalPaginas}
          </span>
          <button
            type="button"
            disabled={pagina >= totalPaginas}
            onClick={() => onPageChange(pagina + 1)}
            className={`${adminTheme.btnSecondary} px-3 py-1.5 text-xs disabled:opacity-40`}
          >
            Seguinte
          </button>
        </div>
      </div>
    </div>
  );
}
