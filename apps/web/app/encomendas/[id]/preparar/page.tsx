"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { fetchPreparar, postRegistarPreparacao, type RetiradaPreparacaoInput } from "@/app/lib/encomendasApi";
import { mensagemErroPreparacao } from "@/app/lib/encomendaErrors";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { btnPrimary, btnSecondary, btnDanger } from "@/app/components/ui/tokens";

const inputClass =
  "w-20 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-right text-sm text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";

const TOL = 0.0001;

type ItemPreparar = { id: string; produtoId: string; quantidadePedida: number; produto?: { nome?: string } | null; produtoNome?: string };
type PaiolPreparar = { id: string; nome: string };

export default function PrepararEncomendaPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [mounted, setMounted] = useState(false);
  const [retiradas, setRetiradas] = useState<Record<string, Record<string, number>>>({});
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  /** Checklist visual por linha (não é enviado ao servidor). */
  const [itensMarcados, setItensMarcados] = useState<Record<string, boolean>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [apiData, setApiData] = useState<{
    encomenda: { itens: ItemPreparar[]; cliente?: { nome?: string }; clienteId?: string };
    paiois: PaiolPreparar[];
    stockPorProduto: Record<string, number>;
    stockPaiolProduto: Record<string, number>;
  } | null>(null);
  const [loadingApi, setLoadingApi] = useState(true);

  const idNum = parseInt(id, 10);
  const isApiId = !Number.isNaN(idNum);

  const stockPaiolProduto = useMemo(() => {
    const m = new Map<string, number>();
    if (apiData?.stockPaiolProduto) {
      for (const [k, v] of Object.entries(apiData.stockPaiolProduto)) m.set(k, Number(v));
    }
    return m;
  }, [apiData?.stockPaiolProduto]);
  const stockPorProdutoMap = useMemo(() => {
    const m = new Map<string, number>();
    if (apiData?.stockPorProduto) {
      for (const [k, v] of Object.entries(apiData.stockPorProduto)) m.set(k, Number(v));
    }
    return m;
  }, [apiData?.stockPorProduto]);
  const encomenda = useMemo(() => {
    const base = apiData?.encomenda;
    if (!base) return null;
    return { ...base, stockPorProduto: stockPorProdutoMap };
  }, [apiData?.encomenda, stockPorProdutoMap]);
  const paiois = useMemo(() => apiData?.paiois ?? [], [apiData?.paiois]);

  useEffect(() => {
    setMounted(true);
  }, [id]);

  useEffect(() => {
    if (!mounted || !isApiId) {
      setApiData(null);
      setLoadingApi(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setApiData(null);
      setLoadingApi(false);
      return;
    }
    fetchPreparar(token, idNum)
      .then((data) => {
        const dataAny = data as unknown as Record<string, unknown>;
        const erroApi = dataAny.error ?? dataAny.Error;
        if (typeof erroApi === "string" && erroApi.trim()) {
          setApiData(null);
          setErro(erroApi);
          return;
        }
        const enc = data.encomenda as Record<string, unknown>;
        if (!enc || typeof enc !== "object") {
          setApiData(null);
          return;
        }
        const itensRaw = enc?.itens ?? enc?.Itens ?? [];
        const itens: ItemPreparar[] = Array.isArray(itensRaw)
          ? itensRaw.map((i: Record<string, unknown>) => {
              const gi = (k: string) => i[k] ?? i[k.charAt(0).toUpperCase() + k.slice(1)];
              const prod = gi("produto") ?? gi("Produto");
              const prodObj = prod && typeof prod === "object" ? (prod as Record<string, unknown>) : null;
              return {
                id: String(gi("id") ?? gi("Id") ?? ""),
                produtoId: String(gi("produtoId") ?? gi("ProdutoId") ?? ""),
                quantidadePedida: Number(gi("quantidadePedida") ?? gi("QuantidadePedida") ?? 0),
                produto: prodObj ? { nome: String(prodObj.nome ?? prodObj.Nome ?? "") } : null,
                produtoNome: prodObj ? String(prodObj.nome ?? prodObj.Nome ?? "") : undefined,
              };
            })
          : [];
        const paioisRaw = (dataAny["paióis"] ?? dataAny["paiois"] ?? []) as unknown;
        const paioisMapped: PaiolPreparar[] = Array.isArray(paioisRaw)
          ? paioisRaw.map((p: { id?: number; nome?: string }) => ({ id: String(p.id ?? ""), nome: String(p.nome ?? "") }))
          : [];
        setApiData({
          encomenda: {
            itens: itens,
            cliente: (enc?.cliente ?? enc?.Cliente) as { nome?: string },
            clienteId: String(enc?.clienteId ?? enc?.ClienteId ?? ""),
          },
          paiois: paioisMapped,
          stockPorProduto: (data.stockPorProduto ?? {}) as Record<string, number>,
          stockPaiolProduto: (data.stockPaiolProduto ?? {}) as Record<string, number>,
        });
      })
      .catch(() => setApiData(null))
      .finally(() => setLoadingApi(false));
  }, [mounted, id, idNum, isApiId]);

  const toggleItemMarcado = (encomendaItemId: string) => {
    setItensMarcados((prev) => ({ ...prev, [encomendaItemId]: !prev[encomendaItemId] }));
  };

  const setRetirada = (encomendaItemId: string, paiolId: string, value: number) => {
    setRetiradas((prev) => {
      const next = { ...prev };
      if (!next[encomendaItemId]) next[encomendaItemId] = {};
      next[encomendaItemId] = { ...next[encomendaItemId], [paiolId]: value };
      return next;
    });
  };

  const getRetirada = (encomendaItemId: string, paiolId: string): number =>
    retiradas[encomendaItemId]?.[paiolId] ?? 0;

  /** Paióis que têm stock deste produto (para mostrar só os relevantes na linha expandida) */
  const paioisComStockPorItem = useMemo(() => {
    const map = new Map<string, PaiolPreparar[]>();
    if (!encomenda) return map;
    for (const item of encomenda.itens) {
      const lista = paiois.filter((p) => (stockPaiolProduto.get(`${p.id}_${item.produtoId}`) ?? 0) > 0);
      map.set(item.id, lista);
    }
    return map;
  }, [encomenda, paiois, stockPaiolProduto]);

  /** Texto resumo "P1: 5, P2: 3" para a coluna Retirar de */
  const resumoRetiradas = (itemId: string): string => {
    const itemRet = retiradas[itemId];
    if (!itemRet) return "—";
    const partes = Object.entries(itemRet)
      .filter(([, q]) => q > 0)
      .map(([paiolId]) => {
        const p = paiois.find((x) => x.id === paiolId);
        return p ? `${p.nome}: ${Number(itemRet[paiolId]).toFixed(4)}` : "";
      })
      .filter(Boolean);
    return partes.length > 0 ? partes.join(", ") : "—";
  };

  const somaPorItem = useMemo(() => {
    const map = new Map<string, number>();
    if (!encomenda) return map;
    for (const item of encomenda.itens) {
      let s = 0;
      const itemRet = retiradas[item.id];
      if (itemRet) for (const q of Object.values(itemRet)) s += q;
      map.set(item.id, s);
    }
    return map;
  }, [encomenda, retiradas]);

  const validacaoOk = useMemo(() => {
    if (!encomenda) return false;
    return encomenda.itens.every(
      (item) => Math.abs((somaPorItem.get(item.id) ?? 0) - item.quantidadePedida) <= TOL
    );
  }, [encomenda, somaPorItem]);

  const algumSemStockTotal = encomenda?.itens.some(
    (item) => (encomenda.stockPorProduto.get(item.produtoId) ?? 0) < item.quantidadePedida
  );

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (loadingApi && isApiId && getToken()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (!encomenda) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          <p className="text-gray-600 dark:text-gray-400">
            {erro ?? "Encomenda não encontrada ou estado não permite preparação (tem de estar Aceite)."}
          </p>
          <Link href={`/encomendas/${id}`} className="mt-4 inline-block text-[#f97316] hover:underline">
            ← Voltar à encomenda
          </Link>
        </main>
      </div>
    );
  }

  const handleRegistar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setErro(null);
    if (!validacaoOk) {
      setErro("A soma das quantidades por produto deve ser igual à quantidade pedida.");
      return;
    }
    const token = getToken();
    if (!isApiId || !token) {
      setErro("Sessão inválida. Faça login.");
      return;
    }
    const listaApi: RetiradaPreparacaoInput[] = [];
    for (const item of encomenda.itens) {
      for (const p of paiois) {
        const q = getRetirada(item.id, p.id);
        if (q > 0) {
          listaApi.push({
            encomendaItemId: parseInt(item.id, 10),
            paiolId: parseInt(p.id, 10),
            quantidade: q,
          });
        }
      }
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await postRegistarPreparacao(token, idNum, listaApi);
      await queryClient.invalidateQueries({ queryKey: ["encomendas", id] });
      await queryClient.invalidateQueries({ queryKey: ["encomendas"] });
      router.push(`/encomendas/${id}?preparacao=1`);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Erro ao registar preparação.";
      setErro(mensagemErroPreparacao(raw));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const clienteNome = encomenda.cliente?.nome ?? encomenda.clienteId;

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
          >
            <h1 className="font-heading text-2xl tracking-tight sm:text-3xl">
              Registar preparação
            </h1>
            <p className="mt-1 text-[#57534e] dark:text-gray-400">
              Encomenda #{id} · Cliente: {clienteNome}
            </p>
          </motion.div>

          {algumSemStockTotal && (
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.03 }}
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20"
            >
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Algum item tem stock total insuficiente. Ajuste as quantidades por paiol ou rejeite a encomenda.
              </p>
            </motion.div>
          )}

          {erro && (
            <p className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {erro}
            </p>
          )}

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-6 dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8"
          >
            <p className="mb-4 text-sm text-[#57534e] dark:text-gray-400">
              Para cada produto, indique de que paiol(s) retirar. A soma por produto deve ser igual à quantidade pedida. O sistema usa FIFO (primeiro a entrar, primeiro a sair). Use a coluna à esquerda para marcar o que já tem em mãos.
            </p>

            <form onSubmit={handleRegistar}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e7e5e4] dark:border-[#222]">
                      <th className="w-12 pb-2 pr-2 font-semibold text-[#444] dark:text-gray-300" scope="col">
                        <span className="sr-only">Material pronto</span>
                      </th>
                      <th className="pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Produto</th>
                      <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Qtd pedida</th>
                      <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Em stock</th>
                      <th className="pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Retirar de</th>
                      <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Soma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {encomenda.itens.map((item) => {
                      const stockTotal = encomenda.stockPorProduto.get(item.produtoId) ?? 0;
                      const soma = somaPorItem.get(item.id) ?? 0;
                      const ok = Math.abs(soma - item.quantidadePedida) <= TOL;
                      const paioisComStock = paioisComStockPorItem.get(item.id) ?? [];
                      const isExpanded = expandedItemId === item.id;
                      const marcado = !!itensMarcados[item.id];
                      return (
                        <React.Fragment key={item.id}>
                          <tr
                            className={`border-b border-[#f5f5f4] dark:border-[#1a1a1a] ${marcado ? "bg-emerald-50/60 dark:bg-emerald-950/20" : ""}`}
                          >
                            <td className="py-2 pr-2 align-middle">
                              <button
                                type="button"
                                role="checkbox"
                                aria-checked={marcado}
                                aria-label={`Marcar material pronto: ${item.produto?.nome ?? item.produtoId}`}
                                onClick={() => toggleItemMarcado(item.id)}
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 text-base leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] ${
                                  marcado
                                    ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-600"
                                    : "border-[#d6d3d1] bg-white text-transparent hover:border-[#a8a29e] dark:border-[#444] dark:bg-[#1a1a1a] dark:hover:border-[#666]"
                                }`}
                              >
                                {marcado ? "✓" : "\u00a0"}
                              </button>
                            </td>
                            <td className="py-2 pr-4 font-medium text-[#1c1917] dark:text-white">
                              {item.produto?.nome ?? item.produtoId}
                            </td>
                            <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">
                              {item.quantidadePedida}
                            </td>
                            <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">
                              {stockTotal}
                            </td>
                            <td className="py-2 pr-4">
                              <span className="text-[#57534e] dark:text-gray-400">{resumoRetiradas(item.id)}</span>
                              {paioisComStock.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                                  className="ml-2 rounded-lg border border-[#e7e5e4] bg-white px-2 py-1 text-xs font-medium text-[#57534e] hover:bg-[#fafaf9] dark:border-[#333] dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:bg-[#222]"
                                >
                                  {isExpanded ? "Fechar" : "Definir"}
                                </button>
                              )}
                            </td>
                            <td className={`whitespace-nowrap py-2 pr-4 font-medium ${ok ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                              {soma.toFixed(4)}
                            </td>
                          </tr>
                          {isExpanded && paioisComStock.length > 0 && (
                            <tr className="border-b border-[#f5f5f4] bg-[#fafaf9] dark:border-[#1a1a1a] dark:bg-[#0d0d0d]">
                              <td colSpan={6} className="px-4 py-3">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#78716c] dark:text-gray-500">
                                  Quantidade a retirar de cada paiol (soma = {item.quantidadePedida})
                                </p>
                                <div className="flex flex-wrap gap-4">
                                  {paioisComStock.map((p) => {
                                    const key = `${p.id}_${item.produtoId}`;
                                    const stockAqui = stockPaiolProduto.get(key) ?? 0;
                                    return (
                                      <div key={p.id} className="flex items-center gap-2">
                                        <label htmlFor={`ret-${item.id}-${p.id}`} className="min-w-[100px] text-sm text-[#57534e] dark:text-gray-400">
                                          {p.nome} <span className="text-[#78716c]">(máx. {stockAqui})</span>
                                        </label>
                                        <input
                                          id={`ret-${item.id}-${p.id}`}
                                          type="number"
                                          min={0}
                                          max={stockAqui}
                                          step="any"
                                          value={getRetirada(item.id, p.id) || ""}
                                          onChange={(e) => {
                                            const v = parseFloat(e.target.value.replace(",", "."));
                                            setRetirada(item.id, p.id, Number.isNaN(v) ? 0 : v);
                                          }}
                                          className={inputClass}
                                          placeholder="0"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button type="submit" className={btnPrimary} disabled={submitting || !validacaoOk}>
                  {submitting ? "A registar…" : "Registar preparação"}
                </button>
                <Link href={`/encomendas/${id}/rejeitar`} className={btnDanger}>
                  Rejeitar encomenda
                </Link>
                <Link href={`/encomendas/${id}`} className={btnSecondary}>
                  Cancelar
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
