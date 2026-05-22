"use client";

import { useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import { fetchCompilado, deleteCompilado } from "@/app/lib/compiladosApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { btnDanger, btnSecondary, cardClass } from "../../_components/compiladosUi";

export default function EliminarCompiladoPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const numId = parseInt(String(params.id), 10);
  const deletingRef = useRef(false);

  const { data: compilado, isLoading, error } = useQuery({
    queryKey: ["compilados", numId, "delete"],
    queryFn: async () => {
      const t = getToken();
      if (!t) throw new Error("Sessão expirada.");
      return fetchCompilado(t, numId);
    },
    enabled: !Number.isNaN(numId) && !!getToken(),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const t = getToken();
      if (!t) throw new Error("Sessão expirada.");
      await deleteCompilado(t, numId);
    },
    onSuccess: () => {
      useToastStore.getState().show("Compilado eliminado.", "success");
      queryClient.invalidateQueries({ queryKey: ["compilados"] });
      router.push("/produtos/compilados?eliminado=1");
    },
    onSettled: () => {
      deletingRef.current = false;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (error || !compilado) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main className="p-8 pt-content-offset">
          <p className="text-gray-600 dark:text-gray-400">Compilado não encontrado.</p>
          <Link href="/produtos/compilados" className="mt-4 inline-block text-[#f97316] hover:underline">
            ← Voltar
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset">
        <div className="mx-auto max-w-2xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight text-red-600 dark:text-red-400 sm:text-3xl">
              Eliminar compilado
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Esta ação é irreversível. O atalho deixa de estar disponível nas encomendas.
            </p>
          </motion.div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className={`mt-10 ${cardClass}`}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Resumo do compilado
            </h2>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</dt>
                <dd className="text-gray-900 dark:text-white">{compilado.nome}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Produtos</dt>
                <dd className="text-gray-700 dark:text-gray-300">{compilado.itens.length} linha(s)</dd>
              </div>
            </dl>
            <ul className="mt-4 space-y-1 border-t border-[#e7e5e4] pt-4 text-sm text-gray-700 dark:border-[#333] dark:text-gray-300">
              {compilado.itens.map((i) => (
                <li key={i.produtoId}>
                  {i.produtoNome || `Produto #${i.produtoId}`} — {i.quantidadePorUnidade} por unidade
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (deletingRef.current) return;
                  deletingRef.current = true;
                  mutation.mutate();
                }}
                disabled={mutation.isPending}
                className={btnDanger}
              >
                {mutation.isPending ? "A eliminar…" : "Confirmar eliminação"}
              </button>
              <Link href="/produtos/compilados" className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
