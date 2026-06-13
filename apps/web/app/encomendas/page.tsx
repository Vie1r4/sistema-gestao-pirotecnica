"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { FilterFn } from "@tanstack/react-table";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import EmptyState from "@/app/components/ui/EmptyState";
import PageHeader from "@/app/components/ui/PageHeader";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { DataTable } from "@/app/components/ui/DataTable";
import { encomendasColumns } from "@/app/encomendas/_components/encomendasColumns";
import {
  ESTADOS_ENCOMENDA,
  mapApiToEncomendaLinha,
  type EstadoEncomenda,
  type EncomendaLinha,
} from "@/app/lib/encomendas";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { fetchList } from "@/app/lib/encomendasApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { btnPrimary, inputClassSearch } from "@/app/components/ui/tokens";
import { matchesNomeOuNumero } from "@/app/lib/tableSearch";

type EncomendasApiData = {
  lista: EncomendaLinha[];
  totaisPorEstado: Record<string, number>;
  totalGeral: number;
  totalRegistos: number;
  paginaAtual: number;
  itensPorPagina: number;
};

const ITENS_POR_PAGINA = 20;
const MAX_PAGINAS_VISIVEIS = 10;

const encomendaFilterFn: FilterFn<EncomendaLinha> = (row, _columnId, filterValue) =>
  matchesNomeOuNumero(String(filterValue ?? ""), {
    id: row.original.id,
    nome: row.original.nome,
  });

function EncomendasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const canGerirEncomendas = (user?.permissions ?? []).includes("encomendas.gerir");
  const columns = useMemo(() => encomendasColumns(), []);
  const [pesquisa, setPesquisa] = useState("");

  const estadoParam = searchParams.get("estado") ?? "Todos";
  const estado = (estadoParam === "Todos" || estadoParam === "Ativas" ? estadoParam : estadoParam) as EstadoEncomenda | "Todos" | "Ativas";
  const pagina = Math.max(1, parseInt(searchParams.get("pagina") ?? "1", 10) || 1);

  const {
    data: apiData,
    isLoading: apiLoading,
    isRefetching,
    error: queryError,
  } = useQuery({
    queryKey: ["encomendas", estado, pagina],
    queryFn: async (): Promise<EncomendasApiData> => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");
      const apiEstado = estado === "Todos" ? "" : estado === "Ativas" ? "Ativas" : estado;
      const data = await fetchList(token, {
        estado: apiEstado,
        pagina,
        itensPorPagina: ITENS_POR_PAGINA,
      });
      const items = (data.items ?? []) as Array<Record<string, unknown>>;
      const lista = items.map(mapApiToEncomendaLinha);
      return {
        lista,
        totaisPorEstado: (data.totaisPorEstado ?? {}) as Record<string, number>,
        totalGeral: Number(data.totalGeral ?? 0),
        totalRegistos: Number(data.totalRegistos ?? lista.length),
        paginaAtual: Number(data.paginaAtual ?? pagina),
        itensPorPagina: Number(data.itensPorPagina ?? ITENS_POR_PAGINA),
      };
    },
    staleTime: 30 * 1000,
    retry: 3,
    enabled: !!getToken(),
  });

  const token = getToken();
  const totais = apiData?.totaisPorEstado ?? {};
  const totalGeral = apiData?.totalGeral ?? 0;
  const totalAtivas =
    (totais["Pendente"] ?? 0) + (totais["Aceite"] ?? 0) + (totais["Em preparação"] ?? 0);
  const lista: EncomendaLinha[] = apiData?.lista ?? [];
  const total = apiData?.totalRegistos ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
  const start = total === 0 ? 0 : (pagina - 1) * ITENS_POR_PAGINA + 1;
  const end = Math.min(pagina * ITENS_POR_PAGINA, total);

  const listaFiltrada = useMemo(
    () => lista.filter((enc) => matchesNomeOuNumero(pesquisa, { id: enc.id, nome: enc.nome })),
    [lista, pesquisa]
  );

  const setEstadoPagina = (novoEstado: EstadoEncomenda | "Todos" | "Ativas", novaPagina: number = 1) => {
    const p = new URLSearchParams();
    p.set("estado", novoEstado);
    p.set("pagina", String(novaPagina));
    router.push(`/encomendas?${p.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset">
        <div className="content-container">
          <PageHeader
            title="Encomendas"
            subtitle={
              <>
                Lista de encomendas por estado e paginação.
                {isRefetching && !apiLoading && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]" />
                    A atualizar
                  </span>
                )}
              </>
            }
            actions={
              canGerirEncomendas ? (
                <Link href="/encomendas/novo" className={btnPrimary}>
                  Nova encomenda
                </Link>
              ) : undefined
            }
          />

          {queryError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400"
            >
              {queryError instanceof Error
                ? queryError.message === "Failed to fetch"
                  ? "Falha de rede. Verifique se a API está a correr (NEXT_PUBLIC_API_URL) e se CORS permite pedidos do frontend."
                  : queryError.message
                : "Erro ao carregar encomendas."}
            </motion.p>
          )}

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] sm:p-6"
          >
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label htmlFor="encomendas-estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado
                </label>
                <select
                  id="encomendas-estado"
                  value={estado}
                  onChange={(e) => setEstadoPagina(e.target.value as EstadoEncomenda | "Todos" | "Ativas")}
                  className="mt-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white"
                >
                  <option value="Todos">Todos ({totalGeral})</option>
                  <option value="Ativas">Ativas ({totalAtivas})</option>
                  {ESTADOS_ENCOMENDA.map((e) => (
                    <option key={e} value={e}>
                      {e} ({(totais[e] ?? 0)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[200px] flex-1 sm:max-w-xs">
                <label htmlFor="encomendas-pesquisa" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pesquisar
                </label>
                <input
                  id="encomendas-pesquisa"
                  type="search"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  placeholder="Nome ou n.º da encomenda…"
                  className={`${inputClassSearch} mt-1 w-full`}
                />
              </div>
            </div>

            <p className="mt-4 flex items-center gap-2 text-sm text-[#57534e] dark:text-gray-400">
              {apiLoading ? "A carregar… " : ""}
              A mostrar {start}–{end} de {total}
              {pesquisa.trim() && lista.length > 0 && (
                <span> · {listaFiltrada.length} na página com a pesquisa</span>
              )}
            </p>

            <div className="mt-6">
              {apiLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-[#57534e] dark:text-gray-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
                  <span>A carregar encomendas…</span>
                </div>
              ) : lista.length === 0 ? (
                <EmptyState
                  title={!token ? "Inicie sessão para ver as encomendas." : "Nenhuma encomenda encontrada."}
                  action={
                    token && canGerirEncomendas ? (
                      <Link href="/encomendas/novo" className={btnPrimary}>
                        Nova encomenda
                      </Link>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  <div className="space-y-3 lg:hidden">
                    {listaFiltrada.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[#57534e] dark:text-gray-400">
                        Nenhum resultado para a pesquisa.
                      </p>
                    ) : (
                      listaFiltrada.map((enc) => (
                        <Link
                          key={enc.id}
                          href={`/encomendas/${enc.id}`}
                          className="block rounded-xl border border-[#e7e5e4] bg-white p-4 dark:border-[#1f1f1f] dark:bg-[#111]"
                        >
                          <p className="font-medium text-[#1c1917] dark:text-white">
                            {enc.nome?.trim() || `Encomenda #${enc.id}`}
                          </p>
                          <p className="mt-0.5 text-sm text-[#57534e] dark:text-gray-400">
                            #{enc.id} · {enc.clienteNome ?? enc.clienteId}
                          </p>
                          <StatusBadge label={String(enc.estado)} className="mt-2" />
                          <p className="mt-1 text-xs text-[#f97316]">Ver detalhes →</p>
                        </Link>
                      ))
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <DataTable<EncomendaLinha>
                      columns={columns}
                      data={lista}
                      pageSize={ITENS_POR_PAGINA}
                      showSearch={false}
                      showPagination={false}
                      globalFilter={pesquisa}
                      onGlobalFilterChange={setPesquisa}
                      globalFilterFn={encomendaFilterFn}
                      emptyMessage="Nenhuma encomenda encontrada."
                      noResultsMessage="Nenhum resultado para a pesquisa."
                    />
                  </div>
                </>
              )}
            </div>

            {lista.length > 0 && totalPaginas > 1 && (
              <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Paginação">
                <button
                  type="button"
                  onClick={() => setEstadoPagina(estado, pagina - 1)}
                  disabled={pagina <= 1}
                  className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-[#333]"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(MAX_PAGINAS_VISIVEIS, totalPaginas) }, (_, i) => {
                  const p =
                    pagina <= MAX_PAGINAS_VISIVEIS / 2
                      ? i + 1
                      : Math.max(1, pagina - Math.floor(MAX_PAGINAS_VISIVEIS / 2) + i);
                  if (p > totalPaginas) return null;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEstadoPagina(estado, p)}
                      className={`rounded-xl px-3 py-1.5 text-sm ${p === pagina ? "bg-[#f97316] text-black" : "border border-gray-300 dark:border-[#333]"}`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setEstadoPagina(estado, pagina + 1)}
                  disabled={pagina >= totalPaginas}
                  className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-[#333]"
                >
                  Próximo
                </button>
              </nav>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function EncomendasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <EncomendasContent />
    </Suspense>
  );
}
