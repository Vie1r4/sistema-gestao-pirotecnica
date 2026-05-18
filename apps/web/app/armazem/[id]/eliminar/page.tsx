"use client";

import { useRef, useState } from "react";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import { deletePaiol, fetchDeleteGet } from "@/app/lib/paiolApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

const btnDanger =
  "data-button rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-[background-color,opacity] duration-200 hover:bg-red-700";

type PaiolResumo = {
  id: string;
  nome: string;
  localizacao?: string;
  limiteMLE: number;
};

export default function EliminarPaiolPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const numId = parseInt(id, 10);
  const validId = !Number.isNaN(numId);
  const deletingRef = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: paiol, isLoading: loadingApi, error: queryError } = useQuery({
    queryKey: ["armazem", "paiol", id, "delete"],
    queryFn: async (): Promise<PaiolResumo> => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      const data = await fetchDeleteGet(token, numId) as Record<string, unknown>;
      if (!data) throw new Error("Paiol não encontrado.");
      const p = (data.paiol ?? data.Paiol ?? data) as Record<string, unknown>;
      const get = (k: string) => p[k] ?? p[k.charAt(0).toUpperCase() + k.slice(1)];
      return {
        id: String(get("id") ?? get("Id") ?? id),
        nome: String(get("nome") ?? get("Nome") ?? ""),
        localizacao: (get("localizacao") ?? get("Localizacao")) as string | undefined,
        limiteMLE: Number(get("limiteMLE") ?? get("LimiteMLE") ?? 0),
      };
    },
    staleTime: 30 * 1000,
    retry: 1,
    enabled: validId && !!getToken(),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      await deletePaiol(token, numId);
    },
    onSuccess: () => {
      useToastStore.getState().show("Paiol eliminado.", "success");
      queryClient.invalidateQueries({ queryKey: ["armazem"] });
      queryClient.invalidateQueries({ queryKey: ["armazem", "paiol", id] });
      router.push("/armazem/gestao?eliminado=1");
    },
    onSettled: () => {
      deletingRef.current = false;
    },
  });

  const handleConfirmar = () => {
    if (deletingRef.current) return;
    if (!paiol) return;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    deletingRef.current = true;
    mutation.mutate();
  };

  const loading = mutation.isPending;

  if (loadingApi && validId) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
          </div>
        </main>
      </div>
    );
  }

  if (queryError || !paiol) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          {queryError && (
            <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {queryError instanceof Error ? queryError.message : "Erro ao carregar."}
            </p>
          )}
          {!queryError && <p className="text-gray-600 dark:text-gray-400">Paiol não encontrado.</p>}
          <Link href="/armazem" className="mt-5 inline-block text-[#f97316] hover:underline">
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
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        <div className="mx-auto max-w-2xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight text-red-600 dark:text-red-400 sm:text-3xl">
              Eliminar paiol
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Esta ação é irreversível. O paiol e a documentação associada serão removidos. A pasta de documentos será apagada. As entradas e saídas já registadas mantêm referência ao paiol (em modo demonstração podem ficar órfãs).
            </p>
          </motion.div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className={`mt-10 ${cardClass}`}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Resumo do paiol
            </h2>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</dt>
                <dd className="text-gray-900 dark:text-white">{paiol.nome}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Localização</dt>
                <dd className="text-gray-700 dark:text-gray-300">{paiol.localizacao ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Limite MLE (kg)</dt>
                <dd className="text-gray-700 dark:text-gray-300">{paiol.limiteMLE}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={loading}
                className={btnDanger}
              >
                {loading ? "A eliminar…" : "Confirmar eliminação"}
              </button>
              <ConfirmDialog
                open={confirmOpen}
                title="Eliminar paiol?"
                description="Esta ação é irreversível. O paiol e a documentação associada serão removidos."
                confirmLabel="Eliminar"
                destructive
                loading={loading}
                onConfirm={() => {
                  setConfirmOpen(false);
                  handleConfirmar();
                }}
                onCancel={() => setConfirmOpen(false)}
              />
              <Link href={`/armazem/${id}`} className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
