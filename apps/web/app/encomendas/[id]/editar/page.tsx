"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import { useUser } from "@/app/context/UserContext";
import { fetchEncomendaDetalhe, putEncomenda } from "@/app/lib/encomendasApi";
import { fetchList } from "@/app/lib/produtosApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const inputClass =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

const MIN_QUANTIDADE = 0.0001;

type ItemEdit = { produtoId: string; produtoNome: string; quantidade: number };

function mapApiToForm(data: { encomenda: Record<string, unknown> }): {
  id: string;
  clienteId: string;
  clienteNome: string;
  estado: string;
  dataEntrega: string;
  observacoes: string;
  itens: ItemEdit[];
} {
  const e = data.encomenda;
  const get = (k: string) => e[k] ?? e[k.charAt(0).toUpperCase() + k.slice(1)];
  const itensRaw = (get("itens") ?? get("Itens")) as Array<Record<string, unknown>> | undefined;
  const itens: ItemEdit[] = (itensRaw ?? []).map((i) => {
    const gi = (key: string) => i[key] ?? i[key.charAt(0).toUpperCase() + key.slice(1)];
    const prod = gi("produto") ?? gi("Produto");
    const prodObj = prod && typeof prod === "object" ? (prod as Record<string, unknown>) : null;
    const nome = prodObj ? String(prodObj.nome ?? prodObj.Nome ?? "") : "";
    return {
      produtoId: String(gi("produtoId") ?? gi("ProdutoId") ?? ""),
      produtoNome: nome,
      quantidade: Number(gi("quantidadePedida") ?? gi("QuantidadePedida") ?? 0),
    };
  });
  const cliente = get("cliente") ?? get("Cliente");
  const clienteObj = cliente && typeof cliente === "object" ? (cliente as Record<string, unknown>) : null;
  const dataEntregaRaw = get("dataEntrega") ?? get("DataEntrega");
  const dataEntregaStr =
    dataEntregaRaw != null
      ? typeof dataEntregaRaw === "string"
        ? dataEntregaRaw.slice(0, 10)
        : new Date(dataEntregaRaw as string).toISOString().slice(0, 10)
      : "";
  return {
    id: String(get("id") ?? get("Id") ?? ""),
    clienteId: String(get("clienteId") ?? get("ClienteId") ?? ""),
    clienteNome: clienteObj ? String(clienteObj.nome ?? clienteObj.Nome ?? "") : "",
    estado: String(get("estado") ?? get("Estado") ?? "Pendente"),
    dataEntrega: dataEntregaStr,
    observacoes: String(get("observacoes") ?? get("Observacoes") ?? ""),
    itens,
  };
}

