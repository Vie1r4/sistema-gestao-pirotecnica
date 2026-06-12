"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { safeParseJson } from "@/app/lib/api";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { postResetPassword } from "@/app/lib/authApi";
import {
  formatApiPasswordDetails,
  PASSWORD_HINT,
  PASSWORD_PLACEHOLDER,
  validatePasswordClient,
} from "@/app/lib/passwordPolicy";
import { normalizeResetTokenFromUrl } from "@/app/lib/resetPasswordToken";

import { inputClass, labelClass, authCardClass as cardClass } from "@/app/components/ui/tokens";

const btnPrimary =
  "data-button w-full rounded-xl bg-[#f97316] px-5 py-3 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();

  const email = useMemo(() => (params.get("email") ?? "").trim(), [params]);
  const token = useMemo(
    () => normalizeResetTokenFromUrl(params.get("token") ?? ""),
    [params]
  );

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
    const passwordError = validatePasswordClient(newPassword);
    if (passwordError) {
      setMessage(passwordError);
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
      setMessage(
        formatApiPasswordDetails(data) ??
          (data.error as string) ??
          "Não foi possível redefinir a palavra-passe."
      );
    } catch (err) {
      setMessage(
        err instanceof Error && err.message.includes("HTML")
          ? err.message
          : "Não foi possível contactar o servidor. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={transitionSmooth}
        className={cardClass}
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
              placeholder={PASSWORD_PLACEHOLDER}
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{PASSWORD_HINT}</p>
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
          <Link href="/forgot-password" className="text-[#f97316] hover:underline">
            Pedir novo link
          </Link>
          {" · "}
          <Link href="/login" className="text-[#f97316] hover:underline">
            Início de sessão
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

export default function ResetPasswordPage() {
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

      <Suspense
        fallback={
          <main className="mx-auto max-w-md px-4 py-14 sm:px-6">
            <div className={cardClass}>
              <p className="text-sm text-gray-600 dark:text-gray-400">A carregar…</p>
            </div>
          </main>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
