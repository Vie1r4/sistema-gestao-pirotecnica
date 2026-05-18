"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { apiPath } from "@/app/lib/apiConfig";
import { safeParseJson } from "@/app/lib/api";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { setToken } from "@/app/lib/auth";

const cardClass =
  "card-hover rounded-2xl border border-[#e7e5e4] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] dark:shadow-none sm:p-10";

export default function ConfirmEmailPage() {
  const params = useSearchParams();
  const userId = useMemo(() => params.get("userId") ?? "", [params]);
  const code = useMemo(() => params.get("code") ?? "", [params]);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !code) {
      setStatus("error");
      setMessage("Link inválido. Verifique o email e tente novamente.");
      return;
    }
    setStatus("loading");
    fetch(
      apiPath(
        `api/auth/confirm-email?userId=${encodeURIComponent(userId)}&code=${encodeURIComponent(code)}`
      )
    )
      .then(async (res) => {
        const data = (await safeParseJson(res).catch(() => ({}))) as Record<string, unknown>;
        if (res.ok) {
          const token =
            (data.token as string) ??
            (data.Token as string) ??
            (data.accessToken as string) ??
            (data.AccessToken as string);
          if (token) {
            setToken(token);
            // sessão iniciada — vai direto para a app
            window.location.href = "/";
            return;
          }
          setStatus("ok");
          setMessage(
            (data.message as string) ?? "Email confirmado com sucesso. Já pode iniciar sessão."
          );
          return;
        }
        setStatus("error");
        setMessage((data.error as string) ?? "Não foi possível confirmar o email.");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Não foi possível contactar o servidor. Tente novamente.");
      });
  }, [userId, code]);

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
          className={cardClass}
        >
          <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Confirmar email
          </h1>

          {status === "loading" && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              A confirmar… aguarde.
            </p>
          )}

          {message && (
            <p
              className={`mt-4 text-sm ${
                status === "ok"
                  ? "text-green-700 dark:text-green-300"
                  : status === "error"
                    ? "text-red-700 dark:text-red-300"
                    : "text-gray-700 dark:text-gray-300"
              }`}
              role="status"
            >
              {message}
            </p>
          )}

          <div className="mt-8">
            <Link href="/login" className="text-sm text-[#f97316] hover:underline">
              Ir para o login →
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

