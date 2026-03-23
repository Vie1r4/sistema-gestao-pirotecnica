"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import {
  CLASSIFICACOES_RISCO,
  GRUPOS_COMPATIBILIDADE,
  FILTROS_TECNICOS,
  CALIBRES,
  textoClassificacao,
  validarNemPorUnidade,
  type Produto,
} from "@/app/lib/produtos";
import { fetchEdit, putEdit, mapApiToProduto } from "@/app/lib/produtosApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

type PutEditPayload = {
  nome: string;
  nemPorUnidade: number;
  familiaRisco: string;
  unidade?: string;
  grupoCompatibilidade?: string;
  filtroTecnico?: string;
  calibre?: string;
};

export default function EditarProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const numId = parseInt(String(id), 10);
  const validId = !Number.isNaN(numId);
  const [message, setMessage] = useState<{ type: "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    nome: "",
    nemPorUnidade: "" as string | number,
    familiaRisco: "" as string,
    referencia: "",
    grupoCompatibilidade: "",
    filtroTecnico: "",
    calibre: "",
  });

  const {
    data: editData,
    isLoading: loadingApi,
    error: queryError,
  } = useQuery({
    queryKey: ["produtos", id, "edit"],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      return fetchEdit(token, numId);
    },
    staleTime: 30 * 1000,
    retry: 2,
    enabled: validId && !!getToken(),
  });

  const produto = useMemo(() => {
    if (!editData?.produto) return null;
    return mapApiToProduto(editData.produto as Record<string, unknown>);
  }, [editData?.produto]);

  const lastLoadedProdutoIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!produto) return;
    // Evita loop: mapApiToProduto pode criar novo objeto a cada render; sincronizamos o form só quando o ID muda.
    if (lastLoadedProdutoIdRef.current === produto.id) return;
    lastLoadedProdutoIdRef.current = produto.id;
    setForm({
      nome: produto.nome,
      nemPorUnidade: produto.nemPorUnidade,
      familiaRisco: produto.familiaRisco,
      referencia: produto.referencia ?? "",
      grupoCompatibilidade: produto.grupoCompatibilidade ?? "",
      filtroTecnico: produto.filtroTecnico ?? "",
      calibre: produto.calibre ?? "",
    });
  }, [produto]);

  const submittingRef = useRef(false);
  const mutation = useMutation({
    mutationFn: async (payload: PutEditPayload) => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      await putEdit(token, numId, payload);
    },
    onSuccess: () => {
      useToastStore.getState().show("Produto atualizado com sucesso.", "success");
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      queryClient.invalidateQueries({ queryKey: ["produtos", id] });
      router.push("/produtos/gerir");
    },
    onError: (err: Error) => {
      setMessage({ type: "error", text: err.message || "Falha ao guardar." });
    },
    onSettled: () => {
      submittingRef.current = false;
    },
  });

  const submitting = mutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!produto) return;
    setMessage(null);
    if (!form.nome.trim()) {
      setMessage({ type: "error", text: "O nome do produto é obrigatório." });
      return;
    }
    if (form.nome.length > 200) {
      setMessage({ type: "error", text: "O nome não pode exceder 200 caracteres." });
      return;
    }
    const nem = Number(form.nemPorUnidade);
    if (!validarNemPorUnidade(nem)) {
      setMessage({ type: "error", text: "O NEM por unidade deve ser um valor positivo (mínimo 0,0001)." });
      return;
    }
    submittingRef.current = true;
    mutation.mutate({
      nome: form.nome.trim(),
      nemPorUnidade: nem,
      familiaRisco: form.familiaRisco,
      unidade: form.referencia.trim() || undefined,
      grupoCompatibilidade: form.grupoCompatibilidade.trim() || undefined,
      filtroTecnico: form.filtroTecnico.trim() || undefined,
      calibre: form.calibre.trim() || undefined,
    });
  };

  if (loadingApi) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }
  if (queryError || !produto) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          {queryError && (
            <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {queryError instanceof Error ? queryError.message : "Erro ao carregar."}
            </p>
          )}
          {!queryError && <p className="text-gray-600 dark:text-gray-400">Produto não encontrado.</p>}
          <Link href="/produtos" className="mt-5 inline-block text-[#f97316] hover:underline">← Voltar</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        <div className="mx-auto max-w-2xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Editar produto
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Altere os dados do produto. A referência define-se ou altera-se apenas aqui.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.05 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dados do produto</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="nome" className={labelClass}>Nome *</label>
                  <input
                    id="nome"
                    type="text"
                    required
                    maxLength={200}
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="nemPorUnidade" className={labelClass}>NEM por unidade (kg) *</label>
                  <input
                    id="nemPorUnidade"
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    required
                    value={form.nemPorUnidade}
                    onChange={(e) => setForm((f) => ({ ...f, nemPorUnidade: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="familiaRisco" className={labelClass}>Classificação de risco *</label>
                  <select
                    id="familiaRisco"
                    required
                    value={form.familiaRisco}
                    onChange={(e) => setForm((f) => ({ ...f, familiaRisco: e.target.value }))}
                    className={inputClass}
                  >
                    {CLASSIFICACOES_RISCO.map((c) => (
                      <option key={c} value={c}>{textoClassificacao(c)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="referencia" className={labelClass}>Referência</label>
                  <input
                    id="referencia"
                    type="text"
                    maxLength={50}
                    value={form.referencia}
                    onChange={(e) => setForm((f) => ({ ...f, referencia: e.target.value }))}
                    className={inputClass}
                    placeholder="Ex.: ref. interna, código"
                  />
                </div>
                <div>
                  <label htmlFor="grupoCompatibilidade" className={labelClass}>Grupo de compatibilidade</label>
                  <select
                    id="grupoCompatibilidade"
                    value={form.grupoCompatibilidade}
                    onChange={(e) => setForm((f) => ({ ...f, grupoCompatibilidade: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">— Opcional —</option>
                    {GRUPOS_COMPATIBILIDADE.map((g) => (
                      <option key={g.value} value={g.value}>{g.text}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="filtroTecnico" className={labelClass}>Filtro técnico</label>
                    <select
                      id="filtroTecnico"
                      value={form.filtroTecnico}
                      onChange={(e) => setForm((f) => ({ ...f, filtroTecnico: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">— Opcional —</option>
                      {FILTROS_TECNICOS.map((f) => (
                        <option key={f.value} value={f.value}>{f.text}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="calibre" className={labelClass}>Calibre</label>
                    <select
                      id="calibre"
                      value={form.calibre}
                      onChange={(e) => setForm((f) => ({ ...f, calibre: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">— Opcional —</option>
                      {CALIBRES.map((c) => (
                        <option key={c.value} value={c.value}>{c.text}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.section>

            {message && (
              <p className="text-sm text-red-600 dark:text-red-400">{message.text}</p>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" className={btnPrimary} disabled={submitting}>
                {submitting ? "A guardar…" : "Guardar"}
              </button>
              <Link href="/produtos/gerir" className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
