"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
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
  type ClassificacaoRisco,
} from "@/app/lib/produtos";
import { postCreate } from "@/app/lib/produtosApi";
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

export default function NovoProdutoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<{ type: "error"; text: string } | null>(null);
  const token = getToken();

  const createMutation = useMutation({
    mutationFn: (body: Parameters<typeof postCreate>[1]) => postCreate(token!, body),
    onSuccess: () => {
      useToastStore.getState().show("Produto criado com sucesso.", "success");
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      router.push("/produtos/gerir?criado=1");
    },
    onError: (err) => {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Falha ao criar produto." });
    },
  });

  const [form, setForm] = useState({
    nome: "",
    nemPorUnidade: "" as string | number,
    familiaRisco: "1.3" as ClassificacaoRisco | string,
    grupoCompatibilidade: "",
    filtroTecnico: "",
    calibre: "",
    categoria: "",
    distanciaSegurancaPublico_m: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createMutation.isPending) return;
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
    if (!token) {
      setMessage({ type: "error", text: "Inicie sessão para criar produtos." });
      return;
    }
    createMutation.mutate({
      nome: form.nome.trim(),
      nemPorUnidade: nem,
      familiaRisco: form.familiaRisco as string,
      grupoCompatibilidade: form.grupoCompatibilidade.trim(),
      filtroTecnico: form.filtroTecnico.trim(),
      calibre: form.calibre.trim(),
      categoria: form.categoria.trim(),
      distanciaSegurancaPublico_m: parseInt(String(form.distanciaSegurancaPublico_m), 10),
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
          >
            <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Criar produto
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Nome, NEM, classificação de risco, categoria pirotécnica, grupo de compatibilidade, filtro técnico e calibre.
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
                    placeholder="Nome do produto"
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
                    placeholder="Ex.: 5"
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
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    F1–F4 ou FP — usado na declaração PSP.
                  </p>
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
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    G é o mais comum para artigos de eventos.
                  </p>
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
              <button type="submit" className={btnPrimary} disabled={createMutation.isPending}>
                {createMutation.isPending ? "A guardar…" : "Guardar produto"}
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
