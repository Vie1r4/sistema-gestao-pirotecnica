"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Error boundary global da aplicação.
 * Captura erros de render e mostra uma página de erro amigável com opção de voltar ou tentar novamente.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro capturado pelo boundary global:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f7f5] px-4 dark:bg-[#0a0a0a]">
      <div className="w-full max-w-md rounded-2xl border border-[#e7e5e4] bg-white p-8 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]">
        <h1 className="font-heading text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
          Ocorreu um erro
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Algo correu mal. Pode voltar ao início ou tentar novamente.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-[#f97316] px-4 py-2.5 text-sm font-semibold text-black transition-[opacity] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-[border-color,background-color] hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
