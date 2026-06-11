"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { useToastStore } from "@/app/stores/useToastStore";
import { fetchCreate, postCreate } from "@/app/lib/encomendasApi";
import { useActionGuard } from "@/app/hooks/useActionGuard";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const inputClass =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

function mapCreateToClientes(data: { clientes?: Array<Record<string, unknown>> }): { id: string; nome: string }[] {
  const raw = data?.clientes ?? [];
  return raw
    .map((c) => {
      const id = c.id ?? c.Id;
      const nome = c.nome ?? c.Nome ?? "";
      return { id: String(id ?? ""), nome: String(nome) };
    })
    .filter((c) => c.id && c.id !== "undefined" && c.id !== "0")
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

function NovaEncomendaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const canGerirEncomendas = (user?.permissions ?? []).includes("encomendas.gerir");
  const [mounted, setMounted] = useState(false);
  const clienteIdParam = searchParams.get("clienteId") ?? "";
  const [clienteId, setClienteId] = useState(clienteIdParam);
  const [erro, setErro] = useState<string | null>(null);
  const submitGuard = useActionGuard();
  const token = getToken();
  const clienteIdNum = clienteIdParam ? parseInt(clienteIdParam, 10) : undefined;
  const clienteIdForFetch = clienteIdNum !== undefined && !Number.isNaN(clienteIdNum) ? clienteIdNum : undefined;

  const { data: createData } = useQuery({
    queryKey: ["encomendas", "create", clienteIdForFetch],
    queryFn: () => fetchCreate(token!, clienteIdForFetch),
    staleTime: 60 * 1000,
    enabled: mounted && !!token,
  });

  const clientes = createData ? mapCreateToClientes(createData as { clientes?: Array<Record<string, unknown>> }) : [];
  const useApi = !!createData;

  const createMutation = useMutation({
    mutationFn: (body: { clienteId: number }) => postCreate(token!, body),
    onSuccess: (_, variables) => {
      useToastStore.getState().show("Encomenda iniciada. Adicione os itens.", "success");
      queryClient.invalidateQueries({ queryKey: ["encomendas"] });
      router.push(`/encomendas/novo/adicionar-itens?clienteId=${encodeURIComponent(String(variables.clienteId))}`);
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Erro ao confirmar cliente. Tente novamente.";
      setErro(msg === "Failed to fetch" ? "Não foi possível contactar a API. Confirme que o backend está a correr e que NEXT_PUBLIC_API_URL está correto." : msg);
    },
    onSettled: (_data, error) => {
      if (error) submitGuard.end();
    },
  });

  useEffect(() => {
    const c = searchParams.get("clienteId");
    if (c) setClienteId(c);
  }, [searchParams]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (!canGerirEncomendas) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          <p className="text-gray-600 dark:text-gray-400">Apenas utilizadores com permissão para gerir encomendas podem criar.</p>
          <Link href="/encomendas" className="mt-4 inline-block text-[#f97316] hover:underline">
            ← Voltar às Encomendas
          </Link>
        </main>
      </div>
    );
  }

  const handleContinuar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitGuard.begin() || createMutation.isPending) return;
    if (!clienteId.trim()) {
      submitGuard.end();
      return;
    }
    const numId = Number(clienteId);
    if (Number.isNaN(numId) || numId < 1) {
      setErro("Selecione um cliente válido.");
      submitGuard.end();
      return;
    }
    const existe = clientes.some((c) => c.id === clienteId);
    if (!existe) {
      submitGuard.end();
      return;
    }
    if (useApi && token) {
      setErro(null);
      createMutation.mutate({ clienteId: numId });
    } else {
      submitGuard.end();
      router.push(`/encomendas/novo/adicionar-itens?clienteId=${encodeURIComponent(clienteId)}`);
    }
  };

  const continuarBusy = submitGuard.isBlocked(createMutation.isPending);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-4"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight sm:text-3xl">
                Nova encomenda
              </h1>
              <p className="mt-1 text-[#57534e] dark:text-gray-400">
                Escolha o cliente e continue para adicionar itens ao rascunho. A encomenda só é criada ao registar no último passo.
              </p>
            </div>

            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.05 }}
              className="card-hover rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8"
            >
              {clientes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#e7e5e4] bg-[#fafaf9] py-10 text-center dark:border-[#333] dark:bg-[#0a0a0a]">
                  <p className="text-[#57534e] dark:text-gray-400">
                    Não existem clientes registados. Peça a um Gestor ou Admin para registar clientes antes de criar encomendas.
                  </p>
                  <Link href="/encomendas" className={btnPrimary + " mt-4 inline-block"}>
                    Voltar às encomendas
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleContinuar} className="space-y-6">
                  {erro && (
                    <p className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">{erro}</p>
                  )}
                  <div>
                    <label htmlFor="clienteId" className={labelClass}>
                      Cliente que fez a encomenda
                    </label>
                    <select
                      id="clienteId"
                      value={clienteId}
                      onChange={(e) => setClienteId(e.target.value)}
                      className={`${inputClass} mt-2 w-full`}
                      required
                    >
                      <option value="">— Selecionar —</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" className={btnPrimary} disabled={!clienteId || continuarBusy}>
                      {continuarBusy ? "A processar…" : "Continuar para catálogo"}
                    </button>
                    <Link href="/encomendas" className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-[#333] dark:text-gray-300">
                      Cancelar
                    </Link>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function NovaEncomendaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <NovaEncomendaContent />
    </Suspense>
  );
}
