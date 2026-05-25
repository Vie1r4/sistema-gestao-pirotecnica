"use client";

import { Suspense, useCallback } from "react";
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
import { downloadLogsCsv } from "@/app/admin/lib/exportLogsCsv";
import AdminLogsFilters, { type LogsFilterState } from "./AdminLogsFilters";
import LogsList from "./_components/LogsList";

function AdminLogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const currentFilters: LogsFilterState = {
    acao,
    userName,
    entidade,
    dataInicio,
    dataFim,
  };

  return (
    <div className={`min-h-screen ${adminTheme.pageBg}`}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <AdminPageHeader
          title="Logs do sistema"
          description="Auditoria de todas as acções registadas na plataforma."
          breadcrumb={buildBreadcrumbs("/admin/logs")}
          actions={
            data && data.items.length > 0 ? (
              <button
                type="button"
                onClick={() => downloadLogsCsv(data.items)}
                className={adminTheme.btnSecondary}
              >
                Exportar CSV
              </button>
            ) : undefined
          }
        />

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

        {isLoading && (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
          </div>
        )}

        {!isLoading && !isError && data && (
          <LogsList
            items={data.items}
            total={data.totalRegistos}
            pagina={data.paginaAtual}
            itensPorPagina={data.itensPorPagina}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
        )}
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
