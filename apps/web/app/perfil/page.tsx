"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "../components/Navbar";
import ThemeToggle from "../components/ThemeToggle";
import { getToken, logout } from "../lib/auth";
import { useUser } from "@/app/context/UserContext";
import { postAlterarPassword, getPerfil, putPerfil } from "../lib/home";
import { fadeInUp, transitionSmooth } from "../lib/animations";

const cardClass =
  "card-hover rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] dark:shadow-none sm:p-8";

const inputClass =
  "mt-2 w-full rounded-xl border border-[#e7e5e4] bg-white px-4 py-3 text-[#1c1917] placeholder-[#a8a29e] shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500 dark:shadow-none";

const labelClass = "block text-sm font-medium text-[#444] dark:text-gray-300";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

/** Dados fixos da conta (não editáveis pelo utilizador). */
type Identificacao = {
  email: string;
  userName: string;
  role: string;
  dataCriacao: string;
};

function identificacaoFromUser(user: { id?: string; email?: string | null; nome?: string; roles?: string[] }): Identificacao {
  const email = user.email ?? user.id ?? "";
  const role = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles.join(", ") : "Utilizador";
  return {
    email,
    userName: user.nome || email?.split("@")[0] || "Utilizador",
    role,
    dataCriacao: new Date().toLocaleDateString("pt-PT"),
  };
}

