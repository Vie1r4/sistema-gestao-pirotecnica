"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { safeParseJson } from "@/app/lib/api";
import { apiPath } from "@/app/lib/apiConfig";
import { setTokens } from "@/app/lib/auth";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button w-full rounded-xl bg-[#f97316] px-5 py-3 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

export default function RegistarPrimeiroUtilizadorPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setMessage(null);
    if (!email.trim() || !password) {
      setMessage("Preencha o email e a palavra-passe.");
      return;
    }
    if (password.length < 6) {
      setMessage("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setMessage("A palavra-passe e a confirmação não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiPath("api/auth/registar-primeiro-utilizador"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          nome: nome.trim() || undefined,
        }),
      });
      const data = (await safeParseJson(res)) as Record<string, unknown>;
      const token =
        (data.token ?? data.Token ?? data.accessToken ?? data.AccessToken) as string | undefined;
      const refreshToken = (data.refreshToken ?? data.RefreshToken) as string | undefined;
      if (res.ok && token) {
        if (typeof window !== "undefined") {
          if (refreshToken) setTokens(token, refreshToken);
          else localStorage.setItem("token", token);
          window.location.href = "/";
        }
        return;
      }
      setMessage((data.error ?? data.Error ?? "Ocorreu um erro. Tente novamente.") as string);
    } catch {
      setMessage("Não foi possível contactar o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] selection:bg-[#f97316]/20 dark:bg-[#0a0a0a] dark:text-white">
      <header className="border-b border-[#e7e5e4] bg-white dark:border-[#1a1a1a] dark:bg-[#0a0a0a]/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-14 max-w-md items-center justify-center px-4 sm:px-6">
          <Link
            href="/"
            className="cursor-default text-lg font-semibold tracking-tight text-[#ea580c] dark:text-[#f97316]"
          >
            PIROFAFE
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-14 sm:px-6">
        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={transitionSmooth}
          className="card-hover rounded-2xl border border-[#e7e5e4] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] dark:shadow-none sm:p-10"
        >
          <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Criar primeiro utilizador
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Como não existem contas no sistema, crie a primeira. Será administrador.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="reg-nome" className={labelClass}>
                Nome (opcional)
              </label>
              <input
                id="reg-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={inputClass}
                placeholder="O seu nome"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className={labelClass}>
                Email *
              </label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="email@exemplo.pt"
              />
            </div>
            <div>
              <label htmlFor="reg-password" className={labelClass}>
                Palavra-passe *
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label htmlFor="reg-confirmar" className={labelClass}>
                Confirmar palavra-passe *
              </label>
              <input
                id="reg-confirmar"
                type="password"
                required
                autoComplete="new-password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                className={inputClass}
                placeholder="Repita a palavra-passe"
              />
            </div>

            {message && (
              <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
            )}

            <button type="submit" className={btnPrimary} disabled={loading}>
              {loading ? "A criar conta…" : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <Link href="/login" className="text-[#f97316] hover:underline">
              ← Voltar ao início de sessão
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
