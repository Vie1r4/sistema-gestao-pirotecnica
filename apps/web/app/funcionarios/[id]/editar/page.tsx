"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import {
  CARGOS,
  type CargoFuncionario,
  type DocumentosFuncionario,
  type Funcionario,
} from "../../../lib/funcionarios";
import { getToken } from "../../../lib/auth";
import { useUser } from "@/app/context/UserContext";
import { useToastStore } from "@/app/stores/useToastStore";
import { fetchFuncionarioEditGet, putFuncionario } from "../../../lib/funcionariosApi";
import { refreshSessionAfterRoleChange } from "@/app/lib/refreshSessionAfterRoleChange";
import { fadeInUp, transitionSmooth } from "../../../lib/animations";
import { PASSWORD_PLACEHOLDER, validatePasswordClient } from "../../../lib/passwordPolicy";
import {
  cardClass,
  inputClass,
  labelClass,
  btnPrimaryLg as btnPrimary,
  btnSecondaryLg as btnSecondary,
} from "@/app/components/ui/tokens";
import LicencaOperadorPanel from "../../_components/LicencaOperadorPanel";
import CartaoCidadaoPanel from "../../_components/CartaoCidadaoPanel";
import { toDateInputValue } from "@/app/lib/licencaOperadorConformidade";
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

function mapApiItemToFuncionario(item: Record<string, unknown>): Funcionario {
  const nome = (item.nomeCompleto ?? item.NomeCompleto ?? item.nome ?? "") as string;
  const docs = item.documentos ?? item.Documentos;
  const rawCargo = String(item.cargo ?? item.Cargo ?? "Comercial");
  const cargoNormalizado =
    rawCargo.toLowerCase() === "técnico" || rawCargo.toLowerCase() === "tecnico"
      ? ("Gestor" as const)
      : rawCargo;
  const rawEmailConfirmado =
    item.contaEmailConfirmada ?? item.ContaEmailConfirmada ?? item.emailConfirmado ?? item.EmailConfirmado;
  return {
    id: String(item.id ?? item.Id ?? ""),
    nomeCompleto: nome,
    numeroCredencial: (item.numeroCredencial ?? item.NumeroCredencial) as string | undefined,
    dataValidadeLicencaOperador: (item.dataValidadeLicencaOperador ?? item.DataValidadeLicencaOperador) as
      | string
      | undefined,
    estadoLicencaOperador: (item.estadoLicencaOperador ?? item.EstadoLicencaOperador) as string | undefined,
    dataValidadeCartaoCidadao: (item.dataValidadeCartaoCidadao ?? item.DataValidadeCartaoCidadao) as
      | string
      | undefined,
    estadoCartaoCidadao: (item.estadoCartaoCidadao ?? item.EstadoCartaoCidadao) as string | undefined,
    nif: (item.nif ?? item.NIF) as string | undefined,
    email: (item.email ?? item.Email) as string | undefined,
    telefone: (item.telefone ?? item.Telefone) as string | undefined,
    morada: (item.morada ?? item.Morada) as string | undefined,
    nss: (item.numeroSegurancaSocial ?? item.nss ?? item.NSS) as string | undefined,
    iban: (item.iban ?? item.IBAN) as string | undefined,
    cargo: (CARGOS.includes(cargoNormalizado as CargoFuncionario)
      ? (cargoNormalizado as CargoFuncionario)
      : "Comercial"),
    notas: (item.notas ?? item.Notas) as string | undefined,
    dataRegisto: String(item.dataRegisto ?? item.DataRegisto ?? new Date().toISOString()),
    contaAssociada: Boolean(item.userId ?? item.UserId),
    emailConfirmado:
      typeof rawEmailConfirmado === "boolean" ? rawEmailConfirmado : (item.emailConfirmado as boolean | undefined),
    userId: (item.userId ?? item.UserId) as string | undefined,
    documentos: docs as DocumentosFuncionario | undefined,
  };
}

