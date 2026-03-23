"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import {
  textoClassificacao,
  textoGrupo,
  textoFiltroTecnico,
  textoCalibre,
  CLASSIFICACOES_RISCO,
  GRUPOS_COMPATIBILIDADE,
  FILTROS_TECNICOS,
  CALIBRES,
} from "@/app/lib/produtos";
import type { EncomendaItemCriarViewModel } from "@/app/lib/encomendas";
import { getToken } from "@/app/lib/auth";
import {
  fetchAdicionarItens,
  postAdicionarItem,
  postRemoverItem,
  postSubmeter,
} from "@/app/lib/encomendasApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const inputClass =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

function filtrarProdutos<T extends { nome?: string; familiaRisco?: string; grupoCompatibilidade?: string; filtroTecnico?: string; calibre?: string }>(
  lista: T[],
  pesquisa: string,
  classificacao: string,
  grupoCompatibilidade: string,
  filtroTecnico: string,
  calibre: string
): T[] {
  let out = [...lista];
  if (pesquisa.trim()) {
    const p = pesquisa.trim().toLowerCase();
    out = out.filter((pr) => (pr.nome ?? "").toLowerCase().includes(p));
  }
  if (classificacao) out = out.filter((pr) => pr.familiaRisco === classificacao);
  if (grupoCompatibilidade) out = out.filter((pr) => pr.grupoCompatibilidade === grupoCompatibilidade);
  if (filtroTecnico) out = out.filter((pr) => pr.filtroTecnico === filtroTecnico);
  if (calibre) out = out.filter((pr) => pr.calibre === calibre);
  return out.sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? ""));
}

const MIN_QUANTIDADE = 0.0001;

function AdicionarItensContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteId = searchParams.get("clienteId") ?? "";
  const [mounted, setMounted] = useState(false);
  const [pesquisa, setPesquisa] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [grupoCompatibilidade, setGrupoCompatibilidade] = useState("");
  const [filtroTecnico, setFiltroTecnico] = useState("");
  const [calibre, setCalibre] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [mensagem, setMensagem] = useState<"ItemAdicionado" | "Erro" | "ErroStock" | null>(null);
  const [erroRegistar, setErroRegistar] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [removingProdutoId, setRemovingProdutoId] = useState<number | null>(null);
  const submittingRef = useRef(false);
  const addingRef = useRef(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [apiCliente, setApiCliente] = useState<{ id: number; nome: string } | null>(null);
  const [apiProdutos, setApiProdutos] = useState<Array<{ id: number; nome: string; [k: string]: unknown }>>([]);
  const [apiDraftItens, setApiDraftItens] = useState<Array<{ produtoId: number; produtoNome?: string; quantidade: number }>>([]);
  const [useApi, setUseApi] = useState(false);
  const [loadingApi, setLoadingApi] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const cliente = apiCliente ? { id: String(apiCliente.id), nome: apiCliente.nome } : null;
  const listaProdutosBruta = apiProdutos.map((p) => ({ ...p, id: String(p.id), nome: p.nome }));
  const listaProdutos = filtrarProdutos(
    listaProdutosBruta,
    pesquisa,
    classificacao,
    grupoCompatibilidade,
    filtroTecnico,
    calibre
  );

  useEffect(() => {
    setPesquisa(searchParams.get("pesquisa") ?? "");
    setClassificacao(searchParams.get("classificacao") ?? "");
    setGrupoCompatibilidade(searchParams.get("grupoCompatibilidade") ?? "");
    setFiltroTecnico(searchParams.get("filtroTecnico") ?? "");
    setCalibre(searchParams.get("calibre") ?? "");
  }, [searchParams]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cIdNum = clienteId ? parseInt(clienteId, 10) : NaN;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const validId = mounted && clienteId && !Number.isNaN(cIdNum) && cIdNum >= 1;
    if (!validId) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = null;
      setLoadingApi(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setUseApi(false);
      setLoadingApi(false);
      return;
    }

    const doFetch = () => {
      setLoadingApi(true);
      setLoadError(null);
      fetchAdicionarItens(token, cIdNum, {
        pesquisa: pesquisa || undefined,
        classificacao: classificacao || undefined,
        grupoCompatibilidade: grupoCompatibilidade || undefined,
        filtroTecnico: filtroTecnico || undefined,
        calibre: calibre || undefined,
      })
        .then((data) => {
          const c = data.cliente ?? null;
          setApiCliente(c && (c.id || c.nome) ? c : null);
          setApiProdutos(data.produtosFiltrados ?? []);
          setApiDraftItens(data.itensRascunho ?? []);
          setUseApi(true);
        })
        .catch((err) => {
          setUseApi(false);
          const msg = err instanceof Error ? err.message : "Erro de rede.";
          setLoadError(msg === "Failed to fetch"
            ? "Não foi possível contactar a API. Confirme que o backend está a correr (NEXT_PUBLIC_API_URL)."
            : msg);
        })
        .finally(() => setLoadingApi(false));
    };

    const delayMs = isInitialLoad.current ? 0 : 400;
    if (isInitialLoad.current) isInitialLoad.current = false;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(doFetch, delayMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = null;
    };
  }, [mounted, clienteId, cIdNum, pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (!clienteId) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          <p className="text-gray-600 dark:text-gray-400">Cliente não especificado.</p>
          <Link href="/encomendas/novo" className="mt-4 inline-block text-[#f97316] hover:underline">
            ← Escolher cliente
          </Link>
        </main>
      </div>
    );
  }
  const clienteIdInvalido = Number.isNaN(cIdNum) || cIdNum < 1;
  if (clienteIdInvalido && !loadingApi) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          <p className="text-gray-600 dark:text-gray-400">Identificador de cliente inválido. Volte a escolher o cliente.</p>
          <Link href="/encomendas/novo" className="mt-4 inline-block text-[#f97316] hover:underline">
            ← Escolher cliente
          </Link>
        </main>
      </div>
    );
  }
  if (loadingApi && getToken()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }
  const erroRede = loadError === "Failed to fetch" || loadError?.includes("contactar a API");
  const textoErroCarregar = loadError
    ? (erroRede ? "Não foi possível contactar a API. Confirme que o backend está a correr (NEXT_PUBLIC_API_URL) e CORS." : loadError)
    : null;

  if (useApi && !apiCliente) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          <p className="text-gray-600 dark:text-gray-400">Cliente não encontrado.</p>
          <Link href="/encomendas/novo" className="mt-4 inline-block text-[#f97316] hover:underline">
            ← Escolher cliente
          </Link>
        </main>
      </div>
    );
  }
  if (!loadingApi && !apiCliente && clienteId && !clienteIdInvalido) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          {textoErroCarregar ? (
            <p className="mb-4 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
              {textoErroCarregar}
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Cliente não encontrado. Pode ter sido eliminado. Volte a escolher o cliente na página anterior.</p>
          )}
          <Link href="/encomendas/novo" className="mt-4 inline-block text-[#f97316] hover:underline">
            ← Escolher cliente
          </Link>
        </main>
      </div>
    );
  }

  const buildFilterUrl = () => {
    const p = new URLSearchParams();
    p.set("clienteId", clienteId);
    if (pesquisa) p.set("pesquisa", pesquisa);
    if (classificacao) p.set("classificacao", classificacao);
    if (grupoCompatibilidade) p.set("grupoCompatibilidade", grupoCompatibilidade);
    if (filtroTecnico) p.set("filtroTecnico", filtroTecnico);
    if (calibre) p.set("calibre", calibre);
    return `/encomendas/novo/adicionar-itens?${p.toString()}`;
  };

  const handleAdicionarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addingRef.current || isAdding) return;
    const q = parseFloat(quantidade.replace(",", "."));
    if (!produtoId || Number.isNaN(q) || q < MIN_QUANTIDADE) {
      setMensagem("Erro");
      return;
    }
    const token = getToken();
    if (!token) {
      setMensagem("Erro");
      return;
    }
    addingRef.current = true;
    setIsAdding(true);
    setMensagem(null);
    try {
      const res = await postAdicionarItem(token, {
        clienteId: cIdNum,
        produtoId: parseInt(produtoId, 10),
        quantidade: q,
        pesquisa: pesquisa || undefined,
        classificacao: classificacao || undefined,
        grupoCompatibilidade: grupoCompatibilidade || undefined,
        filtroTecnico: filtroTecnico || undefined,
        calibre: calibre || undefined,
      });
      setApiDraftItens(res.draft?.itens ?? []);
      setQuantidade("");
      setProdutoId("");
      setMensagem("ItemAdicionado");
    } catch {
      setMensagem("Erro");
    } finally {
      addingRef.current = false;
      setIsAdding(false);
    }
  };

  const handleRemoverItem = async (produtoIdRemover: string) => {
    const token = getToken();
    if (!token) return;
    const idNum = parseInt(produtoIdRemover, 10);
    if (removingProdutoId != null) return;
    setRemovingProdutoId(idNum);
    try {
      const res = await postRemoverItem(token, {
        clienteId: cIdNum,
        produtoId: idNum,
        pesquisa: pesquisa || undefined,
        classificacao: classificacao || undefined,
        grupoCompatibilidade: grupoCompatibilidade || undefined,
        filtroTecnico: filtroTecnico || undefined,
        calibre: calibre || undefined,
      });
      setApiDraftItens(res.draft?.itens ?? []);
    } catch (_) {}
    finally {
      setRemovingProdutoId(null);
    }
  };

  const handleRegistarEncomenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setErroRegistar(null);
    const token = getToken();
    if (!token) {
      setMensagem("Erro");
      setErroRegistar("Sessão expirada. Faça login novamente.");
      return;
    }
    if (apiDraftItens.length === 0) {
      setMensagem("Erro");
      setErroRegistar("Adicione pelo menos um produto à encomenda antes de registar.");
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setMensagem(null);
    try {
      const res = await postSubmeter(token, {
        clienteId: cIdNum,
        dataEntrega: dataEntrega.trim() || null,
        observacoes: observacoes.trim() || null,
      });
      const id = res.encomenda?.id;
      if (id != null) router.push(`/encomendas/${id}?criada=1`);
      else {
        setMensagem("Erro");
        setErroRegistar("Resposta inválida do servidor.");
      }
    } catch (err) {
      setMensagem("Erro");
      const msg = err instanceof Error ? err.message : "Erro ao registar encomenda.";
      setErroRegistar(msg === "Failed to fetch"
        ? "Não foi possível contactar a API. Confirme que o backend está a correr (NEXT_PUBLIC_API_URL)."
        : msg);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const temFiltros = pesquisa || classificacao || grupoCompatibilidade || filtroTecnico || calibre;
  const itens = apiDraftItens.map((i) => ({ ...i, produtoId: String(i.produtoId) }));

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        <div className="mx-auto max-w-6xl">
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
                Cliente: <strong>{cliente?.nome}</strong>.{" "}
                <Link href="/encomendas/novo" className="text-[#f97316] hover:underline">
                  Alterar cliente
                </Link>
              </p>
            </div>

            {mensagem === "ItemAdicionado" && (
              <p className="rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Item adicionado ao rascunho.
              </p>
            )}
            {mensagem === "Erro" && (
              <p className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {erroRegistar ?? "Erro. Verifique os dados e tente novamente."}
              </p>
            )}
            {mensagem === "ErroStock" && (
              <p className="rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                Stock insuficiente para um dos itens.
              </p>
            )}

            <div className="mt-4 grid gap-8 lg:grid-cols-3">
              {/* Coluna principal: filtros + produtos + form adicionar */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={fadeInUp.initial}
                  animate={fadeInUp.animate}
                  transition={{ ...transitionSmooth, delay: 0.05 }}
                  className="card-hover rounded-2xl border border-[#e7e5e4] bg-white p-5 dark:border-[#1f1f1f] dark:bg-[#111] sm:p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Procurar no catálogo
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pesquisa</label>
                      <input
                        type="search"
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        className={`${inputClass} mt-1 w-full`}
                        placeholder="Nome"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Classificação</label>
                      <select value={classificacao} onChange={(e) => setClassificacao(e.target.value)} className={`${inputClass} mt-1 w-full`}>
                        <option value="">Todas</option>
                        {CLASSIFICACOES_RISCO.map((c) => (
                          <option key={c} value={c}>{textoClassificacao(c)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grupo</label>
                      <select value={grupoCompatibilidade} onChange={(e) => setGrupoCompatibilidade(e.target.value)} className={`${inputClass} mt-1 w-full`}>
                        <option value="">Todos</option>
                        {GRUPOS_COMPATIBILIDADE.map((g) => (
                          <option key={g.value} value={g.value}>{g.text}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filtro técnico</label>
                      <select value={filtroTecnico} onChange={(e) => setFiltroTecnico(e.target.value)} className={`${inputClass} mt-1 w-full`}>
                        <option value="">Todos</option>
                        {FILTROS_TECNICOS.map((f) => (
                          <option key={f.value} value={f.value}>{f.text}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Calibre</label>
                      <select value={calibre} onChange={(e) => setCalibre(e.target.value)} className={`${inputClass} mt-1 w-full`}>
                        <option value="">Todos</option>
                        {CALIBRES.map((c) => (
                          <option key={c.value} value={c.value}>{c.text}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => router.push(buildFilterUrl())} className={btnPrimary}>
                      Procurar
                    </button>
                    {temFiltros && (
                      <Link href={`/encomendas/novo/adicionar-itens?clienteId=${clienteId}`} className={btnSecondary}>
                        Limpar filtros
                      </Link>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={fadeInUp.initial}
                  animate={fadeInUp.animate}
                  transition={{ ...transitionSmooth, delay: 0.07 }}
                  className="card-hover rounded-2xl border border-[#e7e5e4] bg-white p-5 dark:border-[#1f1f1f] dark:bg-[#111] sm:p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Adicionar à encomenda
                  </h2>
                  <form onSubmit={handleAdicionarItem} className="mt-4 flex flex-wrap items-end gap-4">
                    <div className="min-w-[180px] flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Produto</label>
                      <select
                        value={produtoId}
                        onChange={(e) => setProdutoId(e.target.value)}
                        className={`${inputClass} mt-1 w-full`}
                        required
                      >
                        <option value="">— Selecionar —</option>
                        {listaProdutos.map((pr) => (
                          <option key={pr.id} value={pr.id}>{pr.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-28">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade</label>
                      <input
                        type="number"
                        min={MIN_QUANTIDADE}
                        step="any"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                        className={`${inputClass} mt-1 w-full`}
                        placeholder="0"
                        required
                      />
                    </div>
                    <button type="submit" className={btnPrimary} disabled={isAdding}>
                      {isAdding ? "A adicionar…" : "Adicionar à encomenda"}
                    </button>
                  </form>
                  <p className="mt-2 text-xs text-[#57534e] dark:text-gray-400">
                    {listaProdutos.length} produto(s) na lista filtrada.
                  </p>
                </motion.div>
              </div>

              {/* Coluna lateral: itens do rascunho */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={fadeInUp.initial}
                  animate={fadeInUp.animate}
                  transition={{ ...transitionSmooth, delay: 0.06 }}
                  className="card-hover rounded-2xl border border-[#e7e5e4] bg-white p-5 dark:border-[#1f1f1f] dark:bg-[#111] sm:p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Itens da encomenda
                  </h2>
                  {itens.length === 0 ? (
                    <p className="mt-4 text-sm text-[#57534e] dark:text-gray-400">
                      Nenhum item. Use o formulário ao lado para adicionar produtos.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-2">
                      {itens.map((item) => (
                        <li
                          key={item.produtoId}
                          className="flex items-center justify-between rounded-xl border border-[#e7e5e4] px-3 py-2 dark:border-[#333]"
                        >
                          <span className="text-sm font-medium text-[#1c1917] dark:text-white">{item.produtoNome}</span>
                          <span className="text-sm text-[#57534e] dark:text-gray-400">× {item.quantidade}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoverItem(item.produtoId)}
                            disabled={removingProdutoId === parseInt(item.produtoId, 10)}
                            className="text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400"
                          >
                            {removingProdutoId === parseInt(item.produtoId, 10) ? "A remover…" : "Remover"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {itens.length > 0 && (
                    <form onSubmit={handleRegistarEncomenda} className="mt-6 space-y-4 border-t border-[#e7e5e4] pt-6 dark:border-[#333]">
                      <h3 className="font-medium text-gray-900 dark:text-white">Registar encomenda</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de entrega</label>
                        <input
                          type="date"
                          value={dataEntrega}
                          onChange={(e) => setDataEntrega(e.target.value)}
                          className={`${inputClass} mt-1 w-full`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observações (máx. 2000)</label>
                        <textarea
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value.slice(0, 2000))}
                          maxLength={2000}
                          rows={3}
                          className={`${inputClass} mt-1 w-full`}
                        />
                      </div>
                      <button type="submit" className={`${btnPrimary} w-full`} disabled={submitting}>
                        {submitting ? "A registar…" : "Registar encomenda"}
                      </button>
                    </form>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function AdicionarItensPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <AdicionarItensContent />
    </Suspense>
  );
}
