"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { safeParseJson } from "@/app/lib/api";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { postForgotPassword } from "@/app/lib/authApi";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button w-full rounded-xl bg-[#f97316] px-5 py-3 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setMessage(null);
    if (!email.trim()) {
      setMessage("Indique o seu email.");
      return;
    }
    setLoading(true);
    try {
      const res = await postForgotPassword(email.trim());
      const data = (await safeParseJson(res)) as Record<string, unknown>;
      const msg =
        (data.message as string) ??
        "Se o email existir no sistema, será enviado um link para redefinir a palavra-passe.";
      setMessage(msg);
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
            Recuperar palavra-passe
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Indique o seu email. Se existir no sistema, enviamos um link para definir uma nova
            palavra-passe.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="fp-email" className={labelClass}>
                Email
              </label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="email@exemplo.pt"
              />
            </div>

            {message && (
              <p className="text-sm text-gray-700 dark:text-gray-300" role="status">
                {message}
              </p>
            )}

            <button type="submit" className={btnPrimary} disabled={loading}>
              {loading ? "A enviar…" : "Enviar link"}
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

