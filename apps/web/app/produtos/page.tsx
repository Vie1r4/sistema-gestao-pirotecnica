"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import EmptyState from "@/app/components/ui/EmptyState";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import {
  textoClassificacao,
  textoGrupo,
  textoFiltroTecnico,
  textoCalibre,
  CLASSIFICACOES_RISCO,
  GRUPOS_COMPATIBILIDADE,
  FILTROS_TECNICOS,
  CALIBRES,
  type Produto,
} from "@/app/lib/produtos";
import { fetchList, mapApiToProduto } from "@/app/lib/produtosApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const inputClass =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

function ProdutosContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const permissions = user?.permissions ?? [];
  const canGerirProdutos = permissions.includes("produtos.gerir");
  const [pesquisa, setPesquisa] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [grupoCompatibilidade, setGrupoCompatibilidade] = useState("");
  const [filtroTecnico, setFiltroTecnico] = useState("");
  const [calibre, setCalibre] = useState("");

  useEffect(() => {
    setPesquisa(searchParams.get("pesquisa") ?? "");
    setClassificacao(searchParams.get("classificacao") ?? "");
    setGrupoCompatibilidade(searchParams.get("grupoCompatibilidade") ?? "");
    setFiltroTecnico(searchParams.get("filtroTecnico") ?? "");
    setCalibre(searchParams.get("calibre") ?? "");
  }, [searchParams]);

  const {
    data: lista = [],
    isLoading: loadingApi,
    isRefetching,
    error: queryError,
  } = useQuery({
    queryKey: ["produtos", pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre],
    queryFn: async (): Promise<Produto[]> => {
      const token = getToken();
      if (!token) return [];
      const r = await fetchList(token, {
        pesquisa,
        classificacao,
        grupoCompatibilidade,
        filtroTecnico,
        calibre,
      });
      return (r.items ?? []).map((it) => mapApiToProduto(it as Record<string, unknown>));
    },
    staleTime: 30 * 1000,
    retry: 3,
    enabled: !!getToken(),
  });

  const temFiltros = pesquisa || classificacao || grupoCompatibilidade || filtroTecnico || calibre;
  const criado = searchParams.get("criado") === "1";

  const buildFilterUrl = () => {
    const p = new URLSearchParams();
    if (pesquisa) p.set("pesquisa", pesquisa);
    if (classificacao) p.set("classificacao", classificacao);
    if (grupoCompatibilidade) p.set("grupoCompatibilidade", grupoCompatibilidade);
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
              <input type="hidden" name="grupoCompatibilidade" value={grupoCompatibilidade} />
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
                <label htmlFor="produtos-grupo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grupo compatibilidade
                </label>
                <select
                  id="produtos-grupo"
                  value={grupoCompatibilidade}
                  onChange={(e) => setGrupoCompatibilidade(e.target.value)}
                  className={`${inputClass} mt-1 w-full`}
                >
                  <option value="">Todos</option>
                  {GRUPOS_COMPATIBILIDADE.map((g) => (
                    <option key={g.value} value={g.value}>{g.text}</option>
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
              {lista.length === 0 ? (
                <EmptyState
                  title={
                    !getToken()
                      ? "Inicie sessão para ver o catálogo."
                      : "Nenhum resultado para os filtros aplicados."
                  }
                  description={
                    getToken()
                      ? "Ajuste os filtros ou use Gerir produtos para criar produtos."
                      : undefined
                  }
                  action={
                    getToken() && canGerirProdutos ? (
                      <Link href="/produtos/gerir" className={btnPrimary}>
                        Gerir produtos
                      </Link>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  {/* Vista em cards em ecrãs pequenos */}
                  <div className="space-y-3 lg:hidden">
                    {lista.map((pr) => (
                      <Link
                        key={pr.id}
                        href={`/produtos/${pr.id}`}
                        className="card-hover block rounded-xl border border-[#e7e5e4] bg-white p-4 dark:border-[#1f1f1f] dark:bg-[#111]"
                      >
                        <p className="font-medium text-[#1c1917] dark:text-white">{pr.nome}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#57534e] dark:text-gray-400">
                          <span>Risco: {textoClassificacao(pr.familiaRisco)}</span>
                          <span>Grupo: {textoGrupo(pr.grupoCompatibilidade)}</span>
                          <span>NEM: {pr.nemPorUnidade} kg/un</span>
                        </div>
                        <p className="mt-1 text-xs text-[#f97316]">Ver detalhes →</p>
                      </Link>
                    ))}
                  </div>
                  {/* Tabela em ecrãs grandes */}
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#e7e5e4] dark:border-[#222]">
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Nome</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Classif. risco</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Grupo</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Filtro técn.</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Calibre</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">NEM (kg/un)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lista.map((pr) => (
                          <tr
                            key={pr.id}
                            className="border-b border-[#f5f5f4] transition-colors hover:bg-[#fafaf9] dark:border-[#1a1a1a] dark:hover:bg-[#0a0a0a]"
                          >
                            <td className="py-2 pr-4 font-medium text-[#1c1917] dark:text-white">{pr.nome}</td>
                            <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{textoClassificacao(pr.familiaRisco)}</td>
                            <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{textoGrupo(pr.grupoCompatibilidade)}</td>
                            <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{textoFiltroTecnico(pr.filtroTecnico)}</td>
                            <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{textoCalibre(pr.calibre)}</td>
                            <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{pr.nemPorUnidade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
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
