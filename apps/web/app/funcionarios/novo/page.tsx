"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import { getToken } from "../../lib/auth";
import { CARGOS, type CargoFuncionario, type DocumentosFuncionario } from "../../lib/funcionarios";
import { fetchCreate, postCreate } from "../../lib/funcionariosApi";
import { useUser } from "@/app/context/UserContext";
import { useToastStore } from "@/app/stores/useToastStore";
import { fadeInUp, transitionSmooth } from "../../lib/animations";
import { PASSWORD_HINT, PASSWORD_PLACEHOLDER, validatePasswordClient } from "../../lib/passwordPolicy";
import {
  cardClass,
  inputClass,
  labelClass,
  btnPrimaryLg as btnPrimary,
  btnSecondaryLg as btnSecondary,
} from "@/app/components/ui/tokens";
import LicencaOperadorPanel from "../_components/LicencaOperadorPanel";
import CartaoCidadaoPanel from "../_components/CartaoCidadaoPanel";
import {
  appendLicencaOperadorFormData,
  estadoLicencaAtualForm,
  LICENCA_OPERADOR_VAZIA,
  temFicheiroLicencaOperador,
  validarLicencaOperadorForm,
  type LicencaOperadorFormState,
} from "@/app/lib/licencaOperadorForm";
import {
  appendCartaoCidadaoFormData,
  CARTAO_CIDADAO_VAZIO,
  estadoCartaoCidadaoAtualForm,
  temFicheiroCartaoCidadao,
  validarCartaoCidadaoForm,
  type CartaoCidadaoFormState,
} from "@/app/lib/cartaoCidadaoForm";

/** Normaliza item de dropdown da API (string ou { value, text }) para string */
function toOptionValue(c: unknown): string {
  return typeof c === "string" ? c : String((c as { value?: string; Value?: string })?.value ?? (c as { value?: string; Value?: string })?.Value ?? "");
}

