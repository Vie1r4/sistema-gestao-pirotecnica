"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import {
  CLASSIFICACOES_RISCO,
  CATEGORIAS_PIROTECNICAS,
  GRUPOS_COMPATIBILIDADE,
  FILTROS_TECNICOS,
  CALIBRES,
  textoClassificacao,
  validarNemPorUnidade,
  validarCamposCatalogoProduto,
} from "@/app/lib/produtos";
import { fetchEdit, putEdit, mapApiToProduto } from "@/app/lib/produtosApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

import {
  cardClass,
  inputClass,
  labelClass,
  btnPrimaryLg as btnPrimary,
  btnSecondaryLg as btnSecondary,
} from "@/app/components/ui/tokens";

type PutEditPayload = {
  nome: string;
  nemPorUnidade: number;
  familiaRisco: string;
  unidade?: string;
  grupoCompatibilidade: string;
  filtroTecnico: string;
  calibre: string;
  categoria: string;
  distanciaSegurancaPublico_m: number;
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
    categoria: "",
    distanciaSegurancaPublico_m: "",
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
      categoria: produto.categoria ?? "",
      distanciaSegurancaPublico_m:
        produto.distanciaSegurancaPublico_m != null ? String(produto.distanciaSegurancaPublico_m) : "",
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
    const erroCatalogo = validarCamposCatalogoProduto(form);
    if (erroCatalogo) {
      setMessage({ type: "error", text: erroCatalogo });
      return;
    }
    submittingRef.current = true;
    mutation.mutate({
      nome: form.nome.trim(),
      nemPorUnidade: nem,
      familiaRisco: form.familiaRisco,
      unidade: form.referencia.trim() || undefined,
      grupoCompatibilidade: form.grupoCompatibilidade.trim(),
      filtroTecnico: form.filtroTecnico.trim(),
      calibre: form.calibre.trim(),
      categoria: form.categoria.trim(),
      distanciaSegurancaPublico_m: parseInt(String(form.distanciaSegurancaPublico_m), 10),
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
        <main  className="p-8 pt-content-offset">
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
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-2xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Editar produto
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Altere os dados do produto, incluindo a referência interna.
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
                  <label htmlFor="distanciaSegurancaPublico_m" className={labelClass}>
                    Distância de segurança ao público (m) *
                  </label>
                  <input
                    id="distanciaSegurancaPublico_m"
                    type="number"
                    min="1"
                    max="100000"
                    step="1"
                    required
                    value={form.distanciaSegurancaPublico_m}
                    onChange={(e) => setForm((f) => ({ ...f, distanciaSegurancaPublico_m: e.target.value }))}
                    className={inputClass}
                    placeholder="Ex.: 100"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Usada para calcular automaticamente a área de segurança nas zonas de serviço.
                  </p>
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
                  <label htmlFor="categoria" className={labelClass}>Categoria pirotécnica *</label>
                  <select
                    id="categoria"
                    required
                    value={form.categoria}
                    onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">— Selecionar —</option>
                    {CATEGORIAS_PIROTECNICAS.map((c) => (
                      <option key={c.value} value={c.value}>{c.text}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    F1–F4, T1–T2, P1–P2 ou FP — usado na declaração PSP.
                  </p>
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
                  <label htmlFor="grupoCompatibilidade" className={labelClass}>Grupo de compatibilidade *</label>
                  <select
                    id="grupoCompatibilidade"
                    required
                    value={form.grupoCompatibilidade}
                    onChange={(e) => setForm((f) => ({ ...f, grupoCompatibilidade: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">— Selecionar —</option>
                    {GRUPOS_COMPATIBILIDADE.map((g) => (
                      <option key={g.value} value={g.value}>{g.text}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="filtroTecnico" className={labelClass}>Filtro técnico *</label>
                    <select
                      id="filtroTecnico"
                      required
                      value={form.filtroTecnico}
                      onChange={(e) => setForm((f) => ({ ...f, filtroTecnico: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">— Selecionar —</option>
                      {FILTROS_TECNICOS.map((f) => (
                        <option key={f.value} value={f.value}>{f.text}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="calibre" className={labelClass}>Calibre *</label>
                    <select
                      id="calibre"
                      required
                      value={form.calibre}
                      onChange={(e) => setForm((f) => ({ ...f, calibre: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">— Selecionar —</option>
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
