"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { fetchClienteDetalhe, fetchDocumentoClienteBlobUrl, type Cliente } from "@/app/lib/clientes";
import { getToken } from "@/app/lib/auth";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

const sectionTitleClass = "text-lg font-semibold text-gray-900 dark:text-white";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

const btnDanger =
  "data-button rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-[border-color,background-color,color] duration-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950";

type TabEncomendas = "ativas" | "historico";

export default function ClienteDetalhePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const [tabEncomendas, setTabEncomendas] = useState<TabEncomendas>("ativas");
  const criado = searchParams.get("criado") === "1";
  const editado = searchParams.get("editado") === "1";
  const historicoPagina = Math.max(1, parseInt(searchParams.get("historicoPagina") ?? "1", 10) || 1);

  const {
    data: detalheData,
    isLoading: loading,
    isRefetching,
    error: queryError,
  } = useQuery({
    queryKey: ["clientes", id, historicoPagina],
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        throw new Error("Sessão expirada.");
      }
      return fetchClienteDetalhe(token, id, historicoPagina);
    },
    staleTime: 30 * 1000,
    retry: 2,
    enabled: !!id && !!getToken(),
  });

  const cliente = detalheData?.cliente ?? null;
  const encomendasAtivas = detalheData?.encomendasAtivas ?? [];
  const encomendasHistorico = detalheData?.encomendasHistorico ?? [];
  const totalPaginasHistorico = detalheData?.totalPaginasHistorico ?? 1;
  const totalHistorico = detalheData?.totalHistorico ?? 0;

  if (loading) {
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
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          <p className="text-gray-600 dark:text-gray-400">Cliente não encontrado.</p>
          <Link href="/clientes" data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">
            ← Voltar à lista
          </Link>
        </main>
      </div>
    );
  }

  const docs = cliente.documentosExtras ?? [];

  const handleVerDocumento = async (extraId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const url = await fetchDocumentoClienteBlobUrl(token, id, extraId);
      window.open(url, "_blank", "noopener");
    } catch {
      alert("Não foi possível abrir o documento.");
    }
  };

  const buildHistoricoUrl = (pagina: number) => {
    const p = new URLSearchParams(searchParams.toString());
    if (pagina <= 1) p.delete("historicoPagina");
    else p.set("historicoPagina", String(pagina));
    const q = p.toString();
    return `/clientes/${id}${q ? `?${q}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        <div className="mx-auto max-w-5xl">
          {(criado || editado) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mb-6 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              {criado ? "Cliente criado com sucesso." : "Alterações guardadas."}
            </motion.p>
          )}

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                {cliente.nome}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                Ficha do cliente · Registo em {new Date(cliente.dataRegisto).toLocaleDateString("pt-PT")}
                {isRefetching && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]" />
                    A atualizar
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/clientes/${id}/editar`} className={btnPrimary}>
                Editar
              </Link>
              <Link href={`/clientes/${id}/eliminar`} className={btnDanger}>
                Eliminar
              </Link>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.05 }}
              className={cardClass}
            >
              <h2 className={sectionTitleClass}>Identificação e contacto</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-1">
                <div>
                  <dt className={labelClass}>Nome</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{cliente.nome}</dd>
                </div>
                <div>
                  <dt className={labelClass}>Tipo</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">{cliente.tipoCliente}</dd>
                </div>
                <div>
                  <dt className={labelClass}>NIF</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">{cliente.nif ?? "—"}</dd>
                </div>
                <div>
                  <dt className={labelClass}>Email</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">{cliente.email ?? "—"}</dd>
                </div>
                <div>
                  <dt className={labelClass}>Telefone</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">{cliente.telefone ?? "—"}</dd>
                </div>
                <div>
                  <dt className={labelClass}>Morada</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">{cliente.morada ?? "—"}</dd>
                </div>
                {cliente.notas && (
                  <div>
                    <dt className={labelClass}>Observações</dt>
                    <dd className="mt-1 text-gray-600 dark:text-gray-400">{cliente.notas}</dd>
                  </div>
                )}
              </dl>
            </motion.section>

            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.06 }}
              className={cardClass}
            >
              <h2 className={sectionTitleClass}>Documentação</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Documentos extras associados ao cliente.
            </p>
            <div className="mt-4 space-y-2">
              {docs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhum documento guardado.
                </p>
              ) : (
                docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-[#222]"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {doc.nome || "Documento"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleVerDocumento(doc.id)}
                      className="text-sm text-[#f97316] transition-[color] duration-200 hover:underline"
                    >
                      Ver documento
                    </button>
                  </div>
                ))
              )}
            </div>
            </motion.section>
          </div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.1 }}
            className={`mt-6 ${cardClass}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className={sectionTitleClass}>Encomendas</h2>
              <Link
                href="/encomendas"
                className={btnPrimary + " text-sm"}
              >
                Nova encomenda
              </Link>
            </div>
            <div className="mt-4 border-b border-gray-200 dark:border-[#222]">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTabEncomendas("ativas")}
                  className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                    tabEncomendas === "ativas"
                      ? "border-[#f97316] text-[#f97316]"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Encomendas ativas
                </button>
                <button
                  type="button"
                  onClick={() => setTabEncomendas("historico")}
                  className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                    tabEncomendas === "historico"
                      ? "border-[#f97316] text-[#f97316]"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Histórico
                </button>
              </div>
            </div>
            <div className="mt-4 min-h-[120px]">
              {tabEncomendas === "ativas" ? (
                encomendasAtivas.length > 0 ? (
                  <ul className="space-y-2">
                    {encomendasAtivas.map((enc) => (
                      <li key={enc.id}>
                        <Link
                          href={`/encomendas/${String(enc.id)}`}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors hover:bg-gray-50 dark:border-[#222] dark:bg-[#111] dark:hover:bg-[#1a1a1a]"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">Encomenda {enc.id}</span>
                          <span className="text-gray-500 dark:text-gray-400">{enc.estado ?? ""}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-8 text-center dark:border-[#333] dark:bg-[#0a0a0a]/50">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nenhuma encomenda ativa (Pendente, Aceite ou Em preparação).
                    </p>
                    <Link
                      href={`/encomendas/novo?clienteId=${encodeURIComponent(cliente.id)}`}
                      className="mt-3 inline-block text-sm font-medium text-[#f97316] transition-[color] duration-200 hover:underline"
                    >
                      Criar encomenda para este cliente
                    </Link>
                  </div>
                )
              ) : encomendasHistorico.length > 0 || totalHistorico > 0 ? (
                <>
                  <ul className="space-y-2">
                    {encomendasHistorico.map((enc) => (
                      <li key={enc.id}>
                        <Link
                          href={`/encomendas/${String(enc.id)}`}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors hover:bg-gray-50 dark:border-[#222] dark:bg-[#111] dark:hover:bg-[#1a1a1a]"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">Encomenda {enc.id}</span>
                          <span className="text-gray-500 dark:text-gray-400">{enc.estado ?? ""}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {totalHistorico > 0 && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4 dark:border-[#333]">
                      <p className="text-sm text-[#57534e] dark:text-gray-400">
                        {(historicoPagina - 1) * 15 + 1}–
                        {Math.min(historicoPagina * 15, totalHistorico)} de {totalHistorico}
                      </p>
                      {totalPaginasHistorico > 1 && (
                        <div className="flex items-center gap-1 rounded-xl bg-[#f5f5f4] p-1 dark:bg-[#1a1a1a]">
                          <button
                            type="button"
                            onClick={() => router.push(buildHistoricoUrl(historicoPagina - 1))}
                            disabled={historicoPagina <= 1}
                            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-[#1c1917] transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-white hover:text-[#f97316] hover:shadow-sm dark:text-white dark:hover:bg-[#222] dark:hover:text-[#f97316]"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Anterior
                          </button>
                          <span className="px-3 py-2 text-sm text-[#57534e] dark:text-gray-400">
                            Página {historicoPagina} de {totalPaginasHistorico}
                          </span>
                          <button
                            type="button"
                            onClick={() => router.push(buildHistoricoUrl(historicoPagina + 1))}
                            disabled={historicoPagina >= totalPaginasHistorico}
                            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-[#1c1917] transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-white hover:text-[#f97316] hover:shadow-sm dark:text-white dark:hover:bg-[#222] dark:hover:text-[#f97316]"
                          >
                            Próximo
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-8 text-center dark:border-[#333] dark:bg-[#0a0a0a]/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nenhuma encomenda no histórico (Concluídas ou Rejeitadas).
                  </p>
                </div>
              )}
            </div>
          </motion.section>

          <p className="mt-10">
            <Link
              href="/clientes"
              data-button
              className="text-[#f97316] transition-[color] duration-200 hover:underline"
            >
              ← Voltar à lista
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
