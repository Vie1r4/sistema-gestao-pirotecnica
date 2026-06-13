"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import { DataTable } from "@/app/components/ui/DataTable";
import { produtosCatalogColumns } from "@/app/produtos/_components/produtosColumns";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import {
  textoClassificacao,
  CLASSIFICACOES_RISCO,
  CATEGORIAS_PIROTECNICAS,
  FILTROS_TECNICOS,
  CALIBRES,
  type Produto,
} from "@/app/lib/produtos";
import { fetchList, mapApiToProduto } from "@/app/lib/produtosApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { btnPrimary, btnSecondary, inputClassSearch as inputClass } from "@/app/components/ui/tokens";

function ProdutosContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const permissions = user?.permissions ?? [];
  const canGerirProdutos = permissions.includes("produtos.gerir");
  const [pesquisa, setPesquisa] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [filtroTecnico, setFiltroTecnico] = useState("");
  const [calibre, setCalibre] = useState("");

  useEffect(() => {
    setPesquisa(searchParams.get("pesquisa") ?? "");
    setClassificacao(searchParams.get("classificacao") ?? "");
    setCategoria(searchParams.get("categoria") ?? "");
    setFiltroTecnico(searchParams.get("filtroTecnico") ?? "");
    setCalibre(searchParams.get("calibre") ?? "");
  }, [searchParams]);

  const {
    data: lista = [],
    isLoading: loadingApi,
    isRefetching,
    error: queryError,
  } = useQuery({
    queryKey: ["produtos", pesquisa, classificacao, categoria, filtroTecnico, calibre],
    queryFn: async (): Promise<Produto[]> => {
      const token = getToken();
      if (!token) return [];
      const r = await fetchList(token, {
        pesquisa,
        classificacao,
        categoria,
        filtroTecnico,
        calibre,
      });
      return (r.items ?? []).map((it) => mapApiToProduto(it as Record<string, unknown>));
    },
    staleTime: 30 * 1000,
    retry: 3,
    enabled: !!getToken(),
  });

  const temFiltros = pesquisa || classificacao || categoria || filtroTecnico || calibre;
  const criado = searchParams.get("criado") === "1";
  const columns = useMemo(() => produtosCatalogColumns(), []);

  const buildFilterUrl = () => {
    const p = new URLSearchParams();
    if (pesquisa) p.set("pesquisa", pesquisa);
    if (classificacao) p.set("classificacao", classificacao);
    if (categoria) p.set("categoria", categoria);
    if (filtroTecnico) p.set("filtroTecnico", filtroTecnico);
    if (calibre) p.set("calibre", calibre);
    return `/produtos?${p.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="content-container">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-[#1c1917] dark:text-white sm:text-3xl">
                Catálogo
              </h1>
              <p className="mt-1 flex items-center gap-2 text-[#57534e] dark:text-gray-400">
                Consulta dos produtos (artigos pirotécnicos/explosivos). Use os filtros para refinar a lista.
                {isRefetching && !loadingApi && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]" />
                    A atualizar
                  </span>
                )}
              </p>
            </div>
            {canGerirProdutos && (
              <div className="flex flex-wrap gap-2">
                <Link href="/produtos/gerir" className={btnPrimary}>
                  Gerir produtos
                </Link>
                <Link href="/produtos/compilados" className={btnSecondary}>
                  Gerir compilados
                </Link>
              </div>
            )}
          </motion.div>

          {criado && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mt-5 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              Produto criado com sucesso.
            </motion.p>
          )}

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
                : "Erro ao carregar catálogo."}
            </motion.p>
          )}

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
              id="produtos-filtros-form"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = buildFilterUrl();
              }}
              className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
            >
              <input type="hidden" name="pesquisa" value={pesquisa} />
              <input type="hidden" name="classificacao" value={classificacao} />
              <input type="hidden" name="categoria" value={categoria} />
              <input type="hidden" name="filtroTecnico" value={filtroTecnico} />
              <input type="hidden" name="calibre" value={calibre} />
              <div>
                <label htmlFor="produtos-pesquisa" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pesquisa (nome)
                </label>
                <input
                  id="produtos-pesquisa"
                  type="search"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  className={`${inputClass} mt-1 w-full`}
                  placeholder="Nome do produto"
                />
              </div>
              <div>
                <label htmlFor="produtos-classificacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Classificação de risco
                </label>
                <select
                  id="produtos-classificacao"
                  value={classificacao}
                  onChange={(e) => setClassificacao(e.target.value)}
                  className={`${inputClass} mt-1 w-full`}
                >
                  <option value="">Todas</option>
                  {CLASSIFICACOES_RISCO.map((c) => (
                    <option key={c} value={c}>{textoClassificacao(c)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="produtos-categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Categoria
                </label>
                <select
                  id="produtos-categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className={`${inputClass} mt-1 w-full`}
                >
                  <option value="">Todas</option>
                  {CATEGORIAS_PIROTECNICAS.map((c) => (
                    <option key={c.value} value={c.value}>{c.text}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="produtos-filtro" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filtro técnico
                </label>
                <select
                  id="produtos-filtro"
                  value={filtroTecnico}
                  onChange={(e) => setFiltroTecnico(e.target.value)}
                  className={`${inputClass} mt-1 w-full`}
                >
                  <option value="">Todos</option>
                  {FILTROS_TECNICOS.map((f) => (
                    <option key={f.value} value={f.value}>{f.text}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="produtos-calibre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Calibre
                </label>
                <select
                  id="produtos-calibre"
                  value={calibre}
                  onChange={(e) => setCalibre(e.target.value)}
                  className={`${inputClass} mt-1 w-full`}
                >
                  <option value="">Todos</option>
                  {CALIBRES.map((c) => (
                    <option key={c.value} value={c.value}>{c.text}</option>
                  ))}
                </select>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="submit"
                form="produtos-filtros-form"
                className={btnPrimary}
              >
                Filtrar
              </button>
              {temFiltros && (
                <Link href="/produtos" className={btnSecondary}>
                  Limpar filtros
                </Link>
              )}
            </div>
            <p className="mt-4 text-sm text-[#57534e] dark:text-gray-400">
              {loadingApi ? "A carregar… " : ""}{lista.length} produto(s)
            </p>
            <div className="mt-6">
              {loadingApi ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-[#57534e] dark:text-gray-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
                  <span>A carregar catálogo…</span>
                </div>
              ) : (
                <DataTable<Produto>
                  columns={columns}
                  data={lista}
                  pageSize={15}
                  showSearch={false}
                  emptyMessage={
                    !getToken()
                      ? "Inicie sessão para ver o catálogo."
                      : "Nenhum resultado para os filtros aplicados."
                  }
                />
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function ProdutosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <ProdutosContent />
    </Suspense>
  );
}
