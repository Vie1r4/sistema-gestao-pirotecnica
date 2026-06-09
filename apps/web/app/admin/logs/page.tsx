"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "@/app/lib/auth";
import { fetchAdminLogs } from "@/app/lib/admin";
import {
  AdminPageHeader,
  adminTheme,
  buildBreadcrumbs,
} from "@/app/admin/_components";
import { type LogEntidadeFilter } from "@/app/admin/lib/logEntityFilter";
import { exportFilteredLogsCsv } from "@/app/admin/lib/exportLogsCsv";
import AdminLogsFilters, { type LogsFilterState } from "./AdminLogsFilters";
import LogsList from "./_components/LogsList";

function AdminLogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportErr, setExportErr] = useState<string | null>(null);

  const entidade = (searchParams.get("entidade") ?? "") as LogEntidadeFilter;
  const acao = searchParams.get("acao") ?? "";
  const userName = searchParams.get("userName") ?? "";
  const dataInicio = searchParams.get("dataInicio") ?? "";
  const dataFim = searchParams.get("dataFim") ?? "";
  const pagina = Math.max(1, Number(searchParams.get("pagina") ?? "1"));
  const itensPorPagina = Number(searchParams.get("itensPorPagina") ?? "50");

  const token = getToken();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "logs", entidade, acao, userName, dataInicio, dataFim, pagina, itensPorPagina],
    queryFn: () =>
      fetchAdminLogs(token ?? "", {
        entidade,
        acao,
        userName,
        dataInicio,
        dataFim,
        pagina,
        itensPorPagina,
      }),
    enabled: !!token,
  });

  const pushParams = useCallback(
    (params: Record<string, string>) => {
      const next = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v) next.set(k, v);
      });
      router.push(`/admin/logs?${next.toString()}`);
    },
    [router]
  );

  // AdminLogsFilters calls onChange + onResetPage together on every filter change.
  // onChange carries the new filter state; onResetPage resets pagination to 1.
  // We handle both in a single URL push inside handleChange to avoid a double navigation.
  const handleChange = useCallback(
    (f: LogsFilterState) => {
      pushParams({
        entidade: f.entidade,
        acao: f.acao,
        userName: f.userName,
        dataInicio: f.dataInicio,
        dataFim: f.dataFim,
        itensPorPagina: String(itensPorPagina),
        pagina: "1",
      });
    },
    [pushParams, itensPorPagina]
  );

  // No-op: page reset is already handled inside handleChange above.
  const handleResetPage = useCallback(() => {}, []);

  function handlePageChange(p: number) {
    pushParams({
      entidade,
      acao,
      userName,
      dataInicio,
      dataFim,
      itensPorPagina: String(itensPorPagina),
      pagina: String(p),
    });
  }

  function handlePerPageChange(n: number) {
    pushParams({
      entidade,
      acao,
      userName,
      dataInicio,
      dataFim,
      itensPorPagina: String(n),
      pagina: "1",
    });
  }

  // Filtrar a partir de uma linha (clicar no utilizador / ação): mantém os
  // restantes filtros e volta à primeira página.
  const handleFilterUser = useCallback(
    (nome: string) => {
      pushParams({
        entidade,
        acao,
        userName: nome,
        dataInicio,
        dataFim,
        itensPorPagina: String(itensPorPagina),
        pagina: "1",
      });
    },
    [pushParams, entidade, acao, dataInicio, dataFim, itensPorPagina]
  );

  const handleFilterAcao = useCallback(
    (novaAcao: string) => {
      pushParams({
        entidade,
        acao: novaAcao,
        userName,
        dataInicio,
        dataFim,
        itensPorPagina: String(itensPorPagina),
        pagina: "1",
      });
    },
    [pushParams, entidade, userName, dataInicio, dataFim, itensPorPagina]
  );

  const currentFilters: LogsFilterState = {
    acao,
    userName,
    entidade,
    dataInicio,
    dataFim,
  };

  const handleExportCsv = useCallback(async () => {
    if (!token || exporting) return;
    setExporting(true);
    setExportMsg(null);
    setExportErr(null);
    try {
      const result = await exportFilteredLogsCsv(token, {
        acao,
        userName,
        entidade,
        dataInicio,
        dataFim,
      });
      if (!result.ok) {
        setExportErr("Não há registos para exportar com os filtros actuais.");
        return;
      }
      if (result.truncated) {
        setExportMsg(
          `Exportados ${result.exported.toLocaleString("pt-PT")} de ${result.total.toLocaleString("pt-PT")} registos (limite de segurança). Refina os filtros para exportar o resto.`
        );
      } else {
        setExportMsg(
          `${result.exported.toLocaleString("pt-PT")} ${result.exported === 1 ? "registo exportado" : "registos exportados"}.`
        );
      }
    } catch {
      setExportErr("Falha ao exportar. Tenta novamente.");
    } finally {
      setExporting(false);
    }
  }, [token, exporting, acao, userName, entidade, dataInicio, dataFim]);

  const podeExportar = !!data && data.totalRegistos > 0 && !!token;

  return (
    <div className={`min-h-screen ${adminTheme.pageBg}`}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <AdminPageHeader
          title="Logs do sistema"
          description="Auditoria de todas as acções registadas na plataforma."
          breadcrumb={buildBreadcrumbs("/admin/logs")}
          actions={
            podeExportar ? (
              <button
                type="button"
                disabled={exporting}
                onClick={handleExportCsv}
                className={`${adminTheme.btnSecondary} disabled:opacity-60`}
              >
                {exporting ? "A exportar…" : "Exportar CSV (filtros)"}
              </button>
            ) : undefined
          }
        />

        {(exportMsg || exportErr) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              exportErr
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
                : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
            }`}
            role="status"
          >
            {exportErr ?? exportMsg}
          </div>
        )}

        <AdminLogsFilters
          value={currentFilters}
          onChange={handleChange}
          onResetPage={handleResetPage}
        />

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
            Erro ao carregar logs. Verifica a ligação ou tenta novamente.
          </div>
        )}

        {isLoading && <LogsListSkeleton />}

        {!isLoading && !isError && data && (
          <LogsList
            items={data.items}
            total={data.totalRegistos}
            pagina={data.paginaAtual}
            itensPorPagina={data.itensPorPagina}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onFilterUser={handleFilterUser}
            onFilterAcao={handleFilterAcao}
          />
        )}
      </div>
    </div>
  );
}

function LogsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-40 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#1a1a1a]" />
      <div className="h-3 w-28 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#1a1a1a]" />
      <div className="divide-y divide-[#f1f0ef] overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white dark:divide-[#1a1a1a] dark:border-[#222] dark:bg-[#111]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#e7e5e4] dark:bg-[#333]" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-5 w-32 animate-pulse rounded-full bg-[#e7e5e4] dark:bg-[#1a1a1a]" />
                <span className="h-4 w-24 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#1a1a1a]" />
                <span className="ml-auto h-3 w-16 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#1a1a1a]" />
              </div>
              <span className="block h-4 w-48 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#1a1a1a]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <AdminLogsContent />
    </Suspense>
  );
}
