"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import { servicosApi } from "@/app/lib/servicos";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const btnDanger =
  "data-button rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600";
const btnSecondary =
  "rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-[#333] dark:text-gray-300";

type ServicoResumo = {
  id: string;
  clienteId: string;
  dataServico: string;
  encomendaId?: string;
  cliente?: { nome: string } | null;
};

export default function EliminarServicoPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const deletingRef = useRef(false);

  const { data: servico, isLoading: loadingApi, error: queryError } = useQuery({
    queryKey: ["servicos", id, "delete"],
    queryFn: async (): Promise<ServicoResumo> => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      const s = await servicosApi.fetchServicosDelete(token, id);
      const raw = s as Record<string, unknown>;
      return {
        id: String(raw.id ?? raw.Id ?? id),
        clienteId: String(raw.clienteId ?? raw.ClienteId ?? ""),
        dataServico: String(raw.dataServico ?? raw.DataServico ?? ""),
        encomendaId: raw.encomendaId != null || raw.EncomendaId != null ? String(raw.encomendaId ?? raw.EncomendaId) : undefined,
        cliente: (raw.cliente ?? raw.Cliente) as { nome: string } | undefined,
      };
    },
    staleTime: 30 * 1000,
    retry: 1,
    enabled: !!id && !!getToken(),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      await servicosApi.deleteServico(token, id);
    },
    onSuccess: () => {
      useToastStore.getState().show("Serviço eliminado.", "success");
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      queryClient.invalidateQueries({ queryKey: ["servicos", id] });
      router.push("/servicos");
    },
    onError: () => router.push(`/servicos/${id}`),
    onSettled: () => {
      deletingRef.current = false;
    },
  });

  const handleConfirm = () => {
    if (deletingRef.current) return;
    if (!servico) return;
    const token = getToken();
    if (!token) return;
    deletingRef.current = true;
    mutation.mutate();
  };

  const submitting = mutation.isPending;

  if (loadingApi) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (queryError || servico == null) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main className="px-6 pt-14 pb-10" style={{ paddingTop: CONTENT_OFFSET_TOP }}>
          <div className="mx-auto max-w-md rounded-xl border border-[#e7e5e4] bg-white p-6 dark:border-[#1f1f1f] dark:bg-[#111]">
            {queryError && (
              <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {queryError instanceof Error ? queryError.message : "Erro ao carregar."}
              </p>
            )}
            {!queryError && <p className="text-[#57534e] dark:text-gray-400">Serviço não encontrado.</p>}
            <Link href="/servicos" className="mt-4 inline-block text-[#f97316] hover:underline">
              ← Voltar à lista
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main className="px-6 pt-14 pb-10 sm:px-8" style={{ paddingTop: CONTENT_OFFSET_TOP }}>
        <div className="mx-auto max-w-md">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]"
          >
            <h1 className="text-xl font-semibold">Eliminar serviço</h1>
            <p className="mt-2 text-sm text-[#57534e] dark:text-gray-400">
              Tem a certeza que deseja eliminar o serviço <strong>#{servico.id}</strong>?
            </p>
            <dl className="mt-4 space-y-1 text-sm">
              <dt className="text-[#57534e] dark:text-gray-400">Cliente</dt>
              <dd>{servico.cliente?.nome ?? servico.clienteId}</dd>
              <dt className="text-[#57534e] dark:text-gray-400">Data do serviço</dt>
              <dd>{new Date(servico.dataServico).toLocaleDateString("pt-PT")}</dd>
              {servico.encomendaId && (
                <>
                  <dt className="text-[#57534e] dark:text-gray-400">Encomenda associada</dt>
                  <dd>
                    <Link href={`/encomendas/${servico.encomendaId}`} className="text-[#f97316] hover:underline">
                      Ver encomenda #{servico.encomendaId}
                    </Link>
                  </dd>
                </>
              )}
            </dl>
            <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
              A encomenda associada não será alterada. Apenas o registo do serviço e documentação associada serão removidos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={handleConfirm} disabled={submitting} className={btnDanger}>
                {submitting ? "A eliminar…" : "Eliminar"}
              </button>
              <Link href={`/servicos/${servico.id}`} className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
