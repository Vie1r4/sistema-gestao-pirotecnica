"use client";

import { useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import { textoClassificacao } from "@/app/lib/produtos";
import { fetchDeleteGet, deleteProdutoApi, mapApiToProduto } from "@/app/lib/produtosApi";
import type { Produto } from "@/app/lib/produtos";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

const btnDanger =
  "data-button rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-[background-color,opacity] duration-200 hover:bg-red-700";

export default function EliminarProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const numId = parseInt(String(id), 10);
  const validId = !Number.isNaN(numId);
  const deletingRef = useRef(false);

  const { data: produto, isLoading: loadingApi, error: queryError } = useQuery({
    queryKey: ["produtos", id, "delete"],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      const p = await fetchDeleteGet(token, numId);
      return mapApiToProduto(p) as Produto;
    },
    staleTime: 30 * 1000,
    retry: 1,
    enabled: validId && !!getToken(),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      await deleteProdutoApi(token, numId);
    },
    onSuccess: () => {
      useToastStore.getState().show("Produto eliminado.", "success");
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      queryClient.invalidateQueries({ queryKey: ["produtos", id] });
      router.push("/produtos/gerir?eliminado=1");
    },
    onSettled: () => {
      deletingRef.current = false;
    },
  });

  const handleConfirmar = () => {
    if (deletingRef.current) return;
    if (!produto) return;
    const token = getToken();
    if (!token || !validId) return;
    deletingRef.current = true;
    mutation.mutate();
  };

  const loading = mutation.isPending;

  if (loadingApi && validId) {
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
        <main  className="p-8 pt-content-offset">
          {queryError && (
            <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {queryError instanceof Error ? queryError.message : "Erro ao carregar."}
            </p>
          )}
          {!queryError && <p className="text-gray-600 dark:text-gray-400">Produto não encontrado.</p>}
          <Link href="/produtos" className="mt-5 inline-block text-[#f97316] hover:underline">← Voltar</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-2xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight text-red-600 dark:text-red-400 sm:text-3xl">
              Eliminar produto
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Esta ação é irreversível. O produto será removido do catálogo. Itens de encomenda ou entradas/saídas de paiol que o referenciem podem ficar órfãos.
            </p>
          </motion.div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className={`mt-10 ${cardClass}`}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Resumo do produto
            </h2>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</dt>
                <dd className="text-gray-900 dark:text-white">{produto.nome}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">NEM por unidade (kg)</dt>
                <dd className="text-gray-700 dark:text-gray-300">{produto.nemPorUnidade}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Classificação de risco</dt>
                <dd className="text-gray-700 dark:text-gray-300">{textoClassificacao(produto.familiaRisco)}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={loading}
                className={btnDanger}
              >
                {loading ? "A eliminar…" : "Confirmar eliminação"}
              </button>
              <Link href={`/produtos/${id}`} className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
