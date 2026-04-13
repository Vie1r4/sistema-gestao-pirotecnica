"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { safeParseJson } from "@/app/lib/api";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button w-full rounded-xl bg-[#f97316] px-5 py-3 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

import { fetchExistemUtilizadores, postLogin } from "@/app/lib/authApi";
import { setTokens } from "@/app/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  /** Erro de rede/API não deve mostrar “criar primeiro utilizador” (origem ≠ BD). */
  const [estadoContas, setEstadoContas] = useState<
    "a carregar" | "semContas" | "comContas" | "erro"
  >("a carregar");

  useEffect(() => {
    fetchExistemUtilizadores()
      .then((existem) => setEstadoContas(existem ? "comContas" : "semContas"))
      .catch(() => setEstadoContas("erro"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setMessage(null);
    if (!email.trim() || !password) {
      setMessage("Preencha o email e a palavra-passe.");
      return;
    }
    setLoading(true);
    try {
      const res = await postLogin(email.trim(), password);
      if (res.status === 200) {
        const data = (await safeParseJson(res)) as Record<string, unknown>;
        const token =
          (data.token as string) ??
          (data.Token as string) ??
          (data.accessToken as string) ??
          (data.AccessToken as string);
        const refreshToken =
          (data.refreshToken as string) ?? (data.RefreshToken as string);
        if (token) {
          if (refreshToken) {
            setTokens(token, refreshToken);
          } else {
            localStorage.setItem("token", token);
          }
          window.location.href = "/";
          return;
        }
      }
      if (res.status === 401) {
        setMessage("Credenciais inválidas.");
        setLoading(false);
        return;
      }
      setMessage("Ocorreu um erro. Tente novamente.");
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
            data-button
            className="text-lg font-semibold tracking-tight text-[#ea580c] transition-[color,filter] duration-200 hover:text-[#f97316] hover:drop-shadow-[0_0_12px_rgba(249,115,22,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:text-[#f97316] dark:hover:opacity-90 dark:hover:drop-shadow-[0_0_16px_rgba(249,115,22,0.35)]"
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
            Iniciar sessão
          </h1>

          {estadoContas === "erro" && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
            >
              <p className="font-medium">Não foi possível contactar a API.</p>
              <p className="mt-1 text-red-800 dark:text-red-300">
                Confirme que o backend está a correr e que a rede/firewall permitem este dispositivo
                a alcançar a API. Só após a API responder é que o sistema pode indicar se ainda não
                existem contas.
              </p>
            </div>
          )}

          {estadoContas === "semContas" && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
            >
              <p className="font-medium">Não existem contas no sistema.</p>
              <p className="mt-1 text-amber-800 dark:text-amber-300">
                Crie o primeiro utilizador para poder iniciar sessão.
              </p>
              <button
                type="button"
                onClick={() => router.push("/registar-primeiro-utilizador")}
                className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500"
              >
                Criar primeiro utilizador
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label htmlFor="login-email" className={labelClass}>
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="email@exemplo.pt"
              />
            </div>
            <div>
              <label htmlFor="login-password" className={labelClass}>
                Palavra-passe
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            {message && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {message}
              </p>
            )}

            <button type="submit" className={btnPrimary} disabled={loading}>
              {loading ? "A iniciar sessão…" : "Entrar"}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
