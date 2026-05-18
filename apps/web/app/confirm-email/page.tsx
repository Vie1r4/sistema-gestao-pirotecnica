"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { confirmEmail } from "@/app/lib/authApi";
import { setToken } from "@/app/lib/auth";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const cardClass =
  "card-hover rounded-2xl border border-[#e7e5e4] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] dark:shadow-none sm:p-10";

function ConfirmEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = useMemo(() => params.get("userId") ?? "", [params]);
  const code = useMemo(() => params.get("code") ?? "", [params]);
  const linkValido = Boolean(userId && code);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth", "confirm-email", userId, code],
    queryFn: async () => {
      const result = await confirmEmail(userId, code);
      if (result.status === "redirect") {
        setToken(result.token);
        router.replace("/");
        return result;
      }
      return result;
    },
    enabled: linkValido,
    retry: false,
    staleTime: Infinity,
  });

  const status = !linkValido
    ? "error"
    : isLoading
      ? "loading"
      : isError
        ? "error"
        : data?.status === "ok"
          ? "ok"
          : data?.status === "error"
            ? "error"
            : data?.status === "redirect"
              ? "loading"
              : "loading";

  const message = !linkValido
    ? "Link inválido. Verifique o email e tente novamente."
    : isError
      ? "Não foi possível contactar o servidor. Tente novamente."
      : data?.status === "ok" || data?.status === "error"
        ? data.message
        : null;

  return (
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
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">A confirmar… aguarde.</p>
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

        <motion.div className="mt-8">
          <Link href="/login" className="text-sm text-[#f97316] hover:underline">
            Ir para o login →
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}

export default function ConfirmEmailPage() {
  return (
    <motion.div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] selection:bg-[#f97316]/20 dark:bg-[#0a0a0a] dark:text-white">
      <header className="border-b border-[#e7e5e4] bg-white dark:border-[#1a1a1a] dark:bg-[#0a0a0a]/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
        <motion.div className="mx-auto flex h-14 max-w-md items-center justify-center px-4 sm:px-6">
          <Link
            href="/"
            data-button
            className="text-lg font-semibold tracking-tight text-[#ea580c] transition-[color,filter] duration-200 hover:text-[#f97316] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:text-[#f97316]"
          >
            PIROFAFE
          </Link>
        </motion.div>
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
        <ConfirmEmailContent />
      </Suspense>
    </motion.div>
  );
}