export default function PerfilPage() {
  const queryClient = useQueryClient();
  const { user, refetch: refetchUser } = useUser();
  const [mounted, setMounted] = useState(false);
  const [identificacao, setIdentificacao] = useState<Identificacao | null>(null);
  const [dadosPessoais, setDadosPessoais] = useState({ nome: "", telefone: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasToken = mounted && !!getToken();

  const { data: perfilRaw, isLoading: perfilLoading } = useQuery({
    queryKey: ["home", "perfil"],
    queryFn: async () => {
      const token = getToken();
      if (!token) return null;
      return getPerfil(token) as Promise<{
        model?: { nome?: string; telefone?: string; email?: string; userName?: string; roles?: string[]; dataRegisto?: string };
      }>;
    },
    enabled: hasToken,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (!mounted) return;
    const data = perfilRaw;
    const model = data?.model;
    if (model) {
      const nome = (model.nome ?? (model as Record<string, unknown>).Nome ?? "") as string;
      const telefone = (model.telefone ?? (model as Record<string, unknown>).Telefone ?? "") as string;
      const email = (model.email ?? (model as Record<string, unknown>).Email ?? "") as string;
      const roles = ((model.roles ?? (model as Record<string, unknown>).Roles) as string[] | undefined) ?? [];
      const dataRegisto = (model.dataRegisto ?? (model as Record<string, unknown>).DataRegisto) as string | undefined;
      const userName = (model.userName ?? (model as Record<string, unknown>).UserName ?? email) as string;
      setDadosPessoais({ nome: nome || "", telefone: telefone || "" });
      setIdentificacao({
        email: email || "",
        userName: userName || email || "",
        role: roles.length > 0 ? roles.join(", ") : "Utilizador",
        dataCriacao: dataRegisto ? new Date(dataRegisto).toLocaleDateString("pt-PT") : new Date().toLocaleDateString("pt-PT"),
      });
      return;
    }
    if (user) {
      setIdentificacao(identificacaoFromUser(user));
      setDadosPessoais((d) => ({ ...d, nome: user.nome ?? "" }));
    } else if (!hasToken) {
      setIdentificacao(null);
    }
  }, [mounted, perfilRaw, user, hasToken]);

  const [passwordForm, setPasswordForm] = useState({
    atual: "",
    nova: "",
    confirmar: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const savingPerfilRef = useRef(false);

  const savePerfilMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão inválida.");
      return putPerfil(token, {
        nome: dadosPessoais.nome?.trim() || null,
        telefone: dadosPessoais.telefone?.trim() || null,
      });
    },
    onSuccess: (data) => {
      if (data.perfilGuardado) {
        queryClient.invalidateQueries({ queryKey: ["home", "perfil"] });
        refetchUser();
        setMessage({ type: "success", text: "Dados guardados. O seu nome e telefone foram atualizados." });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: "error", text: "Não foi possível guardar. Tente novamente." });
      }
    },
    onError: () => {
      setMessage({ type: "error", text: "Erro de ligação. Tente novamente." });
    },
  });

  const handleSavePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingPerfilRef.current || savePerfilMutation.isPending) return;
    const token = getToken();
    if (!token) {
      setMessage({ type: "error", text: "Sessão inválida. Inicie sessão novamente." });
      return;
    }
    savingPerfilRef.current = true;
    setMessage(null);
    try {
      await savePerfilMutation.mutateAsync();
    } finally {
      savingPerfilRef.current = false;
    }
  };

  const savingPerfil = savePerfilMutation.isPending;

  const [savingPassword, setSavingPassword] = useState(false);
  const savingPasswordRef = useRef(false);

  const handleAlterarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingPasswordRef.current) return;
    if (passwordForm.nova !== passwordForm.confirmar) {
      setMessage({ type: "error", text: "A nova palavra-passe e a confirmação não coincidem." });
      return;
    }
    if (passwordForm.nova.length < 6) {
      setMessage({ type: "error", text: "A nova palavra-passe deve ter pelo menos 6 caracteres." });
      return;
    }
    const token = getToken();
    if (!token) {
      setMessage({ type: "error", text: "Sessão inválida. Inicie sessão novamente." });
      return;
    }
    savingPasswordRef.current = true;
    setSavingPassword(true);
    setMessage(null);
    try {
      await postAlterarPassword(token, {
        passwordAtual: passwordForm.atual,
        novaPassword: passwordForm.nova,
        confirmarNovaPassword: passwordForm.confirmar,
      });
      setMessage({ type: "success", text: "Palavra-passe alterada com sucesso." });
      setPasswordForm({ atual: "", nova: "", confirmar: "" });
      setPasswordModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao alterar palavra-passe. Tente novamente.",
      });
    } finally {
      savingPasswordRef.current = false;
      setSavingPassword(false);
    }
  };

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setMessage(null);
    setPasswordForm({ atual: "", nova: "", confirmar: "" });
  };

  const handleTerminarSessao = () => logout();

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] selection:bg-[#f97316]/20 selection:text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
          >
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#1c1917] dark:text-white sm:text-3xl">
              O meu perfil
            </h1>
            <p className="mt-2 text-[#57534e] dark:text-gray-400">
              Gerir dados pessoais, segurança e preferências.
            </p>
          </motion.div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300"
                  : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            {/* Coluna esquerda */}
            <div className="space-y-8">
              <motion.article
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...transitionSmooth, delay: 0.05 }}
                className={cardClass}
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dados fixos da conta
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Estes dados não podem ser alterados por si. Apenas um administrador pode alterar o cargo.
                </p>
                {perfilLoading ? (
                  <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">A carregar…</p>
                ) : identificacao ? (
                  <dl className="mt-6 space-y-4">
                    <div>
                      <dt className={labelClass}>Email</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{identificacao.email || "—"}</dd>
                      <dd className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Identificador da conta</dd>
                    </div>
                    <div>
                      <dt className={labelClass}>Username</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{identificacao.userName || "—"}</dd>
                    </div>
                    <div>
                      <dt className={labelClass}>Cargo (role)</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{identificacao.role || "—"}</dd>
                      <dd className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Apenas um administrador pode alterar o cargo.</dd>
                    </div>
                    <div>
                      <dt className={labelClass}>Data de criação da conta</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{identificacao.dataCriacao || "—"}</dd>
                    </div>
                  </dl>
                ) : (
                  <>
                    <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                      Inicie sessão para ver os dados da sua conta.
                    </p>
                    <Link
                      href="/login"
                      data-button
                      className="mt-4 inline-block text-sm font-medium text-[#f97316] transition-[color] duration-200 hover:underline"
                    >
                      Iniciar sessão →
                    </Link>
                  </>
                )}
              </motion.article>

              <motion.article
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...transitionSmooth, delay: 0.1 }}
                className={cardClass}
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Segurança
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Alterar palavra-passe
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(true)}
                    className={btnPrimary}
                  >
                    Alterar palavra-passe
                  </button>
                </div>
              </motion.article>

              <motion.article
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...transitionSmooth, delay: 0.15 }}
                className={cardClass}
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sessão
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Encerrar a sessão neste dispositivo
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleTerminarSessao}
                    className={`${btnSecondary} border-red-500/50 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-950/30`}
                    data-button
                  >
                    Terminar sessão
                  </button>
                </div>
              </motion.article>
            </div>

            {/* Coluna direita */}
            <div className="space-y-8 lg:mt-0">
              <motion.article
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...transitionSmooth, delay: 0.08 }}
                className={cardClass}
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dados que pode alterar
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Apenas o nome (que aparece no site) e o telefone podem ser alterados por si.
                </p>
                <form onSubmit={handleSavePerfil} className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="nome" className={labelClass}>
                      Nome
                    </label>
                    <input
                      id="nome"
                      type="text"
                      value={dadosPessoais.nome}
                      onChange={(e) => setDadosPessoais((u) => ({ ...u, nome: e.target.value }))}
                      className={inputClass}
                      placeholder="Nome que aparece no site"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefone" className={labelClass}>
                      Telefone
                    </label>
                    <input
                      id="telefone"
                      type="tel"
                      value={dadosPessoais.telefone}
                      onChange={(e) => setDadosPessoais((u) => ({ ...u, telefone: e.target.value }))}
                      className={inputClass}
                      placeholder="+351 912 345 678"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" className={btnPrimary} disabled={savingPerfil}>
                      {savingPerfil ? "A guardar…" : "Guardar alterações"}
                    </button>
                    <Link href="/" className={btnSecondary}>
                      Voltar ao início
                    </Link>
                  </div>
                </form>
              </motion.article>

              <motion.article
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...transitionSmooth, delay: 0.1 }}
                className={cardClass}
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Aparência
                </h2>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Modo escuro / Modo claro
                  </span>
                  <ThemeToggle />
                </div>
              </motion.article>
            </div>
          </div>
        </div>
      </main>

      {/* Modal alterar palavra-passe */}
      <AnimatePresence>
        {passwordModalOpen && (
          <motion.div
            key="password-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={closePasswordModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-md rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-xl dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Alterar palavra-passe
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Preencha os campos abaixo para alterar a sua palavra-passe.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-[#222] dark:hover:text-white"
                    aria-label="Fechar"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAlterarPassword} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="modal-password-atual" className={labelClass}>
                      Palavra-passe atual
                    </label>
                    <input
                      id="modal-password-atual"
                      type="password"
                      value={passwordForm.atual}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, atual: e.target.value }))}
                      className={inputClass}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                  <div>
                    <label htmlFor="modal-password-nova" className={labelClass}>
                      Nova palavra-passe
                    </label>
                    <input
                      id="modal-password-nova"
                      type="password"
                      value={passwordForm.nova}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, nova: e.target.value }))}
                      className={inputClass}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label htmlFor="modal-password-confirmar" className={labelClass}>
                      Confirmar nova palavra-passe
                    </label>
                    <input
                      id="modal-password-confirmar"
                      type="password"
                      value={passwordForm.confirmar}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, confirmar: e.target.value }))}
                      className={inputClass}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>
                  {message && passwordModalOpen && (
                    <p
                      className={`text-sm ${
                        message.type === "error"
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {message.text}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button type="submit" className={btnPrimary} disabled={savingPassword}>
                      {savingPassword ? "A guardar…" : "Alterar palavra-passe"}
                    </button>
                    <button type="button" onClick={closePasswordModal} className={btnSecondary} disabled={savingPassword}>
                      Cancelar
                    </button>
                  </div>
                </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
