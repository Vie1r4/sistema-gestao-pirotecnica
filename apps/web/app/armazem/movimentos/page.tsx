"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { ColumnDef } from "@tanstack/react-table";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { DataTable } from "@/app/components/ui/DataTable";
import { getToken } from "@/app/lib/auth";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { fetchPaiolMovimentos } from "@/app/lib/paiolApi";

const ITENS_POR_PAGINA = 20;
const inputClass =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";

type PaiolOption = { id: string; nome: string };

type EntradaRow = {
  id: number;
  paiolId: number;
  produtoId: number;
  quantidade: number;
  dataEntrada: string;
  /** Preenchido pelo servidor (preferível aos maps por userId). */
  registadoPor?: string;
  RegistadoPor?: string;
  funcionarioRegistouUserId?: string;
  numeroLote?: string;
  paiol?: { nome?: string; Nome?: string };
  produto?: { nome?: string; Nome?: string; nemPorUnidade?: number; NemPorUnidade?: number };
};

type SaidaRow = {
  id: number;
  paiolId: number;
  produtoId: number;
  quantidade: number;
  dataSaida: string;
  retiradoPor?: string;
  RetiradoPor?: string;
  funcionarioRetirouUserId?: string;
  encomendaId?: number;
  paiol?: { nome?: string; Nome?: string };
  produto?: { nome?: string; Nome?: string };
};

/** Linha para a DataTable de entradas (valores planos para pesquisa/ordenação) */
type EntradaDisplay = {
  id: number;
  dataEntrada: string;
  paiolNome: string;
  produtoNome: string;
  quantidade: number;
  nem: string;
  registadoPor: string;
};

/** Linha para a DataTable de saídas */
type SaidaDisplay = {
  id: number;
  dataSaida: string;
  paiolNome: string;
  produtoNome: string;
  quantidade: number;
  retiradoPor: string;
  encomendaId: number | null;
};

