"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import {
  servicosApi,
  ConstantesServicoLicenca,
  TIPOS_LICENCA_SERVICO,
  fetchServicoDetalheFromApi,
  type TipoLicencaServico,
  type ServicoDetalhe,
} from "@/app/lib/servicos";
import {
  resumoDadosParaAutofillLicenca,
  buildObservacoesAutofillLicenca,
  dataEmissaoSugeridaHoje,
} from "@/app/lib/servicosLicencaAutofill";
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
  const queryClient = useQueryClient();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const tipoParam = searchParams.get("tipo") ?? "";
  const licencaIdParam = searchParams.get("licencaId") ?? undefined;
  const origemParam = searchParams.get("origem");

  const tipo = (TIPOS_LICENCA_SERVICO.includes(tipoParam as TipoLicencaServico) ? tipoParam : TIPOS_LICENCA_SERVICO[0]) as TipoLicencaServico;
  const tipoNum = TIPO_TO_NUM[tipo];
  /** 0 = papelada/pedido; 1 = registo definitivo autorizado (omissão na URL = 1). */
  const origemNum: 0 | 1 = origemParam === "0" ? 0 : 1;

  const [mounted, setMounted] = useState(false);
  const [servicoId, setServicoId] = useState<string | null>(null);
  const [licencaExistenteId, setLicencaExistenteId] = useState<string | number | null>(null);
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [nomePersonalizado, setNomePersonalizado] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [assistenteAberto, setAssistenteAberto] = useState(true);
  const token = getToken();
  const licIdParsed = licencaIdParam ? parseInt(licencaIdParam, 10) : undefined;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const uploadQuery = useQuery({
    queryKey: ["servicos", "upload-licenca", id, tipoNum, licencaIdParam ?? "new", origemNum],
    queryFn: async () => {
      const t = getToken();
      if (!t) throw new Error("no-token");
      return servicosApi.fetchUploadLicenca(t, id, tipoNum, licIdParsed ?? null, licIdParsed != null ? undefined : origemNum);
    },
    enabled: mounted && !!token && !!id,
    retry: false,
  });

  const loadingApi = uploadQuery.isLoading;

  useEffect(() => {
    if (uploadQuery.isError) {
      setServicoId(null);
      return;
    }
    const res = uploadQuery.data;
    if (!res) return;
    setServicoId(String(res.servicoId));
    const lic = res.licenca as Record<string, unknown>;
    if (lic?.id != null) setLicencaExistenteId(lic.id as number);
    else setLicencaExistenteId(null);
    setNumeroDocumento(String(lic?.numeroDocumento ?? lic?.NumeroDocumento ?? ""));
    setDataEmissao(lic?.dataEmissao ?? lic?.DataEmissao ? String(lic.dataEmissao ?? lic.DataEmissao).slice(0, 10) : "");
    setDataValidade(lic?.dataValidade ?? lic?.DataValidade ? String(lic.dataValidade ?? lic.DataValidade).slice(0, 10) : "");
    setNomePersonalizado(String(lic?.nomePersonalizado ?? lic?.NomePersonalizado ?? ""));
    setObservacoes(String(lic?.observacoes ?? lic?.Observacoes ?? ""));
  }, [uploadQuery.data, uploadQuery.isError]);

  const detalheQuery = useQuery({
    queryKey: ["servicos", "detalhe", id],
    queryFn: async () => {
      const t = getToken();
      if (!t) throw new Error("no-token");
      return fetchServicoDetalheFromApi(t, id);
    },
    enabled: mounted && !!token && !!id && origemNum === 0,
    retry: false,
  });

  const servicoDetalhe: ServicoDetalhe | null = detalheQuery.data ?? null;
  const loadingDetalhe = detalheQuery.isLoading && origemNum === 0;

  const uploadMutation = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const t = getToken();
      if (!t) throw new Error("Sessão inválida. Faça login.");
      const fd = new FormData();
      fd.append("Licenca.NumeroDocumento", numeroDocumento.trim());
      fd.append("Licenca.DataEmissao", dataEmissao || "");
      fd.append("Licenca.DataValidade", dataValidade || "");
      fd.append("Licenca.NomePersonalizado", tipo === "OUTRO" ? nomePersonalizado.trim() : "");
      fd.append("Licenca.Observacoes", observacoes.trim());
      const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
      if (fileInput?.files?.[0]) fd.append("Ficheiro", fileInput.files[0]);
      await servicosApi.postUploadLicenca(
        t,
        id,
        tipoNum,
        fd,
        licencaExistenteId != null ? (typeof licencaExistenteId === "number" ? licencaExistenteId : parseInt(String(licencaExistenteId), 10)) : null,
        origemNum
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      router.push(`/servicos/${id}`);
    },
    onError: (err: Error) => {
      setErro(err.message || "Não foi possível guardar a licença.");
    },
  });

  const aplicarAutofillObservacoes = (modo: "substituir" | "acrescentar") => {
    if (!servicoDetalhe) return;
    const texto = buildObservacoesAutofillLicenca(servicoDetalhe, tipo);
    if (modo === "acrescentar" && observacoes.trim()) {
      setObservacoes(`${observacoes.trim()}\n\n---\n\n${texto}`);
    } else {
      setObservacoes(texto);
    }
  };

  const aplicarDataEmissaoHoje = () => {
    setDataEmissao(dataEmissaoSugeridaHoje());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (uploadMutation.isPending) return;
    setErro(null);
    if (!servicoId) {
      setErro("Serviço não encontrado.");
      return;
    }
    const t = getToken();
    if (!t) {
      setErro("Sessão inválida. Faça login.");
      return;
    }
    await uploadMutation.mutateAsync(e.currentTarget);
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

  const titulo = licencaExistenteId != null ? "Editar licença" : "Registar licença";
  const nomeTipo = ConstantesServicoLicenca.Nome(tipo);
  const subtituloOrigem =
    origemNum === 0
      ? "Papelada gerada / pedido interno (antes da autorização)"
      : "Registo definitivo autorizado pelas entidades reguladoras";

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main className="px-6 pt-14 pb-10 sm:px-8" style={{ paddingTop: CONTENT_OFFSET_TOP }}>
        <div className="mx-auto max-w-lg">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {titulo} — {nomeTipo}
            </h1>
            <p className="mt-1 text-sm font-medium text-[#57534e] dark:text-gray-300">{subtituloOrigem}</p>
            <p className="mt-1 text-sm text-[#57534e] dark:text-gray-400">
              Serviço #{servicoId}
            </p>
          </motion.div>

          {origemNum === 1 && (
            <p className="mt-4 rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-4 py-3 text-sm text-[#44403c] dark:border-[#333] dark:bg-[#141414] dark:text-gray-300">
              Use este formulário para o documento <strong className="font-medium text-[#1c1917] dark:text-white">oficial</strong> emitido pela entidade (n.º,
              validade, PDF). A papelada gerada internamente regista-se em <strong className="font-medium">Papelada gerada</strong> no detalhe do serviço.
            </p>
          )}

          {origemNum === 0 && servicoDetalhe && !loadingDetalhe && (
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.03 }}
              className="mt-6 overflow-hidden rounded-2xl border border-[#fed7aa] bg-gradient-to-br from-[#fffbeb] to-white dark:border-[#78350f]/40 dark:from-[#1c1410] dark:to-[#111]"
            >
              <button
                type="button"
                onClick={() => setAssistenteAberto((o) => !o)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
              >
                <div>
                  <h2 className="text-base font-semibold text-[#9a3412] dark:text-[#fdba74]">
                    Assistente de preenchimento
                  </h2>
                  <p className="mt-0.5 text-sm text-[#57534e] dark:text-gray-400">
                    Usa os dados já guardados no serviço para gerar o texto das observações (e opcionalmente a data de emissão).
                  </p>
                </div>
                <span className="shrink-0 text-lg text-[#9a3412] dark:text-[#fdba74]" aria-hidden>
                  {assistenteAberto ? "▾" : "▸"}
                </span>
              </button>
              {assistenteAberto && (
                <div className="space-y-4 border-t border-[#fde68a]/80 px-5 pb-5 pt-2 dark:border-[#78350f]/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#78716c] dark:text-gray-500">
                    Incluído no texto sugerido
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {resumoDadosParaAutofillLicenca(servicoDetalhe).map((item) => (
                      <li
                        key={item.id}
                        className="rounded-xl border border-[#e7e5e4] bg-white/90 px-3 py-2 text-sm dark:border-[#333] dark:bg-[#0d0d0d]/80"
                      >
                        <span className="block text-xs text-[#78716c] dark:text-gray-500">{item.label}</span>
                        <span className="mt-0.5 line-clamp-3 text-[#1c1917] dark:text-gray-100">{item.valor}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => aplicarAutofillObservacoes("substituir")}
                      className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
                    >
                      Aplicar texto às observações
                    </button>
                    <button
                      type="button"
                      onClick={() => aplicarAutofillObservacoes("acrescentar")}
                      disabled={!observacoes.trim()}
                      className="rounded-xl border border-[#e7e5e4] bg-white px-4 py-2 text-sm font-medium text-[#44403c] hover:bg-[#fafaf9] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-gray-300 dark:hover:bg-[#222]"
                    >
                      Acrescentar ao fim
                    </button>
                    <button
                      type="button"
                      onClick={aplicarDataEmissaoHoje}
                      className="rounded-xl border border-dashed border-[#d6d3d1] px-4 py-2 text-sm font-medium text-[#57534e] hover:border-[#f97316] hover:text-[#c2410c] dark:border-[#444] dark:text-gray-400"
                    >
                      Data emissão = hoje
                    </button>
                  </div>
                  <p className="text-xs text-[#78716c] dark:text-gray-500">
                    O número do documento e o ficheiro PDF/imagem continuam a ser preenchidos por si ou pela entidade emitente.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {origemNum === 0 && loadingDetalhe && getToken() && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#e7e5e4] bg-white px-4 py-3 text-sm text-[#57534e] dark:border-[#333] dark:bg-[#111] dark:text-gray-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
              A carregar dados do serviço para o assistente…
            </div>
          )}

          {origemNum === 0 && !loadingDetalhe && getToken() && !servicoDetalhe && servicoId && (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
              Não foi possível carregar o detalhe completo do serviço. Pode preencher o formulário manualmente; tente recarregar a página para o assistente.
            </p>
          )}

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
                  rows={8}
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
                  {origemNum === 0
                    ? "Opcional. Pode enviar apenas os dados e anexar o ficheiro depois."
                    : "Recomendado anexar o PDF ou imagem do documento oficial emitido pela entidade."}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="submit" disabled={uploadMutation.isPending} className={btnPrimary}>
                {uploadMutation.isPending ? "A guardar…" : "Guardar"}
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
