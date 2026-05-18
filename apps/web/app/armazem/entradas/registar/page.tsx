"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { textoClassificacao, CLASSIFICACOES_RISCO, GRUPOS_COMPATIBILIDADE, FILTROS_TECNICOS, CALIBRES } from "@/app/lib/produtos";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import {
  fetchEntradaRegistarForm,
  postRegistarEntrada,
  type PaiolOption,
  type ProdutoOption,
} from "@/app/lib/entradaPaiolApi";

const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

function RegistarEntradaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const canGerirArmazem = (user?.permissions ?? []).includes("armazem.gerir");
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const loadingRef = useRef(false);
  const paiolIdParam = searchParams.get("paiolId") ?? "";
  const [form, setForm] = useState({
    paiolId: paiolIdParam,
    produtoId: "",
    quantidade: "" as string | number,
    numeroLote: "",
    dataFabrico: "",
    dataValidade: "",
  });
  const [filtros, setFiltros] = useState({
    classificacao: searchParams.get("classificacao") ?? "",
    grupoCompatibilidade: searchParams.get("grupoCompatibilidade") ?? "",
    filtroTecnico: searchParams.get("filtroTecnico") ?? "",
    calibre: searchParams.get("calibre") ?? "",
  });

  useEffect(() => {
    setForm((f) => ({ ...f, paiolId: paiolIdParam }));
    setMounted(true);
  }, [paiolIdParam]);

  const authToken = getToken();

  const { data: formData, isLoading: loadingForm } = useQuery({
    queryKey: [
      "armazem",
      "entrada-registar",
      form.paiolId,
      filtros.classificacao,
      filtros.grupoCompatibilidade,
      filtros.filtroTecnico,
      filtros.calibre,
    ],
    queryFn: async () => {
      const t = getToken();
      if (!t) {
        router.replace("/login");
        throw new Error("no-token");
      }
      return fetchEntradaRegistarForm(t, {
        paiolId: form.paiolId,
        classificacao: filtros.classificacao,
        grupoCompatibilidade: filtros.grupoCompatibilidade,
        filtroTecnico: filtros.filtroTecnico,
        calibre: filtros.calibre,
      });
    },
    enabled: mounted && !!authToken,
    staleTime: 20 * 1000,
  });

  const paiois: PaiolOption[] = formData?.paiois ?? [];
  const produtos: ProdutoOption[] = formData?.produtos ?? [];

  const paioisAtivos = paiois.filter((p) => (p.estado ?? "Ativo") === "Ativo");
  let produtosFiltrados = produtos;
  if (filtros.classificacao) produtosFiltrados = produtosFiltrados.filter((p) => p.familiaRisco === filtros.classificacao);
  if (filtros.grupoCompatibilidade) produtosFiltrados = produtosFiltrados.filter((p) => p.grupoCompatibilidade === filtros.grupoCompatibilidade);
  if (filtros.filtroTecnico) produtosFiltrados = produtosFiltrados.filter((p) => p.filtroTecnico === filtros.filtroTecnico);
  if (filtros.calibre) produtosFiltrados = produtosFiltrados.filter((p) => p.calibre === filtros.calibre);

  const registarMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        throw new Error("Sessão expirada.");
      }
      const qty = Number(form.quantidade);
      const body = {
        PaiolId: Number(form.paiolId),
        ProdutoId: Number(form.produtoId),
        Quantidade: qty,
        NumeroLote: form.numeroLote.trim() || null,
        DataFabrico: form.dataFabrico ? new Date(form.dataFabrico).toISOString().slice(0, 10) : null,
        DataValidade: form.dataValidade ? new Date(form.dataValidade).toISOString().slice(0, 10) : null,
      };
      try {
        return await postRegistarEntrada(token, body);
      } catch (e) {
        if (e instanceof Error && e.message === "UNAUTHORIZED") {
          router.replace("/login");
          throw new Error("Sessão expirada.");
        }
        throw e;
      }
    },
    onSuccess: (data) => {
      const sucesso = data.entradaSucesso;
      setMessage({ type: "success", text: sucesso ?? "Entrada registada." });
      queryClient.invalidateQueries({ queryKey: ["armazem"] });
      setTimeout(() => router.push(canGerirArmazem ? "/armazem/movimentos?tipo=Entradas" : "/armazem"), 1500);
    },
    onError: (err: Error) => {
      setMessage({ type: "error", text: err.message || "Erro de rede. Tente novamente." });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingRef.current || registarMutation.isPending) return;
    loadingRef.current = true;
    setMessage(null);
    if (!form.paiolId) {
      setMessage({ type: "error", text: "Selecione um paiol." });
      loadingRef.current = false;
      return;
    }
    if (!form.produtoId) {
      setMessage({ type: "error", text: "Selecione um produto." });
      loadingRef.current = false;
      return;
    }
    const qty = Number(form.quantidade);
    if (!Number.isFinite(qty) || qty <= 0) {
      setMessage({ type: "error", text: "A quantidade deve ser um número positivo." });
      loadingRef.current = false;
      return;
    }
    try {
      await registarMutation.mutateAsync();
    } catch {
      /* onError já define mensagem */
    } finally {
      loadingRef.current = false;
    }
  };

  const loading = registarMutation.isPending;

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
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
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
          >
            <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Registar entrada
            </h1>
          </motion.div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className={`mt-8 ${cardClass}`}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtrar produtos
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Opcional: use os filtros e recarregue para restringir a lista de produtos.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Classificação de risco</label>
                <select
                  value={filtros.classificacao}
                  onChange={(e) => setFiltros((f) => ({ ...f, classificacao: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Todas</option>
                  {CLASSIFICACOES_RISCO.map((c) => (
                    <option key={c} value={c}>{textoClassificacao(c)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Grupo compatibilidade</label>
                <select
                  value={filtros.grupoCompatibilidade}
                  onChange={(e) => setFiltros((f) => ({ ...f, grupoCompatibilidade: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Todos</option>
                  {GRUPOS_COMPATIBILIDADE.map((g) => (
                    <option key={g.value} value={g.value}>{g.text}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Filtro técnico</label>
                <select
                  value={filtros.filtroTecnico}
                  onChange={(e) => setFiltros((f) => ({ ...f, filtroTecnico: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Todos</option>
                  {FILTROS_TECNICOS.map((f) => (
                    <option key={f.value} value={f.value}>{f.text}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Calibre</label>
                <select
                  value={filtros.calibre}
                  onChange={(e) => setFiltros((f) => ({ ...f, calibre: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Todos</option>
                  {CALIBRES.map((c) => (
                    <option key={c.value} value={c.value}>{c.text}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.section>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.08 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dados da entrada
              </h2>
              {loadingForm ? (
                <div className="mt-4 flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
                  <span>A carregar paióis e produtos…</span>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="paiolId" className={labelClass}>Paiol *</label>
                    <select
                      id="paiolId"
                      required
                      value={form.paiolId}
                      onChange={(e) => setForm((f) => ({ ...f, paiolId: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">— Seleccionar —</option>
                      {paioisAtivos.map((p) => (
                        <option key={p.id} value={String(p.id)}>{p.nome}{p.perfilRisco ? ` (${p.perfilRisco})` : ""}</option>
                      ))}
                    </select>
                    {paioisAtivos.length === 0 && !loadingForm && (
                      <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                        Nenhum paiol ativo com acesso. Os administradores podem gerir paióis em Gestão de Paióis.
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="produtoId" className={labelClass}>Produto *</label>
                    <select
                      id="produtoId"
                      required
                      value={form.produtoId}
                      onChange={(e) => setForm((f) => ({ ...f, produtoId: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">— Seleccionar —</option>
                      {produtosFiltrados.map((p) => (
                        <option key={p.id} value={String(p.id)}>{p.nome} ({textoClassificacao(p.familiaRisco ?? "")}, NEM {p.nemPorUnidade} kg/un)</option>
                      ))}
                    </select>
                    {produtos.length === 0 && !loadingForm && (
                      <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                        Nenhum produto no catálogo. Adicione produtos em{" "}
                        <Link href="/produtos/gerir" className="underline hover:no-underline">Gerir produtos</Link>.
                      </p>
                    )}
                    {produtos.length > 0 && produtosFiltrados.length === 0 && !loadingForm && (
                      <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                        Nenhum produto corresponde aos filtros. Altere os filtros acima e recarregue.
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="quantidade" className={labelClass}>Quantidade *</label>
                    <input
                      id="quantidade"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={form.quantidade}
                      onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))}
                      className={inputClass}
                      placeholder="Ex.: 10"
                    />
                  </div>
                  <div>
                    <label htmlFor="numeroLote" className={labelClass}>N.º de lote</label>
                    <input
                      id="numeroLote"
                      type="text"
                      value={form.numeroLote}
                      onChange={(e) => setForm((f) => ({ ...f, numeroLote: e.target.value }))}
                      className={inputClass}
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="dataFabrico" className={labelClass}>Data de fabrico</label>
                      <input
                        id="dataFabrico"
                        type="date"
                        value={form.dataFabrico}
                        onChange={(e) => setForm((f) => ({ ...f, dataFabrico: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="dataValidade" className={labelClass}>Data de validade</label>
                      <input
                        id="dataValidade"
                        type="date"
                        value={form.dataValidade}
                        onChange={(e) => setForm((f) => ({ ...f, dataValidade: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.section>

            {message && (
              <p className={`text-sm ${message.type === "error" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                {message.text}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" className={btnPrimary} disabled={loading || loadingForm}>
                {loading ? "A registar…" : "Registar entrada"}
              </button>
              {canGerirArmazem && (
                <Link href="/armazem/movimentos" className={btnSecondary}>
                  Movimentos
                </Link>
              )}
              <Link href="/armazem" className={btnSecondary}>
                Armazém
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function RegistarEntradaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <RegistarEntradaContent />
    </Suspense>
  );
}
