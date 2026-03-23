"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { ColumnDef } from "@tanstack/react-table";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { DataTable } from "@/app/components/ui/DataTable";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { labelPerfilRisco } from "@/app/lib/armazem";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

import { apiPath } from "@/app/lib/apiConfig";

const API_PAIOL = apiPath("api/paiol");

/** Paiol com ocupação (vindo da API) para a lista do Armazém */
type PaiolComOcupacao = {
  id: string;
  nome: string;
  localizacao?: string;
  perfilRisco: string;
  estado: string;
  percentagemOcupacao: number;
};

function armazemColumns(): ColumnDef<PaiolComOcupacao, unknown>[] {
  return [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => (
        <Link
          href={`/armazem/${row.original.id}/conteudo`}
          className="text-[#f97316] transition-[color] duration-200 hover:underline"
        >
          {row.original.nome}
        </Link>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "localizacao",
      header: "Localização (cidade)",
      cell: ({ getValue }) => (
        <span className="text-[#57534e] dark:text-gray-400">{getValue() as string ?? "—"}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "perfilRisco",
      header: "Perfil de risco",
      cell: ({ getValue }) => (
        <span className="text-[#57534e] dark:text-gray-400">{labelPerfilRisco(getValue() as string)}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "percentagemOcupacao",
      header: "Ocupação",
      cell: ({ row }) => {
        const pct = Math.min(100, Math.max(0, row.original.percentagemOcupacao));
        return (
          <div className="flex min-w-[120px] max-w-[200px] items-center gap-2">
            <div
              className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-[#333]"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Ocupação do paiol: ${pct.toFixed(0)}%`}
            >
              <div
                className="h-full rounded-full bg-[#f97316] transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 text-xs text-[#57534e] dark:text-gray-400">{pct.toFixed(0)}%</span>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => (
        <span className="text-[#57534e] dark:text-gray-400">{getValue() as string}</span>
      ),
      enableSorting: true,
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => (
        <Link
          href={`/armazem/${row.original.id}`}
          data-button
          className="text-[#f97316] transition-[color] duration-200 hover:underline"
        >
          Detalhes
        </Link>
      ),
      enableSorting: false,
    },
  ];
}

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

function mapApiToPaiolComOcupacao(item: Record<string, unknown>): PaiolComOcupacao {
  const p = (item.Paiol ?? item.paiol ?? {}) as Record<string, unknown>;
  const pct = Number(item.PercentagemOcupacao ?? item.percentagemOcupacao ?? 0);
  return {
    id: String(p.Id ?? p.id ?? ""),
    nome: String(p.Nome ?? p.nome ?? "").trim() || "—",
    localizacao: (p.Localizacao ?? p.localizacao) as string | undefined,
    perfilRisco: String(p.PerfilRisco ?? p.perfilRisco ?? ""),
    estado: String(p.Estado ?? p.estado ?? ""),
    percentagemOcupacao: Number.isFinite(pct) ? pct : 0,
  };
}

function ArmazemContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const permissions = user?.permissions ?? [];
  const canGerirArmazem = permissions.includes("armazem.gerir");
  const eliminado = searchParams.get("eliminado") === "1";
  const columns = useMemo(() => armazemColumns(), []);

  const {
    data: paiois = [],
    isLoading: loading,
    isRefetching,
    error: queryError,
  } = useQuery({
    queryKey: ["armazem", "paiol"],
    queryFn: async (): Promise<PaiolComOcupacao[]> => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      const res = await fetch(API_PAIOL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        router.replace("/login");
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      if (!res.ok) throw new Error(res.status === 404 ? "Não encontrado" : `Erro ${res.status}`);
      const data = (await res.json()) as unknown;
      const list = Array.isArray(data) ? data : [];
      return list.map((item: Record<string, unknown>) => mapApiToPaiolComOcupacao(item));
    },
    staleTime: 30 * 1000,
    retry: 3,
    enabled: !!getToken(),
  });

  const error =
    queryError instanceof Error
      ? queryError.message === "Failed to fetch"
        ? "Falha de rede. Verifique se a API está a correr (NEXT_PUBLIC_API_URL) e se CORS permite pedidos do frontend."
        : queryError.message
      : queryError
        ? "Erro ao carregar paióis."
        : null;

  const alerta = eliminado ? "Paiol eliminado com sucesso." : null;

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-[#1c1917] dark:text-white sm:text-3xl">
                Armazém
              </h1>
              <p className="mt-1 flex items-center gap-2 text-[#57534e] dark:text-gray-400">
                Paióis com acesso, ocupação MLE e ligações para stock e movimentos.
                {isRefetching && !loading && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]" />
                    A atualizar
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/armazem/stock" className={btnSecondary}>
                Stock
              </Link>
              {canGerirArmazem && (
                <Link href="/armazem/movimentos" className={btnSecondary}>
                  Movimentos
                </Link>
              )}
              {canGerirArmazem && (
                <Link href="/armazem/gestao" className={btnPrimary}>
                  Gestão de Paióis
                </Link>
              )}
            </div>
          </motion.div>

          {alerta && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mt-5 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              {alerta}
            </motion.p>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400"
            >
              {error}
            </motion.p>
          )}

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] dark:shadow-none sm:p-6"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-[#57534e] dark:text-gray-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
                <span>A carregar paióis…</span>
              </div>
            ) : paiois.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#e7e5e4] bg-[#fafaf9] py-12 text-center dark:border-[#333] dark:bg-[#0a0a0a]">
                <p className="text-[#57534e] dark:text-gray-400">
                  Não tem acesso a nenhum paiol ou ainda não existem paióis. Os administradores podem criar paióis em Gestão de Paióis.
                </p>
                {canGerirArmazem && (
                  <Link href="/armazem/gestao" className={btnPrimary + " mt-4 inline-block"}>
                    Ir para Gestão de Paióis
                  </Link>
                )}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={paiois}
                pageSize={10}
                searchPlaceholder="Pesquisar paióis…"
                emptyMessage="Não tem acesso a nenhum paiol ou ainda não existem paióis."
                noResultsMessage="Nenhum paiol encontrado para a pesquisa."
              />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function ArmazemPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <ArmazemContent />
    </Suspense>
  );
}
