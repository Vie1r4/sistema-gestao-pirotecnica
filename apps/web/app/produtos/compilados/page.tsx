"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import EmptyState from "@/app/components/ui/EmptyState";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { fetchCompilados } from "@/app/lib/compiladosApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { btnPrimary, btnSecondary } from "./_components/compiladosUi";

function CompiladosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const canGerir = (user?.permissions ?? []).includes("produtos.gerir");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!canGerir && user !== undefined) router.replace("/produtos");
  }, [mounted, canGerir, user, router]);

  const { data: lista = [], isLoading } = useQuery({
    queryKey: ["compilados"],
    queryFn: async () => {
      const t = getToken();
      if (!t) throw new Error("no-token");
      return fetchCompilados(t);
    },
    enabled: mounted && !!getToken() && canGerir,
    staleTime: 30_000,
  });

  const criado = searchParams.get("criado") === "1";
  const eliminado = searchParams.get("eliminado") === "1";

  if (!mounted || (user !== undefined && !canGerir)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset">
        <div className="content-container">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-[#1c1917] dark:text-white sm:text-3xl">
                Gerir compilados
              </h1>
              <p className="mt-1 text-[#57534e] dark:text-gray-400">
                Atalhos com vários produtos. Nas encomendas, a quantidade pedida multiplica cada linha.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/produtos" className={btnSecondary}>
                Voltar ao Catálogo
              </Link>
              <Link href="/produtos/compilados/novo" className={btnPrimary}>
                Criar compilado
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
              {criado ? "Compilado guardado com sucesso." : "Compilado eliminado com sucesso."}
            </motion.p>
          )}

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] sm:p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lista de compilados</h2>
            <p className="mt-4 text-sm text-[#57534e] dark:text-gray-400">
              {isLoading && getToken() ? "A carregar… " : ""}
              {lista.length} compilado(s)
            </p>
            <div className="mt-6 overflow-x-auto">
              {lista.length === 0 ? (
                <EmptyState
                  title={!getToken() ? "Inicie sessão para gerir compilados." : "Nenhum compilado."}
                  description={getToken() ? "Crie o primeiro atalho para usar nas encomendas." : undefined}
                  action={
                    getToken() ? (
                      <Link href="/produtos/compilados/novo" className={btnPrimary}>
                        Criar compilado
                      </Link>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  <div className="space-y-3 lg:hidden">
                    {lista.map((c) => (
                      <div
                        key={c.id}
                        className="card-hover rounded-xl border border-[#e7e5e4] bg-white p-4 dark:border-[#1f1f1f] dark:bg-[#111]"
                      >
                        <p className="font-medium text-[#1c1917] dark:text-white">{c.nome}</p>
                        <p className="mt-1 text-xs text-[#57534e] dark:text-gray-400">
                          {c.itens.length} produto(s)
                        </p>
                        <ul className="mt-2 space-y-0.5 text-xs text-[#57534e] dark:text-gray-400">
                          {c.itens.map((i) => (
                            <li key={`${c.id}-${i.produtoId}`}>
                              {i.produtoNome || `Produto #${i.produtoId}`} × {i.quantidadePorUnidade}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex gap-3 text-sm">
                          <Link href={`/produtos/compilados/${c.id}/editar`} className="text-[#f97316] hover:underline">
                            Editar
                          </Link>
                          <Link
                            href={`/produtos/compilados/${c.id}/eliminar`}
                            className="text-red-600 hover:underline dark:text-red-400"
                          >
                            Eliminar
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#e7e5e4] dark:border-[#222]">
                          <th className="whitespace-nowrap pb-2 pr-3 font-semibold text-[#444] dark:text-gray-300">
                            Nome
                          </th>
                          <th className="whitespace-nowrap pb-2 pr-3 font-semibold text-[#444] dark:text-gray-300">
                            Produtos
                          </th>
                          <th className="pb-2 pr-3 font-semibold text-[#444] dark:text-gray-300">Conteúdo</th>
                          <th className="whitespace-nowrap pb-2 pr-3 font-semibold text-[#444] dark:text-gray-300">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {lista.map((c) => (
                          <tr
                            key={c.id}
                            className="border-b border-[#f5f5f4] transition-colors hover:bg-[#fafaf9] dark:border-[#1a1a1a] dark:hover:bg-[#0a0a0a]"
                          >
                            <td className="py-2 pr-3 font-medium text-[#1c1917] dark:text-white">{c.nome}</td>
                            <td className="whitespace-nowrap py-2 pr-3 text-[#57534e] dark:text-gray-400">
                              {c.itens.length}
                            </td>
                            <td className="py-2 pr-3 text-[#57534e] dark:text-gray-400">
                              <ul className="space-y-1">
                                {c.itens.map((i) => (
                                  <li key={`${c.id}-${i.produtoId}`}>
                                    {i.produtoNome || `Produto #${i.produtoId}`} × {i.quantidadePorUnidade}
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="whitespace-nowrap py-2 pr-3">
                              <Link
                                href={`/produtos/compilados/${c.id}/editar`}
                                className="text-[#f97316] hover:underline"
                              >
                                Editar
                              </Link>
                              <span className="mx-2 text-[#d6d3d1] dark:text-[#444]">|</span>
                              <Link
                                href={`/produtos/compilados/${c.id}/eliminar`}
                                className="text-red-600 hover:underline dark:text-red-400"
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
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function CompiladosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <CompiladosContent />
    </Suspense>
  );
}
