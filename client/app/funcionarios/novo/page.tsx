"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "../../components/Navbar";
import { getToken } from "../../lib/auth";
import { CARGOS, type CargoFuncionario, type DocumentosFuncionario } from "../../lib/funcionarios";
import { fetchCreate, postCreate } from "../../lib/funcionariosApi";
import { useUser } from "@/app/context/UserContext";
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
    nif: "",
    email: "",
    telefone: "",
    morada: "",
    nss: "",
    iban: "",
    cargo: "Gestor" as CargoFuncionario,
    notas: "",
    criarConta: false,
    contaEmail: "",
    contaPassword: "",
    contaConfirmar: "",
    contaPerfil: "Gestor" as CargoFuncionario, // UI-only; backend força = cargo
  });
  const [docs, setDocs] = useState<DocumentosFuncionario>({ extras: [] });
  const queryClient = useQueryClient();
  const token = getToken();
  const refCartaoCidadao = useRef<HTMLInputElement>(null);
  const refDocumentoADDR = useRef<HTMLInputElement>(null);
  const refLicencaOperador = useRef<HTMLInputElement>(null);
  const refExtrasFiles = useRef<(HTMLInputElement | null)[]>([]);
  const submittingRef = useRef(false);

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
    onSettled: () => {
      submittingRef.current = false;
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || createMutation.isPending) return;
    setMessage(null);
    if (!form.nomeCompleto.trim()) {
      setMessage({ type: "error", text: "O nome completo é obrigatório." });
      return;
    }
    if (form.nif && !/^\d{9}$/.test(form.nif.replace(/\s/g, ""))) {
      setMessage({ type: "error", text: "O NIF deve ter nove dígitos." });
      return;
    }
    if (form.criarConta) {
      if (!form.contaEmail.trim()) {
        setMessage({ type: "error", text: "O email da conta de acesso é obrigatório." });
        return;
      }
      if (form.contaPassword.length < 6) {
        setMessage({ type: "error", text: "A palavra-passe deve ter pelo menos 6 caracteres." });
        return;
      }
      if (form.contaPassword !== form.contaConfirmar) {
        setMessage({ type: "error", text: "A palavra-passe e a confirmação não coincidem." });
        return;
      }
    }
    if (!token) {
      setMessage({ type: "error", text: "Inicie sessão para criar funcionários." });
      return;
    }
    const formData = new FormData();
    formData.append("Funcionario.NomeCompleto", form.nomeCompleto.trim());
    formData.append("Funcionario.NIF", form.nif.trim() || "");
    formData.append("Funcionario.Email", form.email.trim() || "");
    formData.append("Funcionario.Telefone", form.telefone.trim() || "");
    formData.append("Funcionario.Morada", form.morada.trim() || "");
    formData.append("Funcionario.NumeroSegurancaSocial", form.nss.trim() || "");
    formData.append("Funcionario.IBAN", form.iban.trim() || "");
    formData.append("Funcionario.Cargo", form.cargo);
    formData.append("Funcionario.Notas", form.notas.trim() || "");
    formData.append("CriarConta", form.criarConta ? "true" : "false");
    if (form.criarConta) {
      formData.append("ContaEmail", form.contaEmail.trim());
      formData.append("ContaPassword", form.contaPassword);
      formData.append("ContaConfirmPassword", form.contaConfirmar);
      // Backend força a role da conta = cargo do funcionário (fonte única de verdade)
      formData.append("ContaRole", form.cargo);
    }
    const ccFile = refCartaoCidadao.current?.files?.[0];
    if (ccFile) formData.append("CartaoCidadaoFicheiro", ccFile);
    const addrFile = refDocumentoADDR.current?.files?.[0];
    if (addrFile) formData.append("DocumentoADDRFicheiro", addrFile);
    const licFile = refLicencaOperador.current?.files?.[0];
    if (licFile) formData.append("LicencaOperadorFicheiro", licFile);
    docs.extras.forEach((ex, i) => {
      formData.append(`DocumentosExtras[${i}].Nome`, ex.nome.trim() || `Documento ${i + 1}`);
      const f = refExtrasFiles.current[i]?.files?.[0];
      if (f) formData.append(`DocumentosExtras[${i}].Ficheiro`, f);
    });
    submittingRef.current = true;
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

  const mostraBlocoFicheiros =
    !!docs.cartaoCidadao || !!docs.adr || !!docs.licencaOperador || docs.extras.length > 0;

  const FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png";

  if (!mounted) return null;
  if (!canGerirFuncionarios) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
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
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
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
                <div className="sm:col-span-2">
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
                    checked={!!docs.cartaoCidadao}
                    onChange={(e) => setDocs((d) => ({ ...d, cartaoCidadao: e.target.checked ? "cc" : undefined }))}
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
                    checked={!!docs.licencaOperador}
                    onChange={(e) => setDocs((d) => ({ ...d, licencaOperador: e.target.checked ? "licenca" : undefined }))}
                    className="h-4 w-4 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Licença de Operador</span>
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

              {mostraBlocoFicheiros && (
                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-[#222] dark:bg-[#0a0a0a]/50">
                  <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Campos de ficheiro</p>
                  <div className="flex flex-col gap-4">
                    {!!docs.cartaoCidadao && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Cartão de Cidadão</label>
                        <input ref={refCartaoCidadao} type="file" name="CartaoCidadaoFicheiro" accept={FILE_ACCEPT} className={`${inputClass} mt-1`} />
                      </div>
                    )}
                    {!!docs.adr && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">ADR</label>
                        <input ref={refDocumentoADDR} type="file" name="DocumentoADDRFicheiro" accept={FILE_ACCEPT} className={`${inputClass} mt-1`} />
                      </div>
                    )}
                    {!!docs.licencaOperador && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Licença de Operador</label>
                        <input ref={refLicencaOperador} type="file" name="LicencaOperadorFicheiro" accept={FILE_ACCEPT} className={`${inputClass} mt-1`} />
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">O email serve para login e tem de ser único no sistema (pode ser o do funcionário ou outro). O sistema valida a unicidade, cria o utilizador com o perfil escolhido e envia um email com as credenciais e o link para confirmar o email.</p>
                  <div>
                    <label htmlFor="contaEmail" className={labelClass}>Email (para login, único no sistema) *</label>
                    <input
                      id="contaEmail"
                      type="email"
                      value={form.contaEmail}
                      onChange={(e) => setForm((f) => ({ ...f, contaEmail: e.target.value }))}
                      className={inputClass}
                      placeholder="Pode ser o email do funcionário ou outro"
                    />
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
                        placeholder="Mínimo 6 caracteres"
                      />
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
                disabled={createMutation.isPending}
                aria-busy={createMutation.isPending}
              >
                {createMutation.isPending ? "A guardar…" : "Guardar funcionário"}
              </button>
              <Link href="/funcionarios" className={btnSecondary}>Cancelar</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
