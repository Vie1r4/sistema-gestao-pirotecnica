"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { textoClassificacao, textoGrupo, textoFiltroTecnico, textoCalibre, type Produto } from "@/app/lib/produtos";
import { fetchDetails, mapApiToProduto } from "@/app/lib/produtosApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

const sectionTitleClass = "text-lg font-semibold text-gray-900 dark:text-white";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

const btnDanger =
  "data-button rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-[border-color,background-color,color] duration-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950";

export default function ProdutoDetalhePage() {
  const params = useParams();
  const id = params.id as string;
  const numId = parseInt(String(id), 10);
  const validId = !Number.isNaN(numId);
  const { user } = useUser();
  const canGerirProdutos = (user?.permissions ?? []).includes("produtos.gerir");

  const {
    data: produto,
    isLoading: loadingApi,
    isRefetching,
    error: queryError,
  } = useQuery({
    queryKey: ["produtos", id],
    queryFn: async (): Promise<Produto> => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      const p = await fetchDetails(token, numId);
      return mapApiToProduto(p);
    },
    staleTime: 30 * 1000,
    retry: 2,
    enabled: validId && !!getToken(),
  });

  if (loadingApi) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (queryError || !produto) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          <p className="text-gray-600 dark:text-gray-400">Produto não encontrado.</p>
          <Link href="/produtos" className="mt-5 inline-block text-[#f97316] hover:underline">
            ← Voltar ao catálogo
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                {produto.nome}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                Detalhes do produto
                {isRefetching && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]" />
                    A atualizar
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {canGerirProdutos && (
                <>
                  <Link href={`/produtos/${id}/editar`} className={btnPrimary}>
                    Editar
                  </Link>
                  <Link href={`/produtos/${id}/eliminar`} className={btnDanger}>
                    Eliminar
                  </Link>
                </>
              )}
              <Link href="/produtos" className={btnSecondary}>
                Voltar ao catálogo
              </Link>
            </div>
          </motion.div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className={`mt-10 ${cardClass}`}
          >
            <h2 className={sectionTitleClass}>Dados do produto</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-1">
              <div>
                <dt className={labelClass}>Nome</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{produto.nome}</dd>
              </div>
              <div>
                <dt className={labelClass}>NEM por unidade (kg)</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-400">{produto.nemPorUnidade}</dd>
              </div>
              <div>
                <dt className={labelClass}>Classificação de risco</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-400">{textoClassificacao(produto.familiaRisco)}</dd>
              </div>
              <div>
                <dt className={labelClass}>Filtro técnico</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-400">{textoFiltroTecnico(produto.filtroTecnico)}</dd>
              </div>
              <div>
                <dt className={labelClass}>Calibre</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-400">{textoCalibre(produto.calibre)}</dd>
              </div>
              <div>
                <dt className={labelClass}>Grupo de compatibilidade</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-400">{textoGrupo(produto.grupoCompatibilidade)}</dd>
              </div>
              <div>
                <dt className={labelClass}>Referência</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-400">{produto.referencia ?? "—"}</dd>
              </div>
            </dl>
          </motion.section>

          <p className="mt-10">
            <Link href="/produtos" className="text-[#f97316] hover:underline">
              ← Voltar ao catálogo
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