export default function NovoFuncionarioPage() {
  const router = useRouter();
  const { user } = useUser();
  const canGerirFuncionarios = (user?.permissions ?? []).includes("funcionarios.gerir");
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    nomeCompleto: "",
    email: "",
    telefone: "",
    nss: "",
    iban: "",
    cargo: "Gestor" as CargoFuncionario,
    notas: "",
    criarConta: false,
    contaPassword: "",
    contaConfirmar: "",
    contaPerfil: "Gestor" as CargoFuncionario, // UI-only; backend força = cargo
  });
  const [docs, setDocs] = useState<DocumentosFuncionario>({ extras: [] });
  const [cartao, setCartao] = useState<CartaoCidadaoFormState>(CARTAO_CIDADAO_VAZIO);
  const [licenca, setLicenca] = useState<LicencaOperadorFormState>(LICENCA_OPERADOR_VAZIA);
  const [ccPreviewFile, setCcPreviewFile] = useState<File | null>(null);
  const [licPreviewFile, setLicPreviewFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const token = getToken();
  const refCartaoCidadao = useRef<HTMLInputElement>(null);
  const refDocumentoADDR = useRef<HTMLInputElement>(null);
  const refLicencaOperador = useRef<HTMLInputElement>(null);
  const refExtrasFiles = useRef<(HTMLInputElement | null)[]>([]);
  const submittingRef = useRef(false);
  const [submitLocked, setSubmitLocked] = useState(false);

  const releaseSubmitLock = () => {
    submittingRef.current = false;
    setSubmitLocked(false);
  };

  const { data: createOptionsData } = useQuery({
    queryKey: ["funcionarios", "create"],
    queryFn: () => fetchCreate(token!),
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
  });

  const createOptions = createOptionsData
    ? {
        cargos: Array.isArray(createOptionsData.cargos) ? createOptionsData.cargos.map(toOptionValue).filter(Boolean) : [],
        rolesConta: Array.isArray(createOptionsData.rolesConta) ? createOptionsData.rolesConta.map(toOptionValue).filter(Boolean) : [],
      }
    : null;

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => postCreate(token!, fd),
    onSuccess: (result) => {
      useToastStore.getState().show("Funcionário criado com sucesso.", "success");
      queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
      const id = (result.funcionario?.id ?? result.funcionario?.Id) ?? "";
      setMessage({
        type: "success",
        text: form.criarConta
          ? "Funcionário criado com conta de acesso. Foi enviado um email com as credenciais e o link para confirmar o email."
          : "Funcionário criado com sucesso.",
      });
      setTimeout(() => router.push(`/funcionarios/${id}`), 1200);
    },
    onError: (err) => {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Falha ao criar funcionário.",
      });
    },
    onSettled: (_data, error) => {
      if (error) releaseSubmitLock();
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || submitLocked || createMutation.isPending) return;

    submittingRef.current = true;
    setSubmitLocked(true);
    setMessage(null);

    if (!form.nomeCompleto.trim()) {
      setMessage({ type: "error", text: "O nome completo é obrigatório." });
      releaseSubmitLock();
      return;
    }
    if (form.criarConta) {
      if (!form.email.trim()) {
        setMessage({ type: "error", text: "Preencha o email do funcionário para criar a conta de acesso." });
        releaseSubmitLock();
        return;
      }
      const passwordError = validatePasswordClient(form.contaPassword);
      if (passwordError) {
        setMessage({ type: "error", text: passwordError });
        releaseSubmitLock();
        return;
      }
      if (form.contaPassword !== form.contaConfirmar) {
        setMessage({ type: "error", text: "A palavra-passe e a confirmação não coincidem." });
        releaseSubmitLock();
        return;
      }
    }
    if (!token) {
      setMessage({ type: "error", text: "Inicie sessão para criar funcionários." });
      releaseSubmitLock();
      return;
    }

    const ccFile = ccPreviewFile ?? refCartaoCidadao.current?.files?.[0] ?? null;
    const temFicheiroCc = temFicheiroCartaoCidadao({
      mode: "create",
      ccFile,
    });
    const erroCartao = validarCartaoCidadaoForm({
      ativa: cartao.ativa,
      nif: cartao.nif,
      morada: cartao.morada,
      dataValidade: cartao.dataValidade,
      temFicheiro: temFicheiroCc,
    });
    if (erroCartao) {
      setMessage({ type: "error", text: erroCartao });
      releaseSubmitLock();
      return;
    }

    const licFile = licPreviewFile ?? refLicencaOperador.current?.files?.[0] ?? null;
    const temFicheiroLic = temFicheiroLicencaOperador({
      mode: "create",
      licFile,
    });
    const erroLicenca = validarLicencaOperadorForm({
      ativa: licenca.ativa,
      numeroCredencial: licenca.numeroCredencial,
      dataValidade: licenca.dataValidade,
      temFicheiro: temFicheiroLic,
    });
    if (erroLicenca) {
      setMessage({ type: "error", text: erroLicenca });
      releaseSubmitLock();
      return;
    }

    const formData = new FormData();
    formData.append("Funcionario.NomeCompleto", form.nomeCompleto.trim());
    appendCartaoCidadaoFormData(formData, cartao, ccFile);
    appendLicencaOperadorFormData(formData, licenca, licFile);
    formData.append("Funcionario.Email", form.email.trim() || "");
    formData.append("Funcionario.Telefone", form.telefone.trim() || "");
    formData.append("Funcionario.NumeroSegurancaSocial", form.nss.trim() || "");
    formData.append("Funcionario.IBAN", form.iban.trim() || "");
    formData.append("Funcionario.Cargo", form.cargo);
    formData.append("Funcionario.Notas", form.notas.trim() || "");
    formData.append("CriarConta", form.criarConta ? "true" : "false");
    if (form.criarConta) {
      formData.append("ContaEmail", form.email.trim());
      formData.append("ContaPassword", form.contaPassword);
      formData.append("ContaConfirmPassword", form.contaConfirmar);
      // Backend força a role da conta = cargo do funcionário (fonte única de verdade)
      formData.append("ContaRole", form.cargo);
    }
    const addrFile = refDocumentoADDR.current?.files?.[0];
    if (addrFile) formData.append("DocumentoADDRFicheiro", addrFile);
    docs.extras.forEach((ex, i) => {
      formData.append(`DocumentosExtras[${i}].Nome`, ex.nome.trim() || `Documento ${i + 1}`);
      const f = refExtrasFiles.current[i]?.files?.[0];
      if (f) formData.append(`DocumentosExtras[${i}].Ficheiro`, f);
    });
    createMutation.mutate(formData);
  };

  const addDocExtraRow = () => {
    setDocs((d) => ({
      ...d,
      extras: [...d.extras, { id: `ex-${Date.now()}`, nome: "" }],
    }));
  };

  const removeDocExtra = (id: string) => {
    setDocs((d) => ({ ...d, extras: d.extras.filter((e) => e.id !== id) }));
  };

  const setExtraNome = (id: string, nome: string) => {
    setDocs((d) => ({
      ...d,
      extras: d.extras.map((e) => (e.id === id ? { ...e, nome: nome.slice(0, 100) } : e)),
    }));
  };

  const mostraBlocoFicheiros = !!docs.adr || docs.extras.length > 0;

  const handleCartaoToggle = (checked: boolean) => {
    if (checked) {
      setCartao((c) => ({ ...c, ativa: true }));
      setDocs((d) => ({ ...d, cartaoCidadao: "cc" }));
      return;
    }
    setCartao(CARTAO_CIDADAO_VAZIO);
    setDocs((d) => ({ ...d, cartaoCidadao: undefined }));
    setCcPreviewFile(null);
    if (refCartaoCidadao.current) refCartaoCidadao.current.value = "";
  };

  const handleLicencaToggle = (checked: boolean) => {
    if (checked) {
      setLicenca((l) => ({ ...l, ativa: true }));
      setDocs((d) => ({ ...d, licencaOperador: "licenca" }));
      return;
    }
    setLicenca(LICENCA_OPERADOR_VAZIA);
    setDocs((d) => ({ ...d, licencaOperador: undefined }));
    setLicPreviewFile(null);
    if (refLicencaOperador.current) refLicencaOperador.current.value = "";
  };

  const temFicheiroCcAtual = temFicheiroCartaoCidadao({
    mode: "create",
    ccFile: ccPreviewFile,
  });
  const estadoCartao = cartao.ativa
    ? estadoCartaoCidadaoAtualForm(cartao, temFicheiroCcAtual)
    : undefined;

  const temFicheiroLicencaAtual = temFicheiroLicencaOperador({
    mode: "create",
    licFile: licPreviewFile,
  });
  const estadoLicenca = licenca.ativa
    ? estadoLicencaAtualForm(licenca, temFicheiroLicencaAtual)
    : undefined;

  const FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png";

  if (!mounted) return null;
  if (!canGerirFuncionarios) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          <p className="text-gray-600 dark:text-gray-400">Apenas utilizadores com permissão para gerir funcionários podem criar.</p>
          <Link href="/funcionarios" data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">← Voltar à lista</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
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
              Novo funcionário
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Preencha os dados da ficha. O nome completo é obrigatório.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.05 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dados pessoais</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="nome" className={labelClass}>Nome completo *</label>
                  <input
                    id="nome"
                    type="text"
                    required
                    value={form.nomeCompleto}
                    onChange={(e) => setForm((f) => ({ ...f, nomeCompleto: e.target.value }))}
                    className={inputClass}
                    placeholder="Nome completo"
                  />
                </div>
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
                <div>
                  <label htmlFor="nss" className={labelClass}>N.º Segurança Social</label>
                  <input
                    id="nss"
                    type="text"
                    value={form.nss}
                    onChange={(e) => setForm((f) => ({ ...f, nss: e.target.value }))}
                    className={inputClass}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label htmlFor="iban" className={labelClass}>IBAN</label>
                  <input
                    id="iban"
                    type="text"
                    value={form.iban}
                    onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))}
                    className={inputClass}
                    placeholder="PT50 0000 0000 0000 0000 00000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="cargo" className={labelClass}>Cargo</label>
                  <select
                    id="cargo"
                    value={form.cargo}
                    onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value as CargoFuncionario }))}
                    className={inputClass}
                  >
                    {(createOptions?.cargos?.length ? createOptions.cargos : CARGOS).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notas" className={labelClass}>Notas</label>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documentos</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Marque os tipos de documento que pretende enviar. Pode adicionar linhas com nome à escolha.</p>
              <div className="mt-4 flex flex-col gap-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={cartao.ativa}
                    onChange={(e) => handleCartaoToggle(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cartão de Cidadão</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!docs.adr}
                    onChange={(e) => setDocs((d) => ({ ...d, adr: e.target.checked ? "adr" : undefined }))}
                    className="h-4 w-4 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ADR</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={licenca.ativa}
                    onChange={(e) => handleLicencaToggle(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Credencial</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={addDocExtraRow}
                    data-button
                    className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-[border-color,background-color,color] duration-200 hover:border-[#f97316] hover:bg-[#f97316]/5 hover:text-[#f97316] dark:border-[#444] dark:text-gray-400 dark:hover:border-[#f97316] dark:hover:text-[#f97316]"
                  >
                    <span className="text-lg leading-none">+</span>
                    Adicionar documento (nome à escolha)
                  </button>
                </div>
              </div>

              {cartao.ativa && (
                <CartaoCidadaoPanel
                  mode="create"
                  nif={cartao.nif}
                  onNifChange={(value) => setCartao((c) => ({ ...c, nif: value }))}
                  morada={cartao.morada}
                  onMoradaChange={(value) => setCartao((c) => ({ ...c, morada: value }))}
                  dataValidade={cartao.dataValidade}
                  onDataValidadeChange={(value) => setCartao((c) => ({ ...c, dataValidade: value }))}
                  fileInputRef={refCartaoCidadao}
                  onCcFileChange={setCcPreviewFile}
                  estado={estadoCartao}
                  fileInputId="novo-cartao-cidadao-ficheiro"
                />
              )}

              {licenca.ativa && (
                <LicencaOperadorPanel
                  mode="create"
                  numeroCredencial={licenca.numeroCredencial}
                  onNumeroCredencialChange={(value) =>
                    setLicenca((l) => ({ ...l, numeroCredencial: value }))
                  }
                  dataValidade={licenca.dataValidade}
                  onDataValidadeChange={(value) =>
                    setLicenca((l) => ({ ...l, dataValidade: value }))
                  }
                  fileInputRef={refLicencaOperador}
                  onLicFileChange={setLicPreviewFile}
                  estado={estadoLicenca}
                  fileInputId="novo-licenca-operador-ficheiro"
                />
              )}

              {mostraBlocoFicheiros && (
                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-[#222] dark:bg-[#0a0a0a]/50">
                  <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Campos de ficheiro</p>
                  <div className="flex flex-col gap-4">
                    {!!docs.adr && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">ADR</label>
                        <input ref={refDocumentoADDR} type="file" name="DocumentoADDRFicheiro" accept={FILE_ACCEPT} className={`${inputClass} mt-1`} />
                      </div>
                    )}
                    {docs.extras.map((ex, i) => (
                      <div key={ex.id} className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-3 dark:border-[#222]">
                        <div className="min-w-[200px] flex-1">
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome (máx. 100 caracteres)</label>
                          <input
                            type="text"
                            name={`DocumentosExtras[${i}].Nome`}
                            maxLength={100}
                            value={ex.nome}
                            onChange={(e) => setExtraNome(ex.id, e.target.value)}
                            className={inputClass}
                            placeholder="Nome do documento"
                          />
                        </div>
                        <div className="min-w-[200px] flex-1">
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Ficheiro</label>
                          <input
                            ref={(el) => { refExtrasFiles.current[i] = el; }}
                            type="file"
                            name={`DocumentosExtras[${i}].Ficheiro`}
                            accept={FILE_ACCEPT}
                            className={`${inputClass} mt-1`}
                          />
                        </div>
                        <button type="button" onClick={() => removeDocExtra(ex.id)} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.section>

            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.15 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conta de acesso ao sistema</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Associar um funcionário a uma conta significa criar uma nova conta neste momento e guardar a sua ligação à ficha. Apenas utilizadores com permissão para gerir funcionários podem criar contas.</p>
              <label className="mt-4 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.criarConta}
                  onChange={(e) => setForm((f) => ({ ...f, criarConta: e.target.checked }))}
                  className="rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Criar conta de acesso para este funcionário</span>
              </label>
              {form.criarConta && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">O email de login é o mesmo do funcionário (único no sistema). O sistema valida a unicidade, cria o utilizador com o perfil do cargo e envia as credenciais e o link de confirmação por email.</p>
                  <div>
                    <label htmlFor="contaEmail" className={labelClass}>Email (para login, único no sistema) *</label>
                    <input
                      id="contaEmail"
                      type="email"
                      value={form.email}
                      readOnly
                      className={inputClass}
                      placeholder="Preencha o email do funcionário acima"
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      O email da conta é automaticamente igual ao email do funcionário.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contaPassword" className={labelClass}>Palavra-passe</label>
                      <input
                        id="contaPassword"
                        type="password"
                        value={form.contaPassword}
                        onChange={(e) => setForm((f) => ({ ...f, contaPassword: e.target.value }))}
                        className={inputClass}
                        placeholder={PASSWORD_PLACEHOLDER}
                      />
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{PASSWORD_HINT}</p>
                    </div>
                    <div>
                      <label htmlFor="contaConfirmar" className={labelClass}>Confirmar palavra-passe</label>
                      <input
                        id="contaConfirmar"
                        type="password"
                        value={form.contaConfirmar}
                        onChange={(e) => setForm((f) => ({ ...f, contaConfirmar: e.target.value }))}
                        className={inputClass}
                        placeholder="Repita a palavra-passe"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contaPerfil" className={labelClass}>Perfil de acesso (role)</label>
                    <input
                      id="contaPerfil"
                      value={form.cargo}
                      readOnly
                      className={inputClass}
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      O perfil é automaticamente igual ao cargo do funcionário.
                    </p>
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
              <button
                type="submit"
                className={btnPrimary}
                disabled={submitLocked || createMutation.isPending}
                aria-busy={submitLocked || createMutation.isPending}
              >
                {submitLocked || createMutation.isPending ? "A guardar…" : "Guardar funcionário"}
              </button>
              <Link href="/funcionarios" className={btnSecondary}>Cancelar</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