export default function EditarFuncionarioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
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
    contaPerfil: "Gestor" as CargoFuncionario, // UI-only; backend força = cargo do funcionário
  });
  const [docs, setDocs] = useState<DocumentosFuncionario>({ extras: [] });
  const [cartao, setCartao] = useState<CartaoCidadaoFormState>(CARTAO_CIDADAO_VAZIO);
  const [licenca, setLicenca] = useState<LicencaOperadorFormState>(LICENCA_OPERADOR_VAZIA);
  const [ccFile, setCcFile] = useState<File | null>(null);
  const [addrFile, setAddrFile] = useState<File | null>(null);
  const [licFile, setLicFile] = useState<File | null>(null);
  const [extrasFiles, setExtrasFiles] = useState<(File | null)[]>([]);
  const [removerCc, setRemoverCc] = useState(false);
  const [removerAddr, setRemoverAddr] = useState(false);
  const [removerLic, setRemoverLic] = useState(false);
  const [removerOutros, setRemoverOutros] = useState(false);
  const [removerExtraIds, setRemoverExtraIds] = useState<number[]>([]);
  const submittingRef = useRef(false);
  const [existingDocHas, setExistingDocHas] = useState<{
    cartaoCidadao: boolean;
    documentoADR: boolean;
    licencaOperador: boolean;
    outros: boolean;
  }>({ cartaoCidadao: false, documentoADR: false, licencaOperador: false, outros: false });

  useEffect(() => {
    setMounted(true);
  }, []);

  const queryClient = useQueryClient();
  const { refetch: refetchUser } = useUser();
  const {
    data: editValue,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["funcionarios", id, "edit"],
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        throw new Error("Sessão expirada.");
      }
      try {
        return await fetchFuncionarioEditGet(token, id);
      } catch (e) {
        if (e instanceof Error && e.message === "UNAUTHORIZED") {
          router.replace("/login");
          throw new Error("Não autenticado");
        }
        throw e;
      }
    },
    staleTime: 30 * 1000,
    retry: 2,
    enabled: !!id && !!getToken(),
  });

  const funcionario: Funcionario | null =
    editValue && (editValue?.item ?? editValue) && typeof (editValue?.item ?? editValue) === "object"
      ? mapApiItemToFuncionario((editValue.item ?? editValue) as Record<string, unknown>)
      : null;

  useEffect(() => {
    if (!editValue) return;
    const data = editValue;
    const raw = data?.item ?? data;
    if (!raw || typeof raw !== "object") return;
    const rawItem = raw as Record<string, unknown>;
    const f = mapApiItemToFuncionario(rawItem);
    setForm({
      nomeCompleto: f.nomeCompleto,
      email: f.email ?? "",
      telefone: f.telefone ?? "",
      nss: f.nss ?? "",
      iban: f.iban ?? "",
      cargo: f.cargo,
      notas: f.notas ?? "",
      criarConta: !f.contaAssociada,
      contaPassword: "",
      contaConfirmar: "",
      contaPerfil: f.cargo,
    });
    const hasCc = !!(rawItem.hasCartaoCidadao ?? rawItem.cartaoCidadaoCaminho ?? rawItem.CartaoCidadaoCaminho);
    const hasAdr = !!(rawItem.hasDocumentoADR ?? rawItem.documentoADDRCaminho ?? rawItem.DocumentoADDRCaminho);
    const hasLic = !!(rawItem.hasLicencaOperador ?? rawItem.licencaOperadorCaminho ?? rawItem.LicencaOperadorCaminho);
    const hasOutros = !!(rawItem.hasOutros ?? rawItem.outrosCaminho ?? rawItem.OutrosCaminho);
    const apiExtras = (rawItem.documentosExtras ?? rawItem.DocumentosExtras ?? []) as Record<string, unknown>[];
    const extrasMapped = apiExtras.map((ex) => ({
      id: String(ex.id ?? ex.Id ?? `ex-${Date.now()}-${Math.random().toString(36).slice(2)}`),
      nome: String(ex.nome ?? ex.Nome ?? ""),
    }));
    setDocs({
      ...(f.documentos ?? {}),
      cartaoCidadao: hasCc ? "cc" : (f.documentos?.cartaoCidadao ?? undefined),
      adr: hasAdr ? "adr" : (f.documentos?.adr ?? undefined),
      licencaOperador: hasLic ? "licenca" : (f.documentos?.licencaOperador ?? undefined),
      outros: hasOutros ? "outros" : (f.documentos?.outros ?? undefined),
      extras: extrasMapped.length > 0 ? extrasMapped : (f.documentos?.extras ?? []),
    });
    setCcFile(null);
    setAddrFile(null);
    setLicFile(null);
    setExtrasFiles(extrasMapped.map(() => null));
    setRemoverCc(false);
    setRemoverAddr(false);
    setRemoverLic(false);
    setRemoverOutros(false);
    setRemoverExtraIds([]);
    setExistingDocHas({
      cartaoCidadao: hasCc,
      documentoADR: hasAdr,
      licencaOperador: hasLic,
      outros: hasOutros,
    });
    const licencaAtiva = hasLic || Boolean(f.numeroCredencial?.trim()) || Boolean(f.dataValidadeLicencaOperador);
    setLicenca({
      ativa: licencaAtiva,
      numeroCredencial: f.numeroCredencial ?? "",
      dataValidade: toDateInputValue(f.dataValidadeLicencaOperador),
    });
    const cartaoAtivo =
      hasCc ||
      Boolean(f.dataValidadeCartaoCidadao) ||
      Boolean(f.nif?.trim()) ||
      Boolean(f.morada?.trim());
    setCartao({
      ativa: cartaoAtivo,
      nif: f.nif ?? "",
      morada: f.morada ?? "",
      dataValidade: toDateInputValue(f.dataValidadeCartaoCidadao),
    });
  }, [editValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!funcionario) return;
    setMessage(null);
    if (!form.nomeCompleto.trim()) {
      setMessage({ type: "error", text: "O nome completo é obrigatório." });
      return;
    }
    if (form.criarConta && !funcionario.contaAssociada) {
      if (!form.email.trim()) {
        setMessage({ type: "error", text: "Preencha o email do funcionário para criar a conta de acesso." });
        return;
      }
      const passwordError = validatePasswordClient(form.contaPassword);
      if (passwordError) {
        setMessage({ type: "error", text: passwordError });
        return;
      }
      if (form.contaPassword !== form.contaConfirmar) {
        setMessage({ type: "error", text: "A palavra-passe e a confirmação não coincidem." });
        return;
      }
    }

    const token = getToken();
    if (!token) {
      setMessage({ type: "error", text: "Sessão inválida. Faça login novamente." });
      router.replace("/login");
      return;
    }

    const temFicheiroCc = temFicheiroCartaoCidadao({
      mode: "edit",
      ccFile,
      existingDoc: existingDocHas.cartaoCidadao,
      removerDoc: removerCc,
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
      return;
    }

    const temFicheiroLic = temFicheiroLicencaOperador({
      mode: "edit",
      licFile,
      existingDoc: existingDocHas.licencaOperador,
      removerDoc: removerLic,
    });
    const erroLicenca = validarLicencaOperadorForm({
      ativa: licenca.ativa,
      numeroCredencial: licenca.numeroCredencial,
      dataValidade: licenca.dataValidade,
      temFicheiro: temFicheiroLic,
    });
    if (erroLicenca) {
      setMessage({ type: "error", text: erroLicenca });
      return;
    }

    const fd = new FormData();
    fd.append("Funcionario.Id", id);
    fd.append("Funcionario.NomeCompleto", form.nomeCompleto.trim());
    appendCartaoCidadaoFormData(fd, cartao, ccFile);
    appendLicencaOperadorFormData(fd, licenca, licFile);
    fd.append("Funcionario.Email", form.email.trim());
    fd.append("Funcionario.Telefone", form.telefone.trim());
    fd.append("Funcionario.NumeroSegurancaSocial", form.nss.trim());
    fd.append("Funcionario.IBAN", form.iban.trim());
    fd.append("Funcionario.Cargo", form.cargo);
    fd.append("Funcionario.Notas", form.notas.trim());
    if (funcionario.userId) fd.append("Funcionario.UserId", funcionario.userId);
    fd.append("CriarConta", form.criarConta.toString());
    if (form.criarConta && !funcionario.contaAssociada) {
      fd.append("ContaEmail", form.email.trim());
    }
    fd.append("ContaPassword", form.contaPassword);
    fd.append("ContaConfirmPassword", form.contaConfirmar);
    // Backend força a role da conta = cargo do funcionário (fonte única de verdade)
    fd.append("ContaRole", form.cargo);

    fd.append("RemoverCartaoCidadao", (removerCc || !cartao.ativa).toString());
    fd.append("RemoverDocumentoADDR", removerAddr.toString());
    fd.append("RemoverLicencaOperador", (removerLic || !licenca.ativa).toString());
    fd.append("RemoverOutrosAntigo", removerOutros.toString());
    removerExtraIds.forEach((extraId, i) => fd.append(`RemoverDocumentoExtraIds[${i}]`, String(extraId)));
    if (addrFile) fd.append("DocumentoADDRFicheiro", addrFile);
    docs.extras.forEach((ex, i) => {
      const file = extrasFiles[i];
      if (file) {
        fd.append(`DocumentosExtras[${i}].Nome`, ex.nome.trim() || `Documento ${i + 1}`);
        fd.append(`DocumentosExtras[${i}].Ficheiro`, file);
      }
    });

    submittingRef.current = true;
    mutation.mutate(fd);
  };

  const mutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const token = getToken();
      if (!token) throw new Error("Sessão inválida.");
      return putFuncionario(token, id, fd);
    },
    onSuccess: async (result) => {
      useToastStore.getState().show("Alterações guardadas.", "success");
      queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
      queryClient.invalidateQueries({ queryKey: ["funcionarios", id] });
      queryClient.invalidateQueries({ queryKey: ["funcionarios", id, "edit"] });
      await refreshSessionAfterRoleChange(queryClient, result.requiresTokenRefresh);
      if (result.requiresTokenRefresh) await refetchUser();
      router.push(`/funcionarios/${id}?editado=1`);
    },
    onError: (err: Error) => setMessage({ type: "error", text: err.message || "Erro ao guardar." }),
    onSettled: () => {
      submittingRef.current = false;
    },
  });

  const addDocExtraRow = () => {
    setDocs((d) => ({ ...d, extras: [...d.extras, { id: `ex-${Date.now()}`, nome: "" }] }));
    setExtrasFiles((f) => [...f, null]);
  };

  const removeDocExtra = (docId: string) => {
    const idx = docs.extras.findIndex((e) => e.id === docId);
    const numId = parseInt(docId, 10);
    if (!isNaN(numId)) setRemoverExtraIds((prev) => [...prev, numId]);
    setDocs((d) => ({ ...d, extras: d.extras.filter((e) => e.id !== docId) }));
    if (idx >= 0) setExtrasFiles((f) => f.filter((_, i) => i !== idx));
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
      setRemoverCc(false);
      return;
    }
    setCartao(CARTAO_CIDADAO_VAZIO);
    setDocs((d) => ({ ...d, cartaoCidadao: undefined }));
    setCcFile(null);
    if (existingDocHas.cartaoCidadao) setRemoverCc(true);
  };

  const handleLicencaToggle = (checked: boolean) => {
    if (checked) {
      setLicenca((l) => ({ ...l, ativa: true }));
      setDocs((d) => ({ ...d, licencaOperador: "licenca" }));
      setRemoverLic(false);
      return;
    }
    setLicenca(LICENCA_OPERADOR_VAZIA);
    setDocs((d) => ({ ...d, licencaOperador: undefined }));
    setLicFile(null);
    if (existingDocHas.licencaOperador) setRemoverLic(true);
  };

  const temFicheiroCcAtual = temFicheiroCartaoCidadao({
    mode: "edit",
    ccFile,
    existingDoc: existingDocHas.cartaoCidadao,
    removerDoc: removerCc,
  });
  const estadoCartao = cartao.ativa
    ? estadoCartaoCidadaoAtualForm(cartao, temFicheiroCcAtual)
    : undefined;

  const temFicheiroLicencaAtual = temFicheiroLicencaOperador({
    mode: "edit",
    licFile,
    existingDoc: existingDocHas.licencaOperador,
    removerDoc: removerLic,
  });
  const estadoLicenca = licenca.ativa
    ? estadoLicencaAtualForm(licenca, temFicheiroLicencaAtual)
    : undefined;

  const FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png";

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }
  if (queryError || !funcionario) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          {queryError && (
            <p className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {queryError instanceof Error ? queryError.message : "Erro ao carregar."}
            </p>
          )}
          {!queryError && <p className="text-gray-600 dark:text-gray-400">Funcionário não encontrado.</p>}
          <Link href="/funcionarios" data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">← Voltar</Link>
        </main>
      </div>
    );
  }
  if (!canGerirFuncionarios) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          <p className="text-gray-600 dark:text-gray-400">Apenas utilizadores Admin podem editar funcionários.</p>
          <Link href={`/funcionarios/${id}`} data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">← Voltar aos detalhes</Link>
        </main>
      </div>
    );
  }

  const mostrarCriarConta = !funcionario.contaAssociada;

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-3xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">Editar funcionário</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Altere os dados da ficha. Pode substituir documentos e criar conta de acesso se ainda não existir.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <motion.section initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...transitionSmooth, delay: 0.05 }} className={cardClass}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dados pessoais</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="nome" className={labelClass}>Nome completo *</label>
                  <input id="nome" type="text" required value={form.nomeCompleto} onChange={(e) => setForm((f) => ({ ...f, nomeCompleto: e.target.value }))} className={inputClass} />
                </div>
                <div><label htmlFor="email" className={labelClass}>Email</label><input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} /></div>
                <div><label htmlFor="telefone" className={labelClass}>Telefone</label><input id="telefone" type="tel" value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} className={inputClass} /></div>
                <div><label htmlFor="nss" className={labelClass}>N.º Segurança Social</label><input id="nss" type="text" value={form.nss} onChange={(e) => setForm((f) => ({ ...f, nss: e.target.value }))} className={inputClass} /></div>
                <div><label htmlFor="iban" className={labelClass}>IBAN</label><input id="iban" type="text" value={form.iban} onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))} className={inputClass} /></div>
                <div className="sm:col-span-2"><label htmlFor="cargo" className={labelClass}>Cargo</label><select id="cargo" value={form.cargo} onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value as CargoFuncionario }))} className={inputClass}>{CARGOS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="sm:col-span-2"><label htmlFor="notas" className={labelClass}>Notas</label><textarea id="notas" rows={3} value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} className={inputClass} /></div>
              </div>
            </motion.section>

            <motion.section initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...transitionSmooth, delay: 0.1 }} className={cardClass}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documentos</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Marque os tipos de documento que pretende enviar ou substituir. Pode adicionar linhas com nome à escolha.</p>
              <div className="mt-4 flex flex-col gap-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={cartao.ativa} onChange={(e) => handleCartaoToggle(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cartão de Cidadão</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={!!docs.adr} onChange={(e) => setDocs((d) => ({ ...d, adr: e.target.checked ? "adr" : undefined }))} className="h-4 w-4 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ADR</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={licenca.ativa} onChange={(e) => handleLicencaToggle(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Credencial</span>
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={addDocExtraRow} data-button className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-[border-color,background-color,color] duration-200 hover:border-[#f97316] hover:bg-[#f97316]/5 hover:text-[#f97316] dark:border-[#444] dark:text-gray-400 dark:hover:border-[#f97316] dark:hover:text-[#f97316]">
                    <span className="text-lg leading-none">+</span>
                    Adicionar documento (nome à escolha)
                  </button>
                </div>
                {docs.outros && (
                  <label className="mt-2 flex cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={removerOutros} onChange={(e) => setRemoverOutros(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Remover documento «Outros» antigo</span>
                  </label>
                )}
              </div>

              {cartao.ativa && (
                <CartaoCidadaoPanel
                  mode="edit"
                  nif={cartao.nif}
                  onNifChange={(value) => setCartao((c) => ({ ...c, nif: value }))}
                  morada={cartao.morada}
                  onMoradaChange={(value) => setCartao((c) => ({ ...c, morada: value }))}
                  dataValidade={cartao.dataValidade}
                  onDataValidadeChange={(value) => setCartao((c) => ({ ...c, dataValidade: value }))}
                  ccFile={ccFile}
                  onCcFileChange={setCcFile}
                  existingDoc={existingDocHas.cartaoCidadao}
                  removerDoc={removerCc}
                  onRemoverDocChange={setRemoverCc}
                  estado={estadoCartao}
                  fileInputId="editar-cartao-cidadao-ficheiro"
                />
              )}

              {licenca.ativa && (
                <LicencaOperadorPanel
                  mode="edit"
                  numeroCredencial={licenca.numeroCredencial}
                  onNumeroCredencialChange={(value) =>
                    setLicenca((l) => ({ ...l, numeroCredencial: value }))
                  }
                  dataValidade={licenca.dataValidade}
                  onDataValidadeChange={(value) =>
                    setLicenca((l) => ({ ...l, dataValidade: value }))
                  }
                  licFile={licFile}
                  onLicFileChange={setLicFile}
                  existingDoc={existingDocHas.licencaOperador}
                  removerDoc={removerLic}
                  onRemoverDocChange={setRemoverLic}
                  estado={estadoLicenca}
                  fileInputId="editar-licenca-operador-ficheiro"
                />
              )}

              {mostraBlocoFicheiros && (
                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-[#222] dark:bg-[#0a0a0a]/50">
                  <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Campos de ficheiro</p>
                  <div className="flex flex-col gap-4">
                    {!!docs.adr && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">ADR</label>
                        {existingDocHas.documentoADR ? (
                          <label htmlFor="editar-adr-ficheiro" className="mt-1 flex cursor-pointer items-center gap-2">
                            <input
                              id="editar-adr-ficheiro"
                              type="file"
                              name="documentoADDRFicheiro"
                              accept={FILE_ACCEPT}
                              className="sr-only"
                              onChange={(e) => setAddrFile(e.target.files?.[0] ?? null)}
                            />
                            <span className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-gray-300 dark:hover:bg-[#222]">
                              {addrFile ? addrFile.name : "Alterar documento"}
                            </span>
                          </label>
                        ) : (
                          <input
                            type="file"
                            name="documentoADDRFicheiro"
                            accept={FILE_ACCEPT}
                            className={`${inputClass} mt-1`}
                            onChange={(e) => setAddrFile(e.target.files?.[0] ?? null)}
                          />
                        )}
                        {existingDocHas.documentoADR && (
                            <label className="mt-2 flex cursor-pointer items-center gap-2">
                            <input type="checkbox" checked={removerAddr} onChange={(e) => setRemoverAddr(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                            <span className="text-sm text-red-600 dark:text-red-400">Remover este documento</span>
                          </label>
                        )}
                      </div>
                    )}
                    {docs.extras.map((ex, i) => (
                      <div key={ex.id} className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-3 dark:border-[#222]">
                        <div className="min-w-[200px] flex-1">
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome (máx. 100 caracteres)</label>
                          <input type="text" name={`DocumentosExtras[${i}].Nome`} maxLength={100} value={ex.nome} onChange={(e) => setExtraNome(ex.id, e.target.value)} className={inputClass} placeholder="Nome do documento" />
                        </div>
                        <div className="min-w-[200px] flex-1">
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Ficheiro</label>
                          <input
                            type="file"
                            name={`DocumentosExtras[${i}].Ficheiro`}
                            accept={FILE_ACCEPT}
                            className={`${inputClass} mt-1`}
                            onChange={(e) => {
                              setExtrasFiles((prev) => {
                                const next = [...prev];
                                while (next.length <= i) next.push(null);
                                next[i] = e.target.files?.[0] ?? null;
                                return next;
                              });
                            }}
                          />
                        </div>
                        <button type="button" onClick={() => removeDocExtra(ex.id)} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950">Remover</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.section>

            {mostrarCriarConta ? (
              <motion.section initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...transitionSmooth, delay: 0.15 }} className={cardClass}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conta de acesso ao sistema</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Este funcionário ainda não tem conta. Associar significa criar uma nova conta agora (email, palavra-passe, perfil) e ligá-la à ficha. Apenas utilizadores com permissão para gerir funcionários podem criar contas.</p>
                <label className="mt-4 flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={form.criarConta} onChange={(e) => setForm((f) => ({ ...f, criarConta: e.target.checked }))} className="rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Criar conta de acesso para este funcionário</span>
                </label>
                {form.criarConta && (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">O email de login é o mesmo do funcionário (único no sistema). O sistema cria o utilizador, atribui o perfil do cargo e envia as credenciais e o link de confirmação por email.</p>
                    <div>
                      <label htmlFor="contaEmail" className={labelClass}>Email (para login, único no sistema) *</label>
                      <input id="contaEmail" type="email" value={form.email} readOnly className={inputClass} required />
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        O email da conta é automaticamente igual ao email do funcionário.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="contaPassword" className={labelClass}>Palavra-passe</label><input id="contaPassword" type="password" value={form.contaPassword} onChange={(e) => setForm((f) => ({ ...f, contaPassword: e.target.value }))} className={inputClass} placeholder={PASSWORD_PLACEHOLDER} /></div><div><label htmlFor="contaConfirmar" className={labelClass}>Confirmar palavra-passe</label><input id="contaConfirmar" type="password" value={form.contaConfirmar} onChange={(e) => setForm((f) => ({ ...f, contaConfirmar: e.target.value }))} className={inputClass} /></div></div>
                  <div>
                    <label htmlFor="contaPerfil" className={labelClass}>
                      Perfil de acesso (role)
                    </label>
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
            ) : (
              <motion.section initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...transitionSmooth, delay: 0.15 }} className={cardClass}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conta de acesso ao sistema</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Este funcionário tem conta associada. O que altera em «O meu perfil» (nome, telefone) fica guardado na ficha do funcionário.</p>
                <p className="mt-2 font-medium text-gray-900 dark:text-white">Email da conta associada: {funcionario.email ?? "—"}</p>
                <Link href={`/funcionarios/${id}/desassociar`} data-button className="mt-3 inline-block text-sm font-medium text-[#f97316] transition-[color] duration-200 hover:underline">Desassociar conta</Link>
              </motion.section>
            )}

            {message && <p className={`text-sm ${message.type === "error" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{message.text}</p>}
            <div className="flex gap-3">
              <button type="submit" className={btnPrimary} disabled={mutation.isPending}>
                {mutation.isPending ? "A guardar…" : "Guardar alterações"}
              </button>
              <Link href={`/funcionarios/${id}`} className={btnSecondary}>Cancelar</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
