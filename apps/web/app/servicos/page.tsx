"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import EmptyState from "@/app/components/ui/EmptyState";
import PageHeader from "@/app/components/ui/PageHeader";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { fetchServicosFromApi } from "@/app/lib/servicos";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { btnPrimary } from "@/app/components/ui/tokens";

type ListItem = {
  id: string;
  clienteId: string;
  dataServico: string;
  local?: string;
  publicoPrivado?: string;
  cliente?: { id: string; nome: string } | null;
  encomenda?: { id: string; estado?: string } | null;
  coordenadorPirotecnico?: { id: string; nomeCompleto: string } | null;
};

type ServicosApiData = {
  lista: ListItem[];
  total: number;
  clientes: Array<{ id: string; nome: string }>;
};

const ITENS_POR_PAGINA = 20;
const MAX_PAGINAS_VISIVEIS = 10;

function ServicosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const permissions = user?.permissions ?? [];
  const canGerirServicos = permissions.includes("servicos.gerir");

  const clienteId = searchParams.get("clienteId") ?? undefined;
  const dataDesde = searchParams.get("dataDesde") ?? "";
  const dataAte = searchParams.get("dataAte") ?? "";
  const pagina = Math.max(1, parseInt(searchParams.get("pagina") ?? "1", 10) || 1);

  const filters =
    clienteId || dataDesde || dataAte
      ? { clienteId, dataDesde: dataDesde || undefined, dataAte: dataAte || undefined }
      : undefined;

  const {
    data: apiData,
    isLoading: loadingApi,
    isRefetching,
    error: queryError,
  } = useQuery({
    queryKey: ["servicos", clienteId, dataDesde, dataAte, pagina],
    queryFn: async (): Promise<ServicosApiData> => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");
      const res = await fetchServicosFromApi(token, filters, pagina, ITENS_POR_PAGINA);
      return {
        lista: res.lista as ListItem[],
        total: res.total,
        clientes: (res.clientes ?? []).map((c: { id?: number; nome?: string }) => ({
          id: String(c.id ?? ""),
          nome: String(c.nome ?? ""),
        })),
      };
    },
    staleTime: 30 * 1000,
    retry: 3,
    enabled: !!getToken(),
  });

  const lista = apiData?.lista ?? [];
  const total = apiData?.total ?? 0;
  const clientes = apiData?.clientes ?? [];
  const totalPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
  const start = total === 0 ? 0 : (pagina - 1) * ITENS_POR_PAGINA + 1;
  const end = Math.min(pagina * ITENS_POR_PAGINA, total);

  const setFiltros = (updates: { clienteId?: string; dataDesde?: string; dataAte?: string; pagina?: number }) => {
    const p = new URLSearchParams(searchParams.toString());
    if (updates.clienteId !== undefined) {
      if (updates.clienteId) p.set("clienteId", updates.clienteId);
      else p.delete("clienteId");
    }
    if (updates.dataDesde !== undefined) {
      if (updates.dataDesde) p.set("dataDesde", updates.dataDesde);
      else p.delete("dataDesde");
    }
    if (updates.dataAte !== undefined) {
      if (updates.dataAte) p.set("dataAte", updates.dataAte);
      else p.delete("dataAte");
    }
    if (updates.pagina !== undefined) p.set("pagina", String(updates.pagina));
    router.push(`/servicos?${p.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset" >
        <div className="content-container">
          <PageHeader
            title="Serviços"
            subtitle={
              <>
                Operações no terreno. Cada serviço está ligado a uma encomenda concluída.
                {isRefetching && !loadingApi && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]" />
                    A atualizar
                  </span>
                )}
              </>
            }
            actions={
              canGerirServicos ? (
                <Link href="/servicos/novo" className={btnPrimary}>
                  Novo serviço
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
                : "Erro ao carregar serviços."}
            </motion.p>
          )}

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] sm:p-6"
          >
            {/* Filtros GET: Cliente, Data desde, Data até, Filtrar (pagina=1) */}
            <form
              className="flex flex-wrap items-end gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setFiltros({ pagina: 1 });
              }}
            >
              <div>
                <label htmlFor="servicos-cliente" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cliente
                </label>
                <select
                  id="servicos-cliente"
                  value={clienteId ?? ""}
                  onChange={(e) => setFiltros({ clienteId: e.target.value || undefined, pagina: 1 })}
                  className="mt-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white"
                >
                  <option value="">— Todos —</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="servicos-desde" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data desde
                </label>
                <input
                  id="servicos-desde"
                  type="date"
                  value={dataDesde}
                  onChange={(e) => setFiltros({ dataDesde: e.target.value || undefined, pagina: 1 })}
                  className="mt-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="servicos-ate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data até
                </label>
                <input
                  id="servicos-ate"
                  type="date"
                  value={dataAte}
                  onChange={(e) => setFiltros({ dataAte: e.target.value || undefined, pagina: 1 })}
                  className="mt-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white"
                />
              </div>
              <button type="submit" className={btnPrimary}>
                Filtrar
              </button>
            </form>

            <p className="mt-4 flex items-center gap-2 text-sm text-[#57534e] dark:text-gray-400">
              {loadingApi ? "A carregar… " : ""}
              A mostrar {start}–{end} de {total}
            </p>

            <div className="mt-6 overflow-x-auto">
              {loadingApi ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-[#57534e] dark:text-gray-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
                  <span>A carregar serviços…</span>
                </div>
              ) : lista.length === 0 ? (
                <EmptyState
                  title="Nenhum serviço encontrado."
                  action={
                    canGerirServicos ? (
                      <Link href="/servicos/novo" className={btnPrimary}>
                        Novo serviço
                      </Link>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  <div className="space-y-3 lg:hidden">
                    {lista.map((s) => (
                      <Link
                        key={s.id}
                        href={`/servicos/${s.id}`}
                        className="block rounded-xl border border-[#e7e5e4] bg-white p-4 dark:border-[#1f1f1f] dark:bg-[#111]"
                      >
                        <p className="font-medium text-[#1c1917] dark:text-white">#{s.id}</p>
                        <p className="mt-0.5 text-sm text-[#57534e] dark:text-gray-400">{s.cliente?.nome ?? s.clienteId}</p>
                        <p className="mt-0.5 text-xs text-[#57534e] dark:text-gray-400">
                          {new Date(s.dataServico).toLocaleDateString("pt-PT")}
                          {s.publicoPrivado ? ` · ${s.publicoPrivado}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-[#f97316]">Ver detalhes →</p>
                      </Link>
                    ))}
                  </div>
                  <div className="hidden lg:block">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#e7e5e4] dark:border-[#222]">
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">N.º</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Cliente</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Data serviço</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Local</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Público/Privado</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Coordenador pirotécnico</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Detalhes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lista.map((s) => (
                          <tr
                            key={s.id}
                            className="border-b border-[#f5f5f4] transition-colors hover:bg-[#fafaf9] dark:border-[#1a1a1a] dark:hover:bg-[#0a0a0a]"
                          >
                            <td className="py-2 pr-4 font-medium text-[#1c1917] dark:text-white">{s.id}</td>
                            <td className="py-2 pr-4 text-[#57534e] dark:text-gray-400">{s.cliente?.nome ?? s.clienteId}</td>
                            <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">
                              {new Date(s.dataServico).toLocaleDateString("pt-PT")}
                            </td>
                            <td className="max-w-[12rem] truncate py-2 pr-4 text-[#57534e] dark:text-gray-400">
                              {s.local ?? "—"}
                            </td>
                            <td className="py-2 pr-4 text-[#57534e] dark:text-gray-400">{s.publicoPrivado ?? "—"}</td>
                            <td className="py-2 pr-4 text-[#57534e] dark:text-gray-400">
                              {s.coordenadorPirotecnico?.nomeCompleto ?? "—"}
                            </td>
                            <td className="py-2 pr-4">
                              <Link href={`/servicos/${s.id}`} className="text-[#f97316] hover:underline">
                                Detalhes
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {lista.length > 0 && totalPaginas > 1 && (
              <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Paginação">
                <button
                  type="button"
                  onClick={() => setFiltros({ pagina: pagina - 1 })}
                  disabled={pagina <= 1}
                  className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-[#333]"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(MAX_PAGINAS_VISIVEIS, totalPaginas) }, (_, i) => {
                  const p =
                    pagina <= MAX_PAGINAS_VISIVEIS / 2
                      ? i + 1
                      : Math.min(totalPaginas, pagina + i - Math.floor(MAX_PAGINAS_VISIVEIS / 2));
                  if (p < 1) return null;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFiltros({ pagina: p })}
                      className={`rounded-xl px-3 py-1.5 text-sm ${
                        p === pagina
                          ? "bg-[#f97316] text-black"
                          : "border border-gray-300 dark:border-[#333]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setFiltros({ pagina: pagina + 1 })}
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

export default function ServicosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <ServicosContent />
    </Suspense>
  );
}
