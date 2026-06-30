"use client";

import { useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import { fetchClienteDelete, deleteClienteApi } from "@/app/lib/clientes";
import { getToken } from "@/app/lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { cardClass, btnSecondary, btnDangerSolid as btnDanger } from "@/app/components/ui/tokens";

export default function EliminarClientePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const deletingRef = useRef(false);

  const { data: cliente, isLoading: loadingFetch, error: queryError } = useQuery({
    queryKey: ["clientes", id, "delete"],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      return fetchClienteDelete(token, id);
    },
    staleTime: 30 * 1000,
    retry: 1,
    enabled: !!id && !!getToken(),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      await deleteClienteApi(token, id);
    },
    onSuccess: () => {
      useToastStore.getState().show("Cliente eliminado.", "success");
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      queryClient.invalidateQueries({ queryKey: ["clientes", id] });
      router.push("/clientes?eliminado=1");
    },
    onSettled: () => {
      deletingRef.current = false;
    },
  });

  const handleConfirmar = () => {
    if (deletingRef.current) return;
    if (!cliente) return;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    deletingRef.current = true;
    mutation.mutate();
  };

  const loading = mutation.isPending;

  if (loadingFetch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }
  if (queryError || !cliente) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          {queryError && (
            <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {queryError instanceof Error ? queryError.message : "Erro ao carregar."}
            </p>
          )}
          {!queryError && <p className="text-gray-600 dark:text-gray-400">Cliente não encontrado.</p>}
          <Link href="/clientes" data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">
            ← Voltar
          </Link>
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
              Eliminar cliente
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Esta ação é irreversível. O cliente e a documentação associada serão removidos. As encomendas já existentes mantêm a referência ao cliente.
            </p>
          </motion.div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className={`mt-10 ${cardClass}`}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Resumo do cliente
            </h2>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</dt>
                <dd className="text-gray-900 dark:text-white">{cliente.nome}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</dt>
                <dd className="text-gray-700 dark:text-gray-300">{cliente.tipoCliente}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="text-gray-700 dark:text-gray-300">{cliente.email ?? "—"}</dd>
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
              <Link href={`/clientes/${id}`} className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
