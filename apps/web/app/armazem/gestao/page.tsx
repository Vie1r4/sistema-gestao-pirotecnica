"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import EmptyState from "@/app/components/ui/EmptyState";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { labelPerfilRisco } from "@/app/lib/armazem";
import { fetchGestao, fetchListaPaiol } from "@/app/lib/paiolApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { btnPrimary, btnSecondary } from "@/app/components/ui/tokens";

type PaiolLinha = {
  id: string;
  nome: string;
  localizacao?: string;
  limiteMLE: number;
  perfilRisco: string;
  estado: string;
  mleAtual: number;
  percentagemOcupacao: number;
};

function mapGestaoToPaiois(data: unknown): PaiolLinha[] {
  const list = Array.isArray(data) ? data : [];
  return list.map((item: Record<string, unknown>) => {
    const p = (item.Paiol ?? item.paiol ?? {}) as Record<string, unknown>;
    const mle = Number(item.MleAtual ?? item.mleAtual ?? 0);
    const pct = Number(item.PercentagemOcupacao ?? item.percentagemOcupacao ?? 0);
    const limite = Number(p.LimiteMLE ?? p.limiteMLE ?? 0);
    return {
      id: String(p.Id ?? p.id ?? ""),
      nome: String(p.Nome ?? p.nome ?? "").trim() || "—",
      localizacao: (p.Localizacao ?? p.localizacao) as string | undefined,
      limiteMLE: Number.isFinite(limite) ? limite : 0,
      perfilRisco: String(p.PerfilRisco ?? p.perfilRisco ?? ""),
      estado: String(p.Estado ?? p.estado ?? ""),
      mleAtual: Number.isFinite(mle) ? mle : 0,
      percentagemOcupacao: Number.isFinite(pct) ? pct : 0,
    };
  });
}

function GestaoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const canGerirArmazem = (user?.permissions ?? []).includes("armazem.gerir");
  const [mounted, setMounted] = useState(false);
  const token = getToken();

  const {
    data: paiois = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["armazem", "gestao", canGerirArmazem],
    queryFn: async (): Promise<PaiolLinha[]> => {
      if (!token) {
        router.replace("/login");
        throw new Error("Sessão expirada.");
      }
      const data = canGerirArmazem
        ? await fetchGestao(token)
        : await (async () => {
            try {
              return await fetchListaPaiol(token);
            } catch (e) {
              if (e instanceof Error && e.message === "UNAUTHORIZED") {
                router.replace("/login");
                throw new Error("Não autenticado");
              }
              throw e;
            }
          })();
      return mapGestaoToPaiois(data);
    },
    staleTime: 30 * 1000,
    retry: 2,
    enabled: mounted && !!token,
  });

  const criado = searchParams.get("criado") === "1";
  const editado = searchParams.get("editado") === "1";
  const eliminado = searchParams.get("eliminado") === "1";

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

  const mostrarLista = !loading && !queryError && paiois.length > 0;
  const mostrarVazio = !loading && !queryError && paiois.length === 0;
  const mostrarErro = !loading && !!queryError;

  const alerta =
    criado ? "Paiol criado com sucesso."
    : editado ? "Alterações guardadas."
    : eliminado ? "Paiol eliminado com sucesso."
    : null;

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
                Gestão de Paióis
              </h1>
              <p className="mt-1 text-[#57534e] dark:text-gray-400">
                Criar, editar e eliminar paióis. Admin e Gestor.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/armazem/entradas/registar" className={btnSecondary}>
                Registar entrada
              </Link>
              <Link href="/armazem/movimentos" className={btnSecondary}>
                Movimentos
              </Link>
              <Link href="/armazem" className={btnSecondary}>
                Voltar ao Armazém
              </Link>
              <Link href="/armazem/novo" className={btnPrimary}>
                Criar novo paiol
              </Link>
            </div>
          </motion.div>

          {alerta && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mt-5 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              {alerta}
            </motion.p>
          )}

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] dark:shadow-none sm:p-6"
          >
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
              </div>
            ) : mostrarErro ? (
              <p className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {queryError instanceof Error ? queryError.message : "Erro ao carregar dados."}
              </p>
            ) : mostrarVazio ? (
              <EmptyState
                title="Ainda não há paióis registados."
                description="Crie o primeiro paiol para começar a gerir o armazém."
                action={
                  <Link href="/armazem/novo" className={btnPrimary}>
                    Criar novo paiol
                  </Link>
                }
              />
            ) : mostrarLista ? (
              <>
                <p className="mb-4 text-sm text-[#57534e] dark:text-gray-400">
                  {paiois.length} paiol/paióis
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#e7e5e4] dark:border-[#222]">
                        <th className="pb-3 font-semibold text-[#444] dark:text-gray-300">Nome</th>
                        <th className="pb-3 font-semibold text-[#444] dark:text-gray-300">Localização</th>
                        <th className="pb-3 font-semibold text-[#444] dark:text-gray-300">Capacidade máx.</th>
                        <th className="pb-3 font-semibold text-[#444] dark:text-gray-300">Perfil de risco</th>
                        <th className="pb-3 font-semibold text-[#444] dark:text-gray-300">Ocupação</th>
                        <th className="pb-3 font-semibold text-[#444] dark:text-gray-300">Estado</th>
                        <th className="pb-3 font-semibold text-[#444] dark:text-gray-300">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paiois.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-[#f5f5f4] transition-colors hover:bg-[#fafaf9] dark:border-[#1a1a1a] dark:hover:bg-[#0a0a0a]"
                        >
                          <td className="py-3 font-medium text-[#1c1917] dark:text-white">
                            {p.nome}
                          </td>
                          <td className="py-3 text-[#57534e] dark:text-gray-400">
                            {p.localizacao ?? "—"}
                          </td>
                          <td className="whitespace-nowrap py-3 text-[#57534e] dark:text-gray-400">
                            {p.limiteMLE} kg
                          </td>
                          <td className="py-3 text-[#57534e] dark:text-gray-400">
                            {labelPerfilRisco(p.perfilRisco)}
                          </td>
                          <td className="py-3 text-[#57534e] dark:text-gray-400">
                            {p.mleAtual.toFixed(1)} / {p.limiteMLE} kg ({p.percentagemOcupacao.toFixed(0)}%)
                          </td>
                          <td className="py-3 text-[#57534e] dark:text-gray-400">
                            {p.estado}
                          </td>
                          <td className="py-3 flex flex-wrap gap-2">
                            <Link
                              href={`/armazem/${p.id}/editar`}
                              data-button
                              className="text-[#f97316] transition-[color] duration-200 hover:underline"
                            >
                              Editar
                            </Link>
                            <Link
                              href={`/armazem/${p.id}`}
                              data-button
                              className="text-[#f97316] transition-[color] duration-200 hover:underline"
                            >
                              Detalhes
                            </Link>
                            <Link
                              href={`/armazem/${p.id}/eliminar`}
                              data-button
                              className="text-red-600 transition-[color] duration-200 hover:underline dark:text-red-400"
                            >
                              Eliminar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function GestaoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <GestaoContent />
    </Suspense>
  );
}
