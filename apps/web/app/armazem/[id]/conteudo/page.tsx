"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { type Paiol } from "@/app/lib/armazem";
import { fetchConteudoPaiol } from "@/app/lib/paiolApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

type CargaItem = { produtoId: string; produtoNome: string; quantidade: number; nemPorUnidade: number; divisao: string };

const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

export default function ConteudoPaiolPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [mounted, setMounted] = useState(false);
  const numId = useMemo(() => parseInt(id, 10), [id]);
  const token = getToken();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: rawData, isLoading: loadingApi } = useQuery({
    queryKey: ["armazem", "paiol", "conteudo", numId],
    queryFn: async () => {
      const t = getToken();
      if (!t) {
        router.replace("/login");
        throw new Error("no-token");
      }
      if (Number.isNaN(numId)) return null;
      return fetchConteudoPaiol(t, numId);
    },
    enabled: mounted && !!token && !Number.isNaN(numId),
    retry: 1,
  });

  const { paiol, carga } = useMemo(() => {
    if (!rawData) return { paiol: null as Paiol | null, carga: [] as CargaItem[] };
    const p = (rawData.paiol ?? rawData.Paiol) as Record<string, unknown> | undefined;
    if (!p) return { paiol: null, carga: [] };
    const get = (k: string) => p[k] ?? p[k.charAt(0).toUpperCase() + k.slice(1)];
    const paiolMapped: Paiol = {
      id: String(get("id") ?? get("Id") ?? id),
      nome: String(get("nome") ?? get("Nome") ?? ""),
      localizacao: (get("localizacao") ?? get("Localizacao")) as string | undefined,
      limiteMLE: Number(get("limiteMLE") ?? get("LimiteMLE") ?? 0),
      perfilRisco: String(get("perfilRisco") ?? get("PerfilRisco") ?? "1.1") as Paiol["perfilRisco"],
      estado: String(get("estado") ?? get("Estado") ?? "Ativo") as Paiol["estado"],
      cargosAcesso: [],
      documentosExtras: [],
      dataRegisto: new Date().toISOString(),
    };
    const cargaRaw = (rawData.carga ?? rawData.Carga) as Array<Record<string, unknown>> | undefined;
    const cargaItems: CargaItem[] = Array.isArray(cargaRaw)
      ? cargaRaw.map((x) => ({
          produtoId: String(x.produtoId ?? x.ProdutoId ?? ""),
          produtoNome: String(x.produtoNome ?? x.ProdutoNome ?? ""),
          quantidade: Number(x.quantidade ?? x.Quantidade ?? 0),
          nemPorUnidade: Number(x.nemPorUnidade ?? x.NEMPorUnidade ?? 0),
          divisao: String(x.divisao ?? x.Divisao ?? ""),
        }))
      : [];
    return { paiol: paiolMapped, carga: cargaItems };
  }, [rawData, id]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (!paiol) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          {loadingApi ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
            </div>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400">Paiol não encontrado.</p>
              <Link href="/armazem" className="mt-5 inline-block text-[#f97316] hover:underline">
                ← Voltar ao Armazém
              </Link>
            </>
          )}
        </main>
      </div>
    );
  }

  const podeAdicionar = paiol.estado === "Ativo";

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Conteúdo do paiol
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {paiol.nome}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {podeAdicionar ? (
                <Link
                  href={`/armazem/entradas/registar?paiolId=${id}`}
                  className={btnPrimary}
                >
                  Adicionar material
                </Link>
              ) : (
                <span className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-500 dark:border-[#333] dark:text-gray-400">
                  Paiol em manutenção — não pode receber entradas
                </span>
              )}
              <Link href={`/armazem/${id}`} className={btnSecondary}>
                Detalhes do paiol
              </Link>
              <Link href="/armazem" className={btnSecondary}>
                Voltar ao Armazém
              </Link>
            </div>
          </motion.div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className={`mt-10 ${cardClass}`}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Stock no paiol
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Ocupação baseada na soma da NEM de todos os produtos (legislação portuguesa).
            </p>
            <div className="mt-4">
              {carga.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-10 text-center dark:border-[#333] dark:bg-[#0a0a0a]/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nenhum produto em stock neste paiol.
                  </p>
                  {podeAdicionar && (
                    <Link
                      href={`/armazem/entradas/registar?paiolId=${id}`}
                      className="mt-3 inline-block text-sm font-medium text-[#f97316] hover:underline"
                    >
                      Adicionar material
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-3 lg:hidden">
                    {carga.map((item) => (
                      <div
                        key={item.produtoId}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#1f1f1f] dark:bg-[#111]"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.produtoNome}</p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {item.divisao} · Qtd: {item.quantidade} · NEM: {(item.quantidade * item.nemPorUnidade).toFixed(2)} kg
                          </p>
                        </div>
                        <Link
                          href={`/armazem/saidas/registar?paiolId=${id}&produtoId=${item.produtoId}`}
                          className="shrink-0 rounded-lg bg-[#f97316] px-3 py-1.5 text-sm font-medium text-black hover:opacity-90"
                        >
                          Retirar
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-[#222]">
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Produto</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Divisão</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Qtd</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">NEM (kg)</th>
                          <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {carga.map((item) => (
                          <tr key={item.produtoId} className="border-b border-gray-100 dark:border-[#1a1a1a]">
                            <td className="py-2 pr-4 font-medium text-gray-900 dark:text-white">{item.produtoNome}</td>
                            <td className="whitespace-nowrap py-2 pr-4 text-gray-600 dark:text-gray-400">{item.divisao}</td>
                            <td className="whitespace-nowrap py-2 pr-4 text-gray-600 dark:text-gray-400">{item.quantidade}</td>
                            <td className="whitespace-nowrap py-2 pr-4 text-gray-600 dark:text-gray-400">
                              {(item.quantidade * item.nemPorUnidade).toFixed(2)}
                            </td>
                            <td className="py-2 pr-4">
                              <Link
                                href={`/armazem/saidas/registar?paiolId=${id}&produtoId=${item.produtoId}`}
                                className="text-[#f97316] hover:underline"
                              >
                                Retirar
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
          </motion.section>

          <p className="mt-10">
            <Link href="/armazem" className="text-[#f97316] hover:underline">
              ← Voltar ao Armazém
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
