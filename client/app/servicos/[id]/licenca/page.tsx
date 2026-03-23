"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import {
  servicosApi,
  ConstantesServicoLicenca,
  TIPOS_LICENCA_SERVICO,
  type TipoLicencaServico,
} from "@/app/lib/servicos";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const TIPO_TO_NUM: Record<TipoLicencaServico, number> = {
  LICENCA_PSP: 0,
  LER: 1,
  PARECER_BOMBEIROS: 2,
  SEGURO_RC: 3,
  PARECER_CAMARA: 4,
  LICENCA_RECINTOS: 5,
  AUTORIZACAO_IP: 6,
  OUTRO: 7,
};

const inputClass =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";
const btnSecondary = "rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-[#333] dark:text-gray-300";

function LicencaContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const tipoParam = searchParams.get("tipo") ?? "";
  const licencaIdParam = searchParams.get("licencaId") ?? undefined;

  const tipo = (TIPOS_LICENCA_SERVICO.includes(tipoParam as TipoLicencaServico) ? tipoParam : TIPOS_LICENCA_SERVICO[0]) as TipoLicencaServico;
  const tipoNum = TIPO_TO_NUM[tipo];

  const [mounted, setMounted] = useState(false);
  const [servicoId, setServicoId] = useState<string | null>(null);
  const [licencaExistenteId, setLicencaExistenteId] = useState<string | number | null>(null);
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [nomePersonalizado, setNomePersonalizado] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [ficheiroNome, setFicheiroNome] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [erro, setErro] = useState<string | null>(null);
  const [loadingApi, setLoadingApi] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    const token = getToken();
    if (!token) {
      setServicoId(null);
      setLoadingApi(false);
      return;
    }
    setLoadingApi(true);
    const licId = licencaIdParam ? parseInt(licencaIdParam, 10) : undefined;
    servicosApi
      .fetchUploadLicenca(token, id, tipoNum, licId ?? null)
      .then((res) => {
        setServicoId(String(res.servicoId));
        const lic = res.licenca as Record<string, unknown>;
        if (lic?.id != null) setLicencaExistenteId(lic.id as number);
        setNumeroDocumento(String(lic?.numeroDocumento ?? lic?.NumeroDocumento ?? ""));
        setDataEmissao(lic?.dataEmissao ?? lic?.DataEmissao ? String(lic.dataEmissao ?? lic.DataEmissao).slice(0, 10) : "");
        setDataValidade(lic?.dataValidade ?? lic?.DataValidade ? String(lic.dataValidade ?? lic.DataValidade).slice(0, 10) : "");
        setNomePersonalizado(String(lic?.nomePersonalizado ?? lic?.NomePersonalizado ?? ""));
        setObservacoes(String(lic?.observacoes ?? lic?.Observacoes ?? ""));
      })
      .catch(() => setServicoId(null))
      .finally(() => setLoadingApi(false));
  }, [mounted, id, tipoNum, licencaIdParam, tipo]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setErro(null);
    if (!servicoId) {
      setErro("Serviço não encontrado.");
      return;
    }
    const token = getToken();
    if (!token) {
      setErro("Sessão inválida. Faça login.");
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
        const fd = new FormData();
        fd.append("Licenca.NumeroDocumento", numeroDocumento.trim());
        fd.append("Licenca.DataEmissao", dataEmissao || "");
        fd.append("Licenca.DataValidade", dataValidade || "");
        fd.append("Licenca.NomePersonalizado", tipo === "OUTRO" ? nomePersonalizado.trim() : "");
        fd.append("Licenca.Observacoes", observacoes.trim());
        const fileInput = (e.currentTarget as HTMLFormElement).querySelector<HTMLInputElement>('input[type="file"]');
        if (fileInput?.files?.[0]) fd.append("Ficheiro", fileInput.files[0]);
        await servicosApi.postUploadLicenca(
          token,
          id,
          tipoNum,
          fd,
          licencaExistenteId != null ? (typeof licencaExistenteId === "number" ? licencaExistenteId : parseInt(String(licencaExistenteId), 10)) : null
        );
        router.push(`/servicos/${servicoId}`);
      } catch (err) {
        setErro((err as Error).message || "Não foi possível guardar a licença.");
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
  };

  if (!mounted || (loadingApi && getToken())) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (!servicoId) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main className="px-6 pt-14 pb-10" style={{ paddingTop: CONTENT_OFFSET_TOP }}>
          <div className="mx-auto max-w-md rounded-xl border border-[#e7e5e4] bg-white p-6 dark:border-[#1f1f1f] dark:bg-[#111]">
            <p className="text-[#57534e] dark:text-gray-400">Serviço não encontrado.</p>
            <Link href="/servicos" className="mt-4 inline-block text-[#f97316] hover:underline">
              ← Voltar à lista
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const titulo = licencaExistenteId != null ? "Editar licença" : "Upload licença";
  const nomeTipo = ConstantesServicoLicenca.Nome(tipo);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main className="px-6 pt-14 pb-10 sm:px-8" style={{ paddingTop: CONTENT_OFFSET_TOP }}>
        <div className="mx-auto max-w-lg">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {titulo} — {nomeTipo}
            </h1>
            <p className="mt-1 text-sm text-[#57534e] dark:text-gray-400">
              Serviço #{servicoId}
            </p>
          </motion.div>

          <motion.form
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]"
          >
            {erro && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
                {erro}
              </div>
            )}

            <div className="space-y-4">
              {tipo === "OUTRO" && (
                <div>
                  <label htmlFor="nomePersonalizado" className={labelClass}>
                    Nome personalizado
                  </label>
                  <input
                    id="nomePersonalizado"
                    type="text"
                    value={nomePersonalizado}
                    onChange={(e) => setNomePersonalizado(e.target.value)}
                    className={inputClass + " w-full"}
                  />
                </div>
              )}

              <div>
                <label htmlFor="numeroDocumento" className={labelClass}>
                  N.º documento
                </label>
                <input
                  id="numeroDocumento"
                  type="text"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  className={inputClass + " w-full"}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="dataEmissao" className={labelClass}>
                    Data emissão
                  </label>
                  <input
                    id="dataEmissao"
                    type="date"
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                    className={inputClass + " w-full"}
                  />
                </div>
                <div>
                  <label htmlFor="dataValidade" className={labelClass}>
                    Data validade
                  </label>
                  <input
                    id="dataValidade"
                    type="date"
                    value={dataValidade}
                    onChange={(e) => setDataValidade(e.target.value)}
                    className={inputClass + " w-full"}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="observacoes" className={labelClass}>
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className={inputClass + " w-full"}
                />
              </div>

              <div>
                <label htmlFor="ficheiro" className={labelClass}>
                  Ficheiro (PDF, JPG, PNG)
                </label>
                <input
                  id="ficheiro"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={inputClass + " w-full"}
                />
                <p className="mt-1 text-xs text-[#57534e] dark:text-gray-400">
                  Opcional. Pode enviar apenas os dados e anexar o ficheiro depois.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="submit" disabled={submitting} className={btnPrimary}>
                {submitting ? "A guardar…" : "Guardar"}
              </button>
              <Link href={`/servicos/${servicoId}`} className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </motion.form>
        </div>
      </main>
    </div>
  );
}

export default function ServicoLicencaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <LicencaContent />
    </Suspense>
  );
}
