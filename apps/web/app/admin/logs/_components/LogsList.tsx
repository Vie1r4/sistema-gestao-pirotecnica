"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import type { LogSistemaItem } from "@/app/lib/admin";
import { logActionBadgeClass, logActionDotClass, AdminEmptyState } from "@/app/admin/_components";
import { adminTheme } from "@/app/admin/_components";
import { rotuloChave, summarizeLogJson } from "@/app/admin/lib/logSummary";

type Props = {
  items: LogSistemaItem[];
  total: number;
  pagina: number;
  itensPorPagina: number;
  onPageChange: (pagina: number) => void;
  onPerPageChange: (n: number) => void;
  /** Filtrar por utilizador ao clicar no nome de uma linha. */
  onFilterUser?: (userName: string) => void;
  /** Filtrar por ação ao clicar no badge de uma linha. */
  onFilterAcao?: (acao: string) => void;
};

const PER_PAGE_OPTIONS = [25, 50, 100];

function isDestrutiva(acao: string): boolean {
  return /eliminar|apagar|delete|remover/i.test(acao);
}

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

function formatRelativa(timestamp: string): string {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: pt });
  } catch {
    return "";
  }
}

function formatExato(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function LogRow({
  log,
  onFilterUser,
  onFilterAcao,
}: {
  log: LogSistemaItem;
  onFilterUser?: (userName: string) => void;
  onFilterAcao?: (acao: string) => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const destrutiva = isDestrutiva(log.acao);
  const resumo = summarizeLogJson(log.jsonDados);

  async function copiarJson() {
    if (!log.jsonDados) return;
    try {
      await navigator.clipboard.writeText(prettyJson(log.jsonDados));
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* clipboard indisponível — ignora silenciosamente */
    }
  }

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#fafaf9] dark:hover:bg-[#161616] ${
        destrutiva ? "border-l-2 border-red-300 dark:border-red-500/60" : "border-l-2 border-transparent"
      }`}
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${logActionDotClass(log.acao)}`} />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {onFilterAcao ? (
            <button
              type="button"
              onClick={() => onFilterAcao(log.acao)}
              title="Filtrar por esta ação"
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80 ${logActionBadgeClass(log.acao)}`}
            >
              {log.acao}
            </button>
          ) : (
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${logActionBadgeClass(log.acao)}`}>
              {log.acao}
            </span>
          )}

          {log.userName && (
            <span className="text-xs text-[#78716c] dark:text-[#888]">
              por{" "}
              {onFilterUser ? (
                <button
                  type="button"
                  onClick={() => onFilterUser(log.userName!)}
                  title="Filtrar por este utilizador"
                  className="font-medium text-[#1c1917] underline-offset-2 hover:underline dark:text-white"
                >
                  {log.userName}
                </button>
              ) : (
                <strong className="font-medium text-[#1c1917] dark:text-white">{log.userName}</strong>
              )}
            </span>
          )}

          <span
            className="ml-auto shrink-0 text-xs text-[#a8a29e] dark:text-[#555]"
            title={formatExato(log.timestamp)}
          >
            {formatRelativa(log.timestamp) || formatHora(log.timestamp)}
          </span>
        </div>

        {resumo.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resumo.map((campo) => (
              <span
                key={campo.chave}
                className="inline-flex max-w-full items-center gap-1 rounded-md bg-[#f5f4f2] px-1.5 py-0.5 text-[11px] text-[#57534e] dark:bg-[#1a1a1a] dark:text-[#a3a3a3]"
              >
                <span className="text-[#a8a29e] dark:text-[#666]">{rotuloChave(campo.chave)}:</span>
                <span className="truncate font-medium text-[#1c1917] dark:text-white">{campo.valor}</span>
              </span>
            ))}
          </div>
        )}

        {log.jsonDados && (
          <details className="mt-1 group">
            <summary className="flex cursor-pointer items-center gap-2 text-xs text-[#a8a29e] hover:text-[#57534e] dark:text-[#555] dark:hover:text-[#888]">
              <span className="group-open:hidden">Ver detalhe</span>
              <span className="hidden group-open:inline">Ocultar detalhe</span>
            </summary>
            <div className="relative mt-1.5">
              <button
                type="button"
                onClick={copiarJson}
                className="absolute right-2 top-2 rounded-md border border-[#e7e5e4] bg-white px-2 py-0.5 text-[11px] font-medium text-[#57534e] shadow-sm transition-colors hover:bg-[#fafaf9] dark:border-[#333] dark:bg-[#111] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a]"
              >
                {copiado ? "Copiado ✓" : "Copiar"}
              </button>
              <pre className="overflow-x-auto rounded-xl bg-[#f8f7f5] p-3 pr-20 text-[11px] leading-relaxed text-[#57534e] dark:bg-[#0d0d0d] dark:text-[#a3a3a3]">
                {prettyJson(log.jsonDados)}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

export default function LogsList({
  items,
  total,
  pagina,
  itensPorPagina,
  onPageChange,
  onPerPageChange,
  onFilterUser,
  onFilterAcao,
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
  const inicio = (pagina - 1) * itensPorPagina + 1;
  const fim = Math.min(pagina * itensPorPagina, total);

  return (
    <div className="space-y-4">
      {/* Contagem total */}
      <p className="text-sm text-[#78716c] dark:text-[#888]">
        <strong className="font-semibold text-[#1c1917] dark:text-white">{total.toLocaleString("pt-PT")}</strong>{" "}
        {total === 1 ? "registo" : "registos"}
        <span className="text-[#a8a29e] dark:text-[#555]"> · a mostrar {inicio}–{fim}</span>
      </p>

      {/* Lista agrupada por dia */}
      {Array.from(grouped.entries()).map(([day, dayItems]) => (
        <div key={day}>
          <p className="sticky top-0 z-10 mb-2 -mx-1 bg-[#f8f7f5]/90 px-1 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#a8a29e] backdrop-blur dark:bg-[#0a0a0a]/90 dark:text-[#555]">
            {formatData(dayItems[0].timestamp)}
          </p>
          <div className="divide-y divide-[#f1f0ef] overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white dark:divide-[#1a1a1a] dark:border-[#222] dark:bg-[#111]">
            {dayItems.map((log) => (
              <LogRow
                key={log.id}
                log={log}
                onFilterUser={onFilterUser}
                onFilterAcao={onFilterAcao}
              />
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
            {inicio}–{fim} de {total}
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
