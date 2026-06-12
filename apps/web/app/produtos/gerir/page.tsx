"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import { DataTable } from "@/app/components/ui/DataTable";
import { produtosGerirColumns } from "@/app/produtos/_components/produtosColumns";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import {
  textoClassificacao,
  CLASSIFICACOES_RISCO,
  GRUPOS_COMPATIBILIDADE,
  FILTROS_TECNICOS,
  CALIBRES,
  type Produto,
} from "@/app/lib/produtos";
import { fetchGerir, mapApiToProduto } from "@/app/lib/produtosApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { btnPrimary, btnSecondary, inputClassFilter as inputClass } from "@/app/components/ui/tokens";

function GerirContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const canGerirProdutos = (user?.permissions ?? []).includes("produtos.gerir");
  const [mounted, setMounted] = useState(false);
  const [pesquisa, setPesquisa] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [grupoCompatibilidade, setGrupoCompatibilidade] = useState("");
  const [filtroTecnico, setFiltroTecnico] = useState("");
  const [calibre, setCalibre] = useState("");
  const token = getToken();

  useEffect(() => {
    setPesquisa(searchParams.get("pesquisa") ?? "");
    setClassificacao(searchParams.get("classificacao") ?? "");
    setGrupoCompatibilidade(searchParams.get("grupoCompatibilidade") ?? "");
    setFiltroTecnico(searchParams.get("filtroTecnico") ?? "");
    setCalibre(searchParams.get("calibre") ?? "");
  }, [searchParams]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!canGerirProdutos && user !== undefined) {
      router.replace("/produtos");
    }
  }, [mounted, canGerirProdutos, user, router]);

  const filterKey = useMemo(
    () => ({ pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre }),
    [pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre]
  );

  const { data: gerirData, isLoading: loadingApi } = useQuery({
    queryKey: ["produtos", "gerir", filterKey],
    queryFn: async () => {
      const t = getToken();
      if (!t) throw new Error("no-token");
      return fetchGerir(t, filterKey);
    },
    enabled: mounted && !!token && canGerirProdutos,
    staleTime: 30 * 1000,
  });

  const lista: Produto[] = (gerirData?.items ?? []).map((it) => mapApiToProduto(it as Record<string, unknown>));
  const columns = useMemo(() => produtosGerirColumns(), []);

  if (!mounted || (user !== undefined && !canGerirProdutos)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }
  const temFiltros = pesquisa || classificacao || grupoCompatibilidade || filtroTecnico || calibre;
  const criado = searchParams.get("criado") === "1";
  const eliminado = searchParams.get("eliminado") === "1";

  const buildFilterUrl = () => {
    const p = new URLSearchParams();
    if (pesquisa) p.set("pesquisa", pesquisa);
    if (classificacao) p.set("classificacao", classificacao);
    if (grupoCompatibilidade) p.set("grupoCompatibilidade", grupoCompatibilidade);
    if (filtroTecnico) p.set("filtroTecnico", filtroTecnico);
    if (calibre) p.set("calibre", calibre);
    return `/produtos/gerir?${p.toString()}`;
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
                Gerir produtos
              </h1>
              <p className="mt-1 text-[#57534e] dark:text-gray-400">
                Subdivisão dos produtos. Criar, editar e eliminar artigos do catálogo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/produtos" className={btnSecondary}>
                Voltar ao Catálogo
              </Link>
              <Link href="/produtos/compilados" className={btnSecondary}>
                Gerir compilados
              </Link>
              <Link href="/produtos/novo" className={btnPrimary}>
                Criar produto
              </Link>
            </div>
          </motion.div>

          {(criado || eliminado) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mt-5 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              {criado ? "Produto criado com sucesso." : "Produto eliminado com sucesso."}
            </motion.p>
          )}

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] sm:p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subdivisão dos produtos
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pesquisa (nome)</label>
                <input
                  type="search"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  className={`${inputClass} mt-1 w-full`}
                  placeholder="Nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Classificação</label>
                <select
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grupo</label>
                <select
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filtro técnico</label>
                <select
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Calibre</label>
                <select
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
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { window.location.href = buildFilterUrl(); }}
                className={btnPrimary}
              >
                Filtrar
              </button>
              {temFiltros && (
                <Link href="/produtos/gerir" className={btnSecondary}>
                  Limpar filtros
                </Link>
              )}
            </div>
            <p className="mt-4 text-sm text-[#57534e] dark:text-gray-400">
              {loadingApi && getToken() ? "A carregar… " : ""}{lista.length} produto(s)
            </p>
            <div className="mt-6">
              {loadingApi ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-[#57534e] dark:text-gray-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
                  <span>A carregar produtos…</span>
                </div>
              ) : (
                <DataTable<Produto>
                  columns={columns}
                  data={lista}
                  pageSize={15}
                  showSearch={false}
                  emptyMessage={
                    !getToken()
                      ? "Inicie sessão para gerir produtos."
                      : "Nenhum produto. Crie o primeiro no catálogo."
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

export default function GerirProdutosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <GerirContent />
    </Suspense>
  );
}
