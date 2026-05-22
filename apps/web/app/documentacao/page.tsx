"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { fetchServicosFromApi } from "@/app/lib/servicos";
import { gerarAutorizacaoTestePdf, gerarDeclaracaoTestePdf, gerarLicencaTestePdf } from "@/app/lib/documentacaoPdf";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#333] dark:bg-[#111] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

type ServicoPickerItem = {
  id: string;
  dataServico: string;
  clienteId: string;
  cliente?: { nome?: string | null } | null;
};

export default function DocumentacaoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useUser();
  const token = getToken();

  const roles = user?.roles ?? [];
  const isAdminOrGestor = roles.includes("Admin") || roles.includes("Gestor");
  const selectedServicoId = searchParams.get("servicoId") ?? "";
  const [gerandoPdf, setGerandoPdf] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!isAdminOrGestor) router.replace("/");
  }, [loading, user, isAdminOrGestor, router]);

  const { data, isLoading, error, isRefetching } = useQuery({
    queryKey: ["documentacao", "servicos-picker"],
    queryFn: async (): Promise<ServicoPickerItem[]> => {
      const t = getToken();
      if (!t) throw new Error("Sessão expirada.");
      const res = await fetchServicosFromApi(t, undefined, 1, 200);
      return (res.lista ?? []) as ServicoPickerItem[];
    },
    enabled: !!token && isAdminOrGestor,
    staleTime: 30 * 1000,
    retry: 2,
  });

  const servicos = data ?? [];
  const selectedServico = servicos.find((s) => String(s.id) === String(selectedServicoId)) ?? null;

  const dadosPdfBase = selectedServico
    ? {
        servicoId: String(selectedServico.id),
        dataServico: selectedServico.dataServico
          ? new Date(selectedServico.dataServico).toLocaleDateString("pt-PT")
          : undefined,
        clienteNome: selectedServico.cliente?.nome ?? selectedServico.clienteId,
        local: undefined,
      }
    : null;

  const setServico = (servicoId: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (servicoId) p.set("servicoId", servicoId);
    else p.delete("servicoId");
    router.replace(`/documentacao${p.toString() ? `?${p.toString()}` : ""}`);
  };

  const handleGerarDeclaracaoTeste = () => {
    if (!dadosPdfBase) return;
    setGerandoPdf(true);
    try {
      gerarDeclaracaoTestePdf(dadosPdfBase);
    } finally {
      setGerandoPdf(false);
    }
  };

  const handleGerarLicencaTeste = () => {
    if (!dadosPdfBase) return;
    setGerandoPdf(true);
    try {
      gerarLicencaTestePdf(dadosPdfBase);
    } finally {
      setGerandoPdf(false);
    }
  };

  const handleGerarAutorizacaoTeste = () => {
    if (!dadosPdfBase) return;
    setGerandoPdf(true);
    try {
      gerarAutorizacaoTestePdf(dadosPdfBase);
    } finally {
      setGerandoPdf(false);
    }
  };

  if (loading || (user && !isAdminOrGestor)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset" >
        <div className="content-container">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-2"
          >
            <h1 className="font-heading text-2xl tracking-tight sm:text-3xl">Documentação</h1>
            <p className="text-sm text-[#57534e] dark:text-gray-400">
              Esta página é apenas para gerar documentos de teste. O upload/anexo é feito no detalhe do serviço.
              {isRefetching && <span className="ml-2 text-xs text-[#78716c] dark:text-gray-500">A atualizar…</span>}
            </p>
          </motion.div>

          {error && (
            <p className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {error instanceof Error ? error.message : "Erro ao carregar serviços."}
            </p>
          )}

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="mt-8 rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-6"
          >
            <label htmlFor="servico-doc-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Serviço
            </label>
            <select
              id="servico-doc-select"
              value={selectedServicoId}
              onChange={(e) => setServico(e.target.value)}
              className="mt-2 w-full max-w-xl rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white"
              disabled={isLoading}
            >
              <option value="">— Selecionar serviço —</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.id} · {new Date(s.dataServico).toLocaleDateString("pt-PT")} · {s.cliente?.nome ?? s.clienteId}
                </option>
              ))}
            </select>
          </motion.section>

          {selectedServico && (
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.08 }}
              className="mt-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]"
            >
              <h2 className="text-lg font-semibold">Gerar documentos - Serviço #{selectedServico.id}</h2>
              <p className="mt-1 text-sm text-[#57534e] dark:text-gray-400">
                {new Date(selectedServico.dataServico).toLocaleDateString("pt-PT")} · {selectedServico.cliente?.nome ?? selectedServico.clienteId}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGerarDeclaracaoTeste}
                  disabled={gerandoPdf}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#444] dark:text-gray-300 dark:hover:bg-[#1a1a1a]"
                >
                  {gerandoPdf ? "A gerar PDF..." : "Gerar declaração (teste)"}
                </button>
                <button
                  type="button"
                  onClick={handleGerarLicencaTeste}
                  disabled={gerandoPdf}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#444] dark:text-gray-300 dark:hover:bg-[#1a1a1a]"
                >
                  {gerandoPdf ? "A gerar PDF..." : "Gerar licença (teste)"}
                </button>
                <button
                  type="button"
                  onClick={handleGerarAutorizacaoTeste}
                  disabled={gerandoPdf}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#444] dark:text-gray-300 dark:hover:bg-[#1a1a1a]"
                >
                  {gerandoPdf ? "A gerar PDF..." : "Gerar autorização (teste)"}
                </button>
              </div>
              <p className="mt-4 text-sm text-[#57534e] dark:text-gray-400">
                Depois de validar o ficheiro gerado, anexe-o na secção de documentação do detalhe do serviço.
              </p>
              <Link href={`/servicos/${selectedServico.id}`} className={btnSecondary + " mt-4 inline-flex"}>
                Abrir detalhe do serviço
              </Link>
            </motion.section>
          )}
        </div>
      </main>
    </div>
  );
}
