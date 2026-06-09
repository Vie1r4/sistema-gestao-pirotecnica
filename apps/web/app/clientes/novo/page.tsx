"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "../../components/Navbar";
import {
  createClienteApi,
  TIPOS_CLIENTE,
  type TipoCliente,
  type ClienteDocumentoExtra,
  validarNif,
} from "../../lib/clientes";
import { getToken } from "../../lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import { fadeInUp, transitionSmooth } from "../../lib/animations";

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

export default function NovoClientePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
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
  const [extras, setExtras] = useState<ClienteDocumentoExtra[]>([]);
  const [extraFiles, setExtraFiles] = useState<(File | null)[]>([]);
  const token = getToken();
  const submittingRef = useRef(false);
  const [submitLocked, setSubmitLocked] = useState(false);

  const releaseSubmitLock = () => {
    submittingRef.current = false;
    setSubmitLocked(false);
  };

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => createClienteApi(token!, fd),
    onSuccess: (result) => {
      useToastStore.getState().show("Cliente criado com sucesso.", "success");
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      router.push(`/clientes/${result.id}?criado=1`);
    },
    onError: (err) => {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao criar cliente." });
    },
    onSettled: (_data, error) => {
      if (error) releaseSubmitLock();
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const addDocExtra = () => {
    setExtras((e) => [...e, { id: `ex-${Date.now()}`, nome: "" }]);
    setExtraFiles((f) => [...f, null]);
  };

  const removeDocExtra = (idx: number) => {
    setExtras((e) => e.filter((_, i) => i !== idx));
    setExtraFiles((f) => f.filter((_, i) => i !== idx));
  };

  const setExtraNome = (id: string, nome: string) => {
    setExtras((e) =>
      e.map((x) => (x.id === id ? { ...x, nome: nome.slice(0, 100) } : x))
    );
  };

  const setExtraFile = (idx: number, file: File | null) => {
    setExtraFiles((f) => {
      const next = [...f];
      next[idx] = file;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || submitLocked || createMutation.isPending) return;

    submittingRef.current = true;
    setSubmitLocked(true);
    setMessage(null);

    if (!form.nome.trim()) {
      setMessage({ type: "error", text: "O nome é obrigatório." });
      releaseSubmitLock();
      return;
    }
    if (form.nome.length > 200) {
      setMessage({ type: "error", text: "O nome não pode exceder 200 caracteres." });
      releaseSubmitLock();
      return;
    }
    if (form.nif && !validarNif(form.nif)) {
      setMessage({ type: "error", text: "O NIF deve ter exatamente 9 dígitos." });
      releaseSubmitLock();
      return;
    }
    if (!token) {
      releaseSubmitLock();
      router.replace("/login");
      return;
    }
    const fd = new FormData();
    fd.append("Cliente.Nome", form.nome.trim());
    fd.append("Cliente.TipoCliente", form.tipoCliente);
    fd.append("Cliente.NIF", form.nif.trim());
    fd.append("Cliente.Email", form.email.trim());
    fd.append("Cliente.Telefone", form.telefone.trim());
    fd.append("Cliente.Morada", form.morada.trim());
    fd.append("Cliente.Notas", form.notas.trim());
    extras.forEach((ex, i) => {
      const file = extraFiles[i];
      if (file) {
        fd.append(`DocumentosExtras[${i}].Nome`, (ex.nome || "Documento").trim().slice(0, 100));
        fd.append(`DocumentosExtras[${i}].Ficheiro`, file);
      }
    });
    createMutation.mutate(fd);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
          >
            <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Novo cliente
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Preencha os dados de identificação e contacto. O nome é obrigatório.
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
                  <label htmlFor="nome" className={labelClass}>
                    Nome / Designação social *
                  </label>
                  <input
                    id="nome"
                    type="text"
                    required
                    maxLength={200}
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                    className={inputClass}
                    placeholder="Nome ou designação social (até 200 caracteres)"
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
                      placeholder="123456789"
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
                      placeholder="email@exemplo.pt"
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
                      placeholder="+351 912 345 678"
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
                    placeholder="Morada"
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
                    placeholder="Notas internas"
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
                Documentos extras com nome à escolha. Pode adicionar várias linhas.
              </p>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={addDocExtra}
                  data-button
                  className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-[border-color,background-color,color] duration-200 hover:border-[#f97316] hover:bg-[#f97316]/5 hover:text-[#f97316] dark:border-[#444] dark:text-gray-400 dark:hover:border-[#f97316] dark:hover:text-[#f97316]"
                >
                  <span className="text-lg leading-none">+</span>
                  Adicionar documento (nome à escolha)
                </button>
                {extras.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-3 dark:border-[#222]"
                  >
                    <div className="min-w-[200px] flex-1">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Nome (máx. 100 caracteres)
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={ex.nome}
                        onChange={(e) => setExtraNome(ex.id, e.target.value)}
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
                        onChange={(e) => setExtraFile(idx, e.target.files?.[0] ?? null)}
                        aria-label="Ficheiro"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocExtra(idx)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>

            {message && (
              <p
                className={`text-sm ${
                  message.type === "error" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                }`}
              >
                {message.text}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitLocked || createMutation.isPending}
                className={btnPrimary}
                aria-busy={submitLocked || createMutation.isPending}
              >
                {submitLocked || createMutation.isPending ? "A guardar…" : "Guardar cliente"}
              </button>
              <Link href="/clientes" className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
