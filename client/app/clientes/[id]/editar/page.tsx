"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import {
  fetchClienteEdit,
  updateClienteApi,
  TIPOS_CLIENTE,
  type TipoCliente,
  type ClienteDocumentoExtra,
  type Cliente,
  validarNif,
} from "@/app/lib/clientes";
import { getToken } from "@/app/lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

const FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png";

export default function EditarClientePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    nome: "",
    tipoCliente: "Particular" as TipoCliente,
    nif: "",
    email: "",
    telefone: "",
    morada: "",
    notas: "",
  });
  const [removerDocIds, setRemoverDocIds] = useState<Set<string>>(new Set());
  const [novosExtras, setNovosExtras] = useState<ClienteDocumentoExtra[]>([]);
  const [novosExtrasFiles, setNovosExtrasFiles] = useState<(File | null)[]>([]);
  const submittingRef = useRef(false);

  const {
    data: editData,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["clientes", id, "edit"],
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        throw new Error("Sessão expirada.");
      }
      return fetchClienteEdit(token, id);
    },
    staleTime: 30 * 1000,
    retry: 2,
    enabled: !!id && !!getToken(),
  });

  const cliente = editData?.item ?? null;

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome,
        tipoCliente: cliente.tipoCliente,
        nif: cliente.nif ?? "",
        email: cliente.email ?? "",
        telefone: cliente.telefone ?? "",
        morada: cliente.morada ?? "",
        notas: cliente.notas ?? "",
      });
    }
  }, [cliente]);

  const mutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      await updateClienteApi(token, id, fd);
    },
    onSuccess: () => {
      useToastStore.getState().show("Alterações guardadas.", "success");
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      queryClient.invalidateQueries({ queryKey: ["clientes", id] });
      router.push(`/clientes/${id}?editado=1`);
    },
    onError: (err: Error) => {
      setMessage({ type: "error", text: err.message || "Erro ao guardar." });
    },
    onSettled: () => {
      submittingRef.current = false;
    },
  });

  const submitting = mutation.isPending;

  const addNovoDoc = () => {
    setNovosExtras((e) => [...e, { id: `ex-${Date.now()}`, nome: "" }]);
    setNovosExtrasFiles((f) => [...f, null]);
  };

  const removeNovoDoc = (idx: number) => {
    setNovosExtras((e) => e.filter((_, i) => i !== idx));
    setNovosExtrasFiles((f) => f.filter((_, i) => i !== idx));
  };

  const setNovoDocNome = (docId: string, nome: string) => {
    setNovosExtras((e) =>
      e.map((x) => (x.id === docId ? { ...x, nome: nome.slice(0, 100) } : x))
    );
  };

  const setNovoDocFile = (idx: number, file: File | null) => {
    setNovosExtrasFiles((f) => {
      const next = [...f];
      next[idx] = file;
      return next;
    });
  };

  const toggleRemoverDoc = (docId: string) => {
    setRemoverDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!cliente) return;
    setMessage(null);
    if (!form.nome.trim()) {
      setMessage({ type: "error", text: "O nome é obrigatório." });
      return;
    }
    if (form.nome.length > 200) {
      setMessage({ type: "error", text: "O nome não pode exceder 200 caracteres." });
      return;
    }
    if (form.nif && !validarNif(form.nif)) {
      setMessage({ type: "error", text: "O NIF deve ter exatamente 9 dígitos." });
      return;
    }
    const fd = new FormData();
    fd.append("Cliente.Id", id);
    fd.append("Cliente.Nome", form.nome.trim());
    fd.append("Cliente.TipoCliente", form.tipoCliente);
    if (form.nif.trim()) fd.append("Cliente.NIF", form.nif.trim());
    if (form.email.trim()) fd.append("Cliente.Email", form.email.trim());
    if (form.telefone.trim()) fd.append("Cliente.Telefone", form.telefone.trim());
    if (form.morada.trim()) fd.append("Cliente.Morada", form.morada.trim());
    if (form.notas.trim()) fd.append("Cliente.Notas", form.notas.trim());
    const removerIds = Array.from(removerDocIds).filter((docId) => /^\d+$/.test(docId));
    removerIds.forEach((docId, i) => fd.append(`RemoverDocumentoExtraIds[${i}]`, docId));
    novosExtras.forEach((ex, i) => {
      const file = novosExtrasFiles[i];
      if (file) {
        fd.append(`DocumentosExtras[${i}].Nome`, (ex.nome || "Documento").trim().slice(0, 100));
        fd.append(`DocumentosExtras[${i}].Ficheiro`, file);
      }
    });
    submittingRef.current = true;
    mutation.mutate(fd);
  };

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
          {queryError && (
            <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {queryError instanceof Error ? queryError.message : "Erro ao carregar."}
            </p>
          )}
          {!queryError && <p className="text-gray-600 dark:text-gray-400">Cliente não encontrado.</p>}
          <Link href="/clientes" data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">
            ← Voltar
          </Link>
        </main>
      </div>
    );
  }

  const docsExistentes = cliente.documentosExtras ?? [];

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        <div className="mx-auto max-w-3xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Editar cliente
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Altere os dados de identificação e contacto. Pode remover ou adicionar documentos.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.05 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Identificação e contacto
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="nome" className={labelClass}>Nome / Designação social *</label>
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="tipo" className={labelClass}>Tipo</label>
                    <select
                      id="tipo"
                      value={form.tipoCliente}
                      onChange={(e) => setForm((f) => ({ ...f, tipoCliente: e.target.value as TipoCliente }))}
                      className={inputClass}
                    >
                      {TIPOS_CLIENTE.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="nif" className={labelClass}>NIF (9 dígitos)</label>
                    <input
                      id="nif"
                      type="text"
                      maxLength={9}
                      value={form.nif}
                      onChange={(e) => setForm((f) => ({ ...f, nif: e.target.value.replace(/\D/g, "") }))}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className={labelClass}>Email</label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="telefone" className={labelClass}>Telefone</label>
                    <input
                      id="telefone"
                      type="tel"
                      value={form.telefone}
                      onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="morada" className={labelClass}>Morada</label>
                  <input
                    id="morada"
                    type="text"
                    value={form.morada}
                    onChange={(e) => setForm((f) => ({ ...f, morada: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="notas" className={labelClass}>Observações / Notas</label>
                  <textarea
                    id="notas"
                    rows={3}
                    value={form.notas}
                    onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.1 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Documentação
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Documentos já existentes: marque Remover para apagar. Adicione novos documentos abaixo.
              </p>
              {docsExistentes.length > 0 && (
                <div className="mt-4 space-y-2">
                  {docsExistentes.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-[#222]"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {doc.nome || "Documento"}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => alert("Em modo demonstração os ficheiros não estão disponíveis.")}
                          className="text-sm text-[#f97316] hover:underline"
                        >
                          Ver
                        </button>
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <input
                            type="checkbox"
                            checked={removerDocIds.has(doc.id)}
                            onChange={() => toggleRemoverDoc(doc.id)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          Remover
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={addNovoDoc}
                  data-button
                  className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-[border-color,background-color,color] duration-200 hover:border-[#f97316] hover:bg-[#f97316]/5 hover:text-[#f97316] dark:border-[#444] dark:text-gray-400 dark:hover:border-[#f97316] dark:hover:text-[#f97316]"
                >
                  <span className="text-lg leading-none">+</span>
                  Adicionar documento (nome à escolha)
                </button>
                {novosExtras.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-3 dark:border-[#222]"
                  >
                    <div className="min-w-[200px] flex-1">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Nome (máx. 100 caracteres)
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={ex.nome}
                        onChange={(e) => setNovoDocNome(ex.id, e.target.value)}
                        className={inputClass}
                        placeholder="Nome do documento"
                      />
                    </div>
                    <div className="min-w-[140px] flex-1">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Ficheiro
                      </label>
                      <input
                        type="file"
                        accept={FILE_ACCEPT}
                        className={inputClass}
                        onChange={(e) => setNovoDocFile(idx, e.target.files?.[0] ?? null)}
                        aria-label="Ficheiro"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNovoDoc(idx)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>

            {message && (
              <p className={`text-sm ${message.type === "error" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                {message.text}
              </p>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className={btnPrimary}>
                {submitting ? "A guardar…" : "Guardar alterações"}
              </button>
              <Link href={`/clientes/${id}`} className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
