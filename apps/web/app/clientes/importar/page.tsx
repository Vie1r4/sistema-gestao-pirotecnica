"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import { importClientesCsvApi } from "../../lib/clientes";
import { getToken } from "../../lib/auth";
import { useUser } from "@/app/context/UserContext";
import { useToastStore } from "@/app/stores/useToastStore";
import { fadeInUp, transitionSmooth } from "../../lib/animations";
import {
  cardClass,
  labelClass,
  btnPrimaryLg as btnPrimary,
  btnSecondaryLg as btnSecondary,
  inputClass,
} from "@/app/components/ui/tokens";
import {
  downloadClienteCsvTemplate,
  parseClientesCsvText,
  type ClienteCsvPreviewRow,
  type ClienteImportResult,
  type ModoDuplicadoNif,
} from "@/app/lib/clienteCsvImport";

const PREVIEW_MAX = 10;

function estadoBadgeClass(estado: string): string {
  switch (estado) {
    case "importado":
      return "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200";
    case "atualizado":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200";
    case "ignorado":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200";
    default:
      return "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200";
  }
}

export default function ImportarClientesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const canGerir = (user?.permissions ?? []).includes("clientes.gerir");
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ClienteCsvPreviewRow[]>([]);
  const [previewErro, setPreviewErro] = useState<string | null>(null);
  const [modoDuplicado, setModoDuplicado] = useState<ModoDuplicadoNif>("ignorar");
  const [resultado, setResultado] = useState<ClienteImportResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      if (!file) throw new Error("Selecione um ficheiro CSV ou TXT.");
      return importClientesCsvApi(token, file, modoDuplicado);
    },
    onSuccess: (data) => {
      setResultado(data);
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      useToastStore.getState().show(
        `Importação concluída: ${data.importados} criados, ${data.atualizados} atualizados.`,
        data.erros > 0 ? "info" : "success"
      );
    },
    onError: (err: Error) => setMessage(err.message),
  });

  const handleFileChange = async (f: File | null) => {
    setFile(f);
    setResultado(null);
    setMessage(null);
    if (!f) {
      setPreview([]);
      setPreviewErro(null);
      return;
    }
    const text = await f.text();
    const parsed = parseClientesCsvText(text);
    setPreview(parsed.rows);
    setPreviewErro(parsed.erro ?? null);
  };

  if (!canGerir) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main className="p-8 pt-content-offset">
          <p className="text-gray-600 dark:text-gray-400">Sem permissão para importar clientes.</p>
          <Link href="/clientes" className="mt-5 inline-block text-[#f97316] hover:underline">← Voltar</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset">
        <div className="content-container mx-auto max-w-4xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight sm:text-3xl">Importar clientes (CSV / TXT)</h1>
            <p className="mt-1 text-[#57534e] dark:text-gray-400">
              Migre fichas de clientes a partir de um ficheiro CSV ou TXT (até 50 MB). Documentos não são importados por ficheiro.
            </p>
          </motion.div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className={`mt-10 ${cardClass}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Ficheiro CSV ou TXT</h2>
              <button type="button" onClick={downloadClienteCsvTemplate} className={btnSecondary}>
                Descarregar modelo
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Aceita o modelo simples (<code className="text-xs">nome, nif, morada…</code>) ou exportações ERP
              com colunas como <code className="text-xs">NOME</code>, <code className="text-xs">NOME COMERCIAL</code>,{" "}
              <code className="text-xs">CÓD. POSTAL</code>, <code className="text-xs">TELEFONES</code>,{" "}
              <code className="text-xs">INACTIVO?</code>. O cabeçalho é detectado automaticamente.
              Clientes inactivos são ignorados. Separador vírgula ou ponto e vírgula.
            </p>

            <div className="mt-4">
              <label htmlFor="csv-ficheiro" className={labelClass}>Ficheiro .csv ou .txt</label>
              <input
                ref={fileRef}
                id="csv-ficheiro"
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                className={`${inputClass} mt-1`}
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="modo-duplicado" className={labelClass}>NIF duplicado</label>
              <select
                id="modo-duplicado"
                value={modoDuplicado}
                onChange={(e) => setModoDuplicado(e.target.value as ModoDuplicadoNif)}
                className={`${inputClass} mt-1 max-w-md`}
              >
                <option value="ignorar">Ignorar linha (não importar)</option>
                <option value="atualizar">Atualizar cliente existente</option>
                <option value="criar">Criar novo (permitir NIF duplicado)</option>
              </select>
            </div>

            {previewErro && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
                {previewErro}
              </p>
            )}

            {preview.length > 0 && !previewErro && (
              <div className="mt-6 overflow-x-auto">
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pré-visualização ({Math.min(preview.length, PREVIEW_MAX)} de {preview.length} linhas)
                </p>
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#333]">
                      <th className="px-2 py-2 font-medium">#</th>
                      <th className="px-2 py-2 font-medium">Nome</th>
                      <th className="px-2 py-2 font-medium">Tipo</th>
                      <th className="px-2 py-2 font-medium">NIF</th>
                      <th className="px-2 py-2 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, PREVIEW_MAX).map((row) => (
                      <tr key={row.numeroLinha} className="border-b border-gray-100 dark:border-[#222]">
                        <td className="px-2 py-2 text-gray-500">{row.numeroLinha}</td>
                        <td className="px-2 py-2">{row.nome || "—"}</td>
                        <td className="px-2 py-2">{row.tipoCliente || "Particular"}</td>
                        <td className="px-2 py-2">{row.nif || "—"}</td>
                        <td className="px-2 py-2">{row.email || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {message && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{message}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!file || !!previewErro || preview.length === 0 || mutation.isPending}
                onClick={() => mutation.mutate()}
                className={btnPrimary}
              >
                {mutation.isPending ? "A importar…" : "Importar clientes"}
              </button>
              <Link href="/clientes" className={btnSecondary}>Cancelar</Link>
            </div>
          </motion.section>

          {resultado && (
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.08 }}
              className={`mt-8 ${cardClass}`}
            >
              <h2 className="text-lg font-semibold">Resultado</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div><dt className="text-xs text-gray-500">Total</dt><dd className="text-lg font-semibold">{resultado.totalLinhas}</dd></div>
                <div><dt className="text-xs text-gray-500">Importados</dt><dd className="text-lg font-semibold text-green-600">{resultado.importados}</dd></div>
                <div><dt className="text-xs text-gray-500">Atualizados</dt><dd className="text-lg font-semibold text-blue-600">{resultado.atualizados}</dd></div>
                <div><dt className="text-xs text-gray-500">Ignorados</dt><dd className="text-lg font-semibold text-amber-600">{resultado.ignorados}</dd></div>
                <div><dt className="text-xs text-gray-500">Erros</dt><dd className="text-lg font-semibold text-red-600">{resultado.erros}</dd></div>
              </dl>

              {resultado.linhas.some((l) => l.estado === "erro" || l.estado === "ignorado") && (
                <div className="mt-6 max-h-64 overflow-y-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-[#333]">
                        <th className="px-2 py-2">Linha</th>
                        <th className="px-2 py-2">Estado</th>
                        <th className="px-2 py-2">Nome</th>
                        <th className="px-2 py-2">Detalhe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.linhas
                        .filter((l) => l.estado !== "importado" && l.estado !== "atualizado")
                        .map((l) => (
                          <tr key={l.numeroLinha} className="border-b border-gray-100 dark:border-[#222]">
                            <td className="px-2 py-2">{l.numeroLinha}</td>
                            <td className="px-2 py-2">
                              <span className={`rounded-full px-2 py-0.5 text-xs ${estadoBadgeClass(l.estado)}`}>
                                {l.estado}
                              </span>
                            </td>
                            <td className="px-2 py-2">{l.nome ?? "—"}</td>
                            <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{l.mensagem ?? "—"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                type="button"
                className={`${btnPrimary} mt-6`}
                onClick={() => router.push("/clientes?importado=1")}
              >
                Ver lista de clientes
              </button>
            </motion.section>
          )}
        </div>
      </main>
    </div>
  );
}
