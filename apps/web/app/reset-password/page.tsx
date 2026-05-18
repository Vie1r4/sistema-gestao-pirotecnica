"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { safeParseJson } from "@/app/lib/api";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { postResetPassword } from "@/app/lib/authApi";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button w-full rounded-xl bg-[#f97316] px-5 py-3 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();

  const email = useMemo(() => params.get("email") ?? "", [params]);
  const token = useMemo(() => params.get("token") ?? "", [params]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      setMessage("Link inválido. Volte a pedir a recuperação de palavra-passe.");
    }
  }, [email, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setMessage(null);
    if (!email || !token) {
      setMessage("Link inválido.");
      return;
    }
    if (!newPassword) {
      setMessage("Indique a nova palavra-passe.");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("A palavra-passe e a confirmação não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const res = await postResetPassword({
        email,
        token,
        newPassword,
        confirmPassword,
      });
      const data = (await safeParseJson(res)) as Record<string, unknown>;
      if (res.ok) {
        setMessage(
          (data.message as string) ??
            "Palavra-passe atualizada com sucesso. Já pode iniciar sessão."
        );
        setTimeout(() => router.push("/login"), 900);
        return;
      }
      setMessage((data.error as string) ?? "Não foi possível redefinir a palavra-passe.");
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
            Definir nova palavra-passe
          </h1>
          {email && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Conta: <span className="font-medium">{email}</span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="rp-pass" className={labelClass}>
                Nova palavra-passe
              </label>
              <input
                id="rp-pass"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label htmlFor="rp-confirm" className={labelClass}>
                Confirmar palavra-passe
              </label>
              <input
                id="rp-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="Repita a palavra-passe"
              />
            </div>

            {message && (
              <p className="text-sm text-gray-700 dark:text-gray-300" role="status">
                {message}
              </p>
            )}

            <button type="submit" className={btnPrimary} disabled={loading || !email || !token}>
              {loading ? "A guardar…" : "Guardar"}
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

