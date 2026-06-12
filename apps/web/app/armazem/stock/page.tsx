"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { textoClassificacao, textoGrupo, textoFiltroTecnico, textoCalibre, CLASSIFICACOES_RISCO, GRUPOS_COMPATIBILIDADE, FILTROS_TECNICOS, CALIBRES } from "@/app/lib/produtos";
import { getToken } from "@/app/lib/auth";
import { fetchStock } from "@/app/lib/paiolApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { inputClassSearch as inputClass } from "@/app/components/ui/tokens";

type ProdutoLinha = { id: string; nome: string; familiaRisco?: string; grupoCompatibilidade?: string; filtroTecnico?: string; calibre?: string; nemPorUnidade: number };

function mapStockData(data: Awaited<ReturnType<typeof fetchStock>>): {
  items: ProdutoLinha[];
  stockMap: Map<string, number>;
} {
  const items = (data.items ?? []) as Array<Record<string, unknown>>;
  const produtosLinha: ProdutoLinha[] = items.map((p) => {
    const id = p.id ?? p.Id;
    const nome = p.nome ?? p.Nome;
    const nem = p.nemPorUnidade ?? p.NEMPorUnidade;
    return {
      id: String(id ?? ""),
      nome: String(nome ?? ""),
      familiaRisco: (p.familiaRisco ?? p.FamiliaRisco) as string | undefined,
      grupoCompatibilidade: (p.grupoCompatibilidade ?? p.GrupoCompatibilidade) as string | undefined,
      filtroTecnico: (p.filtroTecnico ?? p.FiltroTecnico) as string | undefined,
      calibre: (p.calibre ?? p.Calibre) as string | undefined,
      nemPorUnidade: Number(nem ?? 0),
    };
  });
  const stockRaw = (data.stockPorProduto ?? {}) as Record<string, number>;
  const stockMap = new Map<string, number>();
  for (const [k, v] of Object.entries(stockRaw)) stockMap.set(String(k), Number(v));
  return { items: produtosLinha, stockMap };
}

function StockContent() {
  const [mounted, setMounted] = useState(false);
  const [pesquisa, setPesquisa] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [grupoCompatibilidade, setGrupoCompatibilidade] = useState("");
  const [filtroTecnico, setFiltroTecnico] = useState("");
  const [calibre, setCalibre] = useState("");
  const token = getToken();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filterKey = useMemo(
    () => ({
      pesquisa: pesquisa || undefined,
      classificacao: classificacao || undefined,
      grupoCompatibilidade: grupoCompatibilidade || undefined,
      filtroTecnico: filtroTecnico || undefined,
      calibre: calibre || undefined,
    }),
    [pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre]
  );

  const { data: apiData, isLoading: loadingApi } = useQuery({
    queryKey: ["armazem", "stock", filterKey],
    queryFn: async () => {
      const t = getToken();
      if (!t) throw new Error("no-token");
      const raw = await fetchStock(t, filterKey);
      return mapStockData(raw);
    },
    enabled: mounted && !!token,
    staleTime: 30 * 1000,
    retry: 1,
  });

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  const produtos: ProdutoLinha[] = apiData?.items ?? [];
  const stockPorProduto = apiData?.stockMap ?? new Map<string, number>();

  const temFiltros = pesquisa || classificacao || grupoCompatibilidade || filtroTecnico || calibre;

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
            className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-[#1c1917] dark:text-white sm:text-3xl">
                Stock
              </h1>
              <p className="mt-1 text-[#57534e] dark:text-gray-400">
                Catálogo de produtos com quantidade agregada nos paióis registados.
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
              Filtrar produtos
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label htmlFor="pesquisa-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pesquisa (nome)
                </label>
                <input
                  id="pesquisa-stock"
                  type="search"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  className={`${inputClass} mt-1 w-full`}
                  placeholder="Nome do produto"
                />
              </div>
              <div>
                <label htmlFor="classificacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Classificação de risco
                </label>
                <select
                  id="classificacao"
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
                <label htmlFor="grupo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grupo compatibilidade
                </label>
                <select
                  id="grupo"
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
                <label htmlFor="filtroTecnico" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filtro técnico
                </label>
                <select
                  id="filtroTecnico"
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
                <label htmlFor="calibre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Calibre
                </label>
                <select
                  id="calibre"
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
            </div>
            {temFiltros && (
              <button
                type="button"
                onClick={() => {
                  setPesquisa("");
                  setClassificacao("");
                  setGrupoCompatibilidade("");
                  setFiltroTecnico("");
                  setCalibre("");
                }}
                className="mt-4 text-sm font-medium text-[#f97316] hover:underline"
              >
                Limpar filtros
              </button>
            )}
            <p className="mt-4 text-sm text-[#57534e] dark:text-gray-400">
              {loadingApi && getToken() ? "A carregar… " : ""}{produtos.length} produto(s)
            </p>
            <div className="mt-6">
              {/* Vista em cards em ecrãs pequenos */}
              <div className="space-y-3 lg:hidden">
                {produtos.map((pr) => (
                  <div
                    key={pr.id}
                    className="rounded-xl border border-[#e7e5e4] bg-white p-4 dark:border-[#1f1f1f] dark:bg-[#111]"
                  >
                    <p className="font-medium text-[#1c1917] dark:text-white">{pr.nome}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#57534e] dark:text-gray-400">
                      <span>Risco: {textoClassificacao(pr.familiaRisco ?? "")}</span>
                      <span>Grupo: {textoGrupo(pr.grupoCompatibilidade ?? "")}</span>
                      <span>NEM: {pr.nemPorUnidade} kg/un</span>
                      <span className="font-medium text-[#1c1917] dark:text-white">Stock: {stockPorProduto.get(pr.id) ?? 0}</span>
                    </div>
                  </div>
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
                      <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((pr) => (
                      <tr
                        key={pr.id}
                        className="border-b border-[#f5f5f4] transition-colors hover:bg-[#fafaf9] dark:border-[#1a1a1a] dark:hover:bg-[#0a0a0a]"
                      >
                        <td className="py-2 pr-4 font-medium text-[#1c1917] dark:text-white">{pr.nome}</td>
                        <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{textoClassificacao(pr.familiaRisco ?? "")}</td>
                        <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{textoGrupo(pr.grupoCompatibilidade ?? "")}</td>
                        <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{textoFiltroTecnico(pr.filtroTecnico ?? "")}</td>
                        <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{textoCalibre(pr.calibre ?? "")}</td>
                        <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{pr.nemPorUnidade}</td>
                        <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">
                          {stockPorProduto.get(pr.id) ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function StockPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <StockContent />
    </Suspense>
  );
}