function entradasColumns(): ColumnDef<EntradaDisplay, unknown>[] {
  return [
    {
      accessorKey: "dataEntrada",
      header: "Data",
      cell: ({ getValue }) => (
        <span className="text-[#57534e] dark:text-gray-400">
          {new Date(getValue() as string).toLocaleString("pt-PT")}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "paiolNome",
      header: "Paiol",
      cell: ({ getValue }) => <span className="text-[#57534e] dark:text-gray-400">{getValue() as string}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "produtoNome",
      header: "Produto",
      cell: ({ getValue }) => <span className="text-[#57534e] dark:text-gray-400">{getValue() as string}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "quantidade",
      header: "Quantidade",
      cell: ({ getValue }) => <span className="text-[#57534e] dark:text-gray-400">{getValue() as number}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "nem",
      header: "NEM (kg)",
      cell: ({ getValue }) => <span className="text-[#57534e] dark:text-gray-400">{getValue() as string}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "registadoPor",
      header: "Registado por",
      cell: ({ getValue }) => <span className="text-[#57534e] dark:text-gray-400">{getValue() as string}</span>,
      enableSorting: true,
    },
  ];
}

function saidasColumns(
  buildUrl: (p: { tipo?: string; paiolId?: string; pagina?: number }) => string,
  tipo: string,
  paiolIdParam: string,
  pagina: number
): ColumnDef<SaidaDisplay, unknown>[] {
  return [
    {
      accessorKey: "dataSaida",
      header: "Data",
      cell: ({ getValue }) => (
        <span className="text-[#57534e] dark:text-gray-400">
          {new Date(getValue() as string).toLocaleString("pt-PT")}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "paiolNome",
      header: "Paiol",
      cell: ({ getValue }) => <span className="text-[#57534e] dark:text-gray-400">{getValue() as string}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "produtoNome",
      header: "Produto",
      cell: ({ getValue }) => <span className="text-[#57534e] dark:text-gray-400">{getValue() as string}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "quantidade",
      header: "Quantidade",
      cell: ({ getValue }) => <span className="text-[#57534e] dark:text-gray-400">{getValue() as number}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "retiradoPor",
      header: "Retirado por",
      cell: ({ getValue }) => <span className="text-[#57534e] dark:text-gray-400">{getValue() as string}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "encomendaId",
      header: "Encomenda",
      cell: ({ row }) => {
        const id = row.original.encomendaId;
        if (id == null) return <span className="text-[#57534e] dark:text-gray-400">—</span>;
        const voltar = encodeURIComponent(buildUrl({ tipo, paiolId: paiolIdParam || undefined, pagina }));
        return (
          <Link
            href={`/encomendas/${id}?voltar=${voltar}`}
            className="text-[#f97316] hover:underline"
          >
            #{id}
          </Link>
        );
      },
      enableSorting: false,
    },
  ];
}

type MovimentosApiData = {
  paiois: PaiolOption[];
  entradas: EntradaRow[];
  saidas: SaidaRow[];
  nomesEntradas: Record<string, string>;
  nomesSaidas: Record<string, string>;
  totalRegistos: number;
};

async function fetchMovimentos(
  tipo: string,
  paiolIdParam: string,
  pagina: number,
  router: ReturnType<typeof useRouter>
): Promise<MovimentosApiData> {
  const token = getToken();
  if (!token) {
    router.replace("/login");
    throw new Error("Não autenticado");
  }
  let data: Record<string, unknown>;
  try {
    data = await fetchPaiolMovimentos(token, {
      tipo: tipo || undefined,
      paiolId: paiolIdParam || undefined,
      pagina,
      itensPorPagina: ITENS_POR_PAGINA,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      router.replace("/login");
      throw new Error("Não autenticado");
    }
    throw e;
  }
  const paioisRaw = (data.paiois ?? data.paióis ?? []) as Array<{ id?: number; Id?: number; nome?: string; Nome?: string }>;
  return {
    paiois: paioisRaw.map((p) => ({
      id: String(p.id ?? p.Id ?? ""),
      nome: String(p.nome ?? p.Nome ?? ""),
    })),
    entradas: (data.entradas as EntradaRow[]) ?? [],
    saidas: (data.saidas as SaidaRow[]) ?? [],
    nomesEntradas: (data.nomesUtilizadoresEntradas as Record<string, string>) ?? {},
    nomesSaidas: (data.nomesUtilizadoresSaidas as Record<string, string>) ?? {},
    totalRegistos: Number(data.totalRegistos) ?? 0,
  };
}

function MovimentosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo") ?? "";
  const paiolIdParam = searchParams.get("paiolId") ?? "";
  const pagina = Math.max(1, parseInt(searchParams.get("pagina") ?? "1", 10) || 1);

  const { data: apiData, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ["movimentos", tipo, paiolIdParam, pagina],
    queryFn: () => fetchMovimentos(tipo, paiolIdParam, pagina, router),
    enabled: !!getToken(),
  });

  const paiois = apiData?.paiois ?? [];
  const totalRegistos = apiData?.totalRegistos ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistos / ITENS_POR_PAGINA));
  const error = queryError instanceof Error ? queryError.message : queryError ? "Erro ao carregar movimentos." : null;

  const buildUrl = (params: { tipo?: string; paiolId?: string; pagina?: number }) => {
    const p = new URLSearchParams();
    if (params.tipo) p.set("tipo", params.tipo);
    if (params.paiolId) p.set("paiolId", params.paiolId);
    if (params.pagina != null && params.pagina > 1) p.set("pagina", String(params.pagina));
    return `/armazem/movimentos?${p.toString()}`;
  };

  const entradasDisplay = useMemo<EntradaDisplay[]>(() => {
    const entradas = apiData?.entradas ?? [];
    const nomesEntradas = apiData?.nomesEntradas ?? {};
    return entradas.map((e) => {
      const nemU = e.produto?.nemPorUnidade ?? e.produto?.NemPorUnidade;
      const nem = nemU != null ? (e.quantidade * Number(nemU)).toFixed(2) : "—";
      const registadoPor =
        e.registadoPor ??
        e.RegistadoPor ??
        (e.funcionarioRegistouUserId
          ? (nomesEntradas[e.funcionarioRegistouUserId] ?? e.funcionarioRegistouUserId)
          : "—");
      const paiolNome = e.paiol?.nome ?? e.paiol?.Nome ?? String(e.paiolId);
      const produtoNome = e.produto?.nome ?? e.produto?.Nome ?? String(e.produtoId);
      return {
        id: e.id,
        dataEntrada: e.dataEntrada,
        paiolNome,
        produtoNome,
        quantidade: e.quantidade,
        nem,
        registadoPor,
      };
    });
  }, [apiData]);

  const saidasDisplay = useMemo<SaidaDisplay[]>(() => {
    const saidas = apiData?.saidas ?? [];
    const nomesSaidas = apiData?.nomesSaidas ?? {};
    return saidas.map((s) => {
      const retiradoPor =
        s.retiradoPor ??
        s.RetiradoPor ??
        (s.funcionarioRetirouUserId
          ? (nomesSaidas[s.funcionarioRetirouUserId] ?? s.funcionarioRetirouUserId)
          : "—");
      const paiolNome = s.paiol?.nome ?? s.paiol?.Nome ?? String(s.paiolId);
      const produtoNome = s.produto?.nome ?? s.produto?.Nome ?? String(s.produtoId);
      return {
        id: s.id,
        dataSaida: s.dataSaida,
        paiolNome,
        produtoNome,
        quantidade: s.quantidade,
        retiradoPor,
        encomendaId: s.encomendaId ?? null,
      };
    });
  }, [apiData]);

  const columnsEntradas = useMemo(() => entradasColumns(), []);
  const columnsSaidas = useMemo(
    () => saidasColumns(buildUrl, tipo, paiolIdParam, pagina),
    [tipo, paiolIdParam, pagina]
  );

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-[#1c1917] dark:text-white sm:text-3xl">
                Movimentos
              </h1>
              <p className="mt-1 text-[#57534e] dark:text-gray-400">
                Consultar entradas e saídas de stock nos paióis.
              </p>
            </div>
            <Link
              href="/armazem"
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]"
            >
              Voltar ao Armazém
            </Link>
          </motion.div>

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] sm:p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtros
            </h2>
            <form
              method="get"
              action="/armazem/movimentos"
              className="mt-4 flex flex-wrap items-end gap-4"
            >
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de movimento
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={tipo}
                  onChange={(e) => {
                    const v = e.target.value || undefined;
                    router.push(buildUrl({ tipo: v, paiolId: paiolIdParam || undefined }));
                  }}
                  className={`${inputClass} mt-1`}
                >
                  <option value="">— Seleccionar —</option>
                  <option value="Entradas">Entradas</option>
                  <option value="Saidas">Saídas</option>
                </select>
              </div>
              <div>
                <label htmlFor="paiolId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Paiol
                </label>
                <select
                  id="paiolId"
                  name="paiolId"
                  value={paiolIdParam}
                  onChange={(e) => {
                    const v = e.target.value || undefined;
                    router.push(buildUrl({ tipo, paiolId: v, pagina: 1 }));
                  }}
                  className={`${inputClass} mt-1 min-w-[180px]`}
                >
                  <option value="">Todos</option>
                  {paiois.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => router.push(buildUrl({ tipo, paiolId: paiolIdParam || undefined, pagina: 1 }))}
                className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
              >
                Ver
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                {error.includes("página HTML") && (
                  <>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                      Confirme que a API está a correr (variável <code className="rounded bg-red-100 px-1 dark:bg-red-900/50">NEXT_PUBLIC_API_URL</code> no .env). No browser (F12 → Network), verifique se o pedido à API aparece e qual o estado e a resposta.
                    </p>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Tentar novamente
                    </button>
                  </>
                )}
              </div>
            )}

            {loading && (
              <div className="mt-6 flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
              </div>
            )}

            {!loading && tipo === "Entradas" && (
              <>
                {totalPaginas > 1 && (
                  <p className="mt-6 text-sm text-[#57534e] dark:text-gray-400">
                    Página do servidor:{" "}
                    <span className="font-medium text-[#1c1917] dark:text-white">
                      {(pagina - 1) * ITENS_POR_PAGINA + 1}–
                      {Math.min(pagina * ITENS_POR_PAGINA, totalRegistos)}
                    </span>{" "}
                    de {totalRegistos}
                  </p>
                )}
                <div className="mt-4">
                  <DataTable<EntradaDisplay>
                    columns={columnsEntradas}
                    data={entradasDisplay}
                    pageSize={10}
                    searchPlaceholder="Pesquisar entradas…"
                    emptyMessage="Nenhuma entrada encontrada."
                    noResultsMessage="Nenhum resultado para a pesquisa."
                  />
                </div>
                {totalPaginas > 1 && (
                  <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
                    <div className="flex items-center gap-1 rounded-xl bg-[#f5f5f4] p-1 dark:bg-[#1a1a1a]">
                      <button
                        type="button"
                        onClick={() => router.push(buildUrl({ tipo, paiolId: paiolIdParam || undefined, pagina: pagina - 1 }))}
                        disabled={pagina <= 1}
                        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-[#1c1917] transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-white hover:text-[#f97316] hover:shadow-sm dark:text-white dark:hover:bg-[#222] dark:hover:text-[#f97316]"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Anterior
                      </button>
                      <span className="px-3 py-2 text-sm text-[#57534e] dark:text-gray-400">
                        Página {pagina} de {totalPaginas}
                      </span>
                      <button
                        type="button"
                        onClick={() => router.push(buildUrl({ tipo, paiolId: paiolIdParam || undefined, pagina: pagina + 1 }))}
                        disabled={pagina >= totalPaginas}
                        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-[#1c1917] transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-white hover:text-[#f97316] hover:shadow-sm dark:text-white dark:hover:bg-[#222] dark:hover:text-[#f97316]"
                      >
                        Próximo
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            {!loading && tipo === "Saidas" && (
              <>
                {totalPaginas > 1 && (
                  <p className="mt-6 text-sm text-[#57534e] dark:text-gray-400">
                    Página do servidor:{" "}
                    <span className="font-medium text-[#1c1917] dark:text-white">
                      {(pagina - 1) * ITENS_POR_PAGINA + 1}–
                      {Math.min(pagina * ITENS_POR_PAGINA, totalRegistos)}
                    </span>{" "}
                    de {totalRegistos}
                  </p>
                )}
                <div className="mt-4">
                  <DataTable<SaidaDisplay>
                    columns={columnsSaidas}
                    data={saidasDisplay}
                    pageSize={10}
                    searchPlaceholder="Pesquisar saídas…"
                    emptyMessage="Nenhuma saída encontrada."
                    noResultsMessage="Nenhum resultado para a pesquisa."
                  />
                </div>
                {totalPaginas > 1 && (
                  <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
                    <div className="flex items-center gap-1 rounded-xl bg-[#f5f5f4] p-1 dark:bg-[#1a1a1a]">
                      <button
                        type="button"
                        onClick={() => router.push(buildUrl({ tipo, paiolId: paiolIdParam || undefined, pagina: pagina - 1 }))}
                        disabled={pagina <= 1}
                        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-[#1c1917] transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-white hover:text-[#f97316] hover:shadow-sm dark:text-white dark:hover:bg-[#222] dark:hover:text-[#f97316]"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Anterior
                      </button>
                      <span className="px-3 py-2 text-sm text-[#57534e] dark:text-gray-400">
                        Página {pagina} de {totalPaginas}
                      </span>
                      <button
                        type="button"
                        onClick={() => router.push(buildUrl({ tipo, paiolId: paiolIdParam || undefined, pagina: pagina + 1 }))}
                        disabled={pagina >= totalPaginas}
                        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-[#1c1917] transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-white hover:text-[#f97316] hover:shadow-sm dark:text-white dark:hover:bg-[#222] dark:hover:text-[#f97316]"
                      >
                        Próximo
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            {!loading && !tipo && (
              <p className="mt-6 text-sm text-[#57534e] dark:text-gray-400">
                Selecione o tipo de movimento (Entradas ou Saídas) e opcionalmente um paiol, depois clique em Ver.
              </p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function MovimentosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <MovimentosContent />
    </Suspense>
  );
}