export default function EditarEncomendaPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const numId = parseInt(id, 10);
  const validId = !Number.isNaN(numId);

  const { user } = useUser();
  const userId = user?.id ?? user?.email ?? null;
  const canGerirEncomendas = (user?.permissions ?? []).includes("encomendas.gerir");
  const [dataEntrega, setDataEntrega] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<ItemEdit[]>([]);
  const [novoProdutoId, setNovoProdutoId] = useState("");
  const [novaQuantidade, setNovaQuantidade] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const { data: editData, isLoading: loadingEncomenda, error: queryError } = useQuery({
    queryKey: ["encomendas", id, "edit"],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      return fetchEncomendaDetalhe(token, numId);
    },
    staleTime: 60 * 1000,
    retry: 1,
    retryDelay: 800,
    enabled: validId && !!getToken(),
  });

  const { data: produtosData, isLoading: loadingProdutos } = useQuery({
    queryKey: ["produtos", "list"],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      return fetchList(token, {});
    },
    staleTime: 60 * 1000,
    enabled: validId && !!getToken(),
  });

  const encomendaForm = editData ? mapApiToForm(editData) : null;
  const produtos = (produtosData?.items ?? []) as Array<{ id?: number; Id?: number; nome?: string; Nome?: string }>;
  const produtosSorted = [...produtos].sort((a, b) =>
    String(a.nome ?? a.Nome ?? "").localeCompare(String(b.nome ?? b.Nome ?? ""))
  );
  const produtosJaNaEncomenda = new Set(itens.map((i) => i.produtoId));

  useEffect(() => {
    if (encomendaForm) {
      setDataEntrega(encomendaForm.dataEntrega);
      setObservacoes(encomendaForm.observacoes);
      setItens(encomendaForm.itens);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sincronizar só quando muda o id (encomendaForm muda referência a cada render)
  }, [encomendaForm?.id]);

  const mutation = useMutation({
    mutationFn: async (payload: { dataEntrega: string; observacoes: string; itens: ItemEdit[] }) => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      await putEncomenda(token, numId, {
        dataEntrega: payload.dataEntrega.trim() || null,
        observacoes: payload.observacoes.trim() || null,
        itens: payload.itens.map((i) => ({ produtoId: parseInt(i.produtoId, 10), quantidade: i.quantidade })),
      });
    },
    onSuccess: () => {
      useToastStore.getState().show("Encomenda atualizada com sucesso.", "success");
      queryClient.invalidateQueries({ queryKey: ["encomendas"] });
      queryClient.invalidateQueries({ queryKey: ["encomendas", id] });
      router.push(`/encomendas/${id}?editada=1`);
    },
    onError: (err: Error) => setErro(err.message || "Erro ao guardar."),
    onSettled: () => {
      submittingRef.current = false;
    },
  });

  const podeEditar =
    encomendaForm &&
    (encomendaForm.estado === "Pendente" || encomendaForm.estado === "Aceite") &&
    (canGerirEncomendas || !!userId);

  if (loadingEncomenda && validId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (queryError || !encomendaForm) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          {queryError && (
            <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {queryError instanceof Error ? queryError.message : "Erro ao carregar."}
            </p>
          )}
          {!queryError && <p className="text-gray-600 dark:text-gray-400">Encomenda não encontrada.</p>}
          <Link href="/encomendas" className="mt-4 inline-block text-[#f97316] hover:underline">
            ← Voltar às Encomendas
          </Link>
        </main>
      </div>
    );
  }

  if (!podeEditar) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          <p className="text-gray-600 dark:text-gray-400">
            Apenas o criador da encomenda ou um administrador podem editá-la. Encomendas só podem ser editadas nos estados Pendente ou Aceite.
          </p>
          <Link href={`/encomendas/${id}`} className="mt-4 inline-block text-[#f97316] hover:underline">
            ← Voltar aos detalhes
          </Link>
        </main>
      </div>
    );
  }

  if (encomendaForm.estado !== "Pendente" && encomendaForm.estado !== "Aceite") {
    router.replace(`/encomendas/${id}?erro=1`);
    return null;
  }

  const setQuantidade = (produtoId: string, quantidade: number) => {
    setItens((prev) => prev.map((i) => (i.produtoId === produtoId ? { ...i, quantidade } : i)));
  };

  const removerItem = (produtoId: string) => {
    setItens((prev) => prev.filter((i) => i.produtoId !== produtoId));
  };

  const adicionarItem = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    const pr = produtosSorted.find((p) => String(p.id ?? p.Id) === novoProdutoId);
    const q = parseFloat(novaQuantidade.replace(",", "."));
    if (!pr || Number.isNaN(q) || q < MIN_QUANTIDADE) {
      setErro("Selecione um produto e uma quantidade válida (mín. 0,0001).");
      return;
    }
    const existente = itens.find((i) => i.produtoId === novoProdutoId);
    if (existente) {
      setQuantidade(novoProdutoId, existente.quantidade + q);
    } else {
      setItens((prev) => [
        ...prev,
        {
          produtoId: String(pr.id ?? pr.Id),
          produtoNome: String(pr.nome ?? pr.Nome ?? ""),
          quantidade: q,
        },
      ]);
    }
    setNovoProdutoId("");
    setNovaQuantidade("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setErro(null);
    const validos = itens.filter((i) => i.quantidade >= MIN_QUANTIDADE);
    if (validos.length === 0) {
      setErro("A encomenda tem de ter pelo menos um item com quantidade positiva.");
      return;
    }
    submittingRef.current = true;
    mutation.mutate({ dataEntrega, observacoes, itens: validos });
  };

  const submitting = mutation.isPending;
  const clienteNome = encomendaForm.clienteNome || encomendaForm.clienteId;

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main className="relative px-6 pt-14 pb-10 sm:px-8" style={{ paddingTop: CONTENT_OFFSET_TOP }}>
        <div className="mx-auto max-w-3xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight sm:text-3xl">Editar encomenda</h1>
            <p className="mt-1 text-[#57534e] dark:text-gray-400">
              Encomenda #{id} · Cliente: {clienteNome} · Estado: {encomendaForm.estado}
            </p>
          </motion.div>

          {erro && (
            <p className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {erro}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.05 }}
              className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-6 dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data e observações</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="dataEntrega" className={labelClass}>
                    Data de entrega
                  </label>
                  <input
                    id="dataEntrega"
                    type="date"
                    value={dataEntrega}
                    onChange={(e) => setDataEntrega(e.target.value)}
                    className={`${inputClass} mt-2 w-full`}
                  />
                </div>
                <div>
                  <label htmlFor="observacoes" className={labelClass}>
                    Observações (máx. 2000 caracteres)
                  </label>
                  <textarea
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value.slice(0, 2000))}
                    maxLength={2000}
                    rows={4}
                    className={`${inputClass} mt-2 w-full`}
                    placeholder="Notas internas sobre a encomenda..."
                  />
                  <p className="mt-1 text-xs text-[#57534e] dark:text-gray-500">{observacoes.length}/2000</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.07 }}
              className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-6 dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Itens da encomenda</h2>
              {itens.length === 0 ? (
                <p className="mt-4 text-sm text-[#57534e] dark:text-gray-400">Nenhum item. Adicione produtos abaixo.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {itens.map((item) => (
                    <li
                      key={item.produtoId}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e7e5e4] px-4 py-3 dark:border-[#333]"
                    >
                      <span className="min-w-[180px] font-medium text-[#1c1917] dark:text-white">
                        {item.produtoNome}
                      </span>
                      <input
                        type="number"
                        min={MIN_QUANTIDADE}
                        step="any"
                        value={item.quantidade}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value.replace(",", "."));
                          setQuantidade(item.produtoId, Number.isNaN(v) ? 0 : v);
                        }}
                        className={`${inputClass} w-24 text-right`}
                      />
                      <button
                        type="button"
                        onClick={() => removerItem(item.produtoId)}
                        className="text-sm text-red-600 hover:underline dark:text-red-400"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <h3 className="mt-8 text-base font-semibold text-gray-900 dark:text-white">Adicionar produto</h3>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div className="min-w-[200px] flex-1">
                  <label htmlFor="novoProduto" className={labelClass}>
                    Produto
                  </label>
                  <select
                    id="novoProduto"
                    value={novoProdutoId}
                    onChange={(e) => setNovoProdutoId(e.target.value)}
                    disabled={loadingProdutos}
                    className={`${inputClass} mt-1 w-full`}
                  >
                    <option value="">{loadingProdutos ? "A carregar produtos…" : "— Selecionar —"}</option>
                    {produtosSorted.map((pr) => {
                      const pid = String(pr.id ?? pr.Id);
                      return (
                        <option key={pid} value={pid} disabled={produtosJaNaEncomenda.has(pid)}>
                          {String(pr.nome ?? pr.Nome ?? "")}
                          {produtosJaNaEncomenda.has(pid) ? " (já na encomenda)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="w-28">
                  <label htmlFor="novaQtd" className={labelClass}>
                    Quantidade
                  </label>
                  <input
                    id="novaQtd"
                    type="number"
                    min={MIN_QUANTIDADE}
                    step="any"
                    value={novaQuantidade}
                    onChange={(e) => setNovaQuantidade(e.target.value)}
                    className={`${inputClass} mt-1 w-full`}
                    placeholder="0"
                  />
                </div>
                <button type="button" onClick={adicionarItem} className={btnPrimary}>
                  Adicionar
                </button>
              </div>
            </motion.div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="submit"
                className={btnPrimary}
                disabled={submitting || itens.filter((i) => i.quantidade >= MIN_QUANTIDADE).length === 0}
              >
                {submitting ? "A guardar…" : "Guardar"}
              </button>
              <Link href={`/encomendas/${id}`} className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
