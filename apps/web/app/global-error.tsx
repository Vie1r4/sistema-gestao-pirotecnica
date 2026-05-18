"use client";

import Link from "next/link";

/**
 * Error boundary que substitui o layout completo quando ocorre um erro (incluindo no root layout).
 * Inclui html/body porque em caso de erro o layout não é renderizado.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  return (
    <html lang="pt">
      <body className="m-0 bg-[#f8f7f5] font-sans text-[#1c1917]">
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#e7e5e4] bg-white p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-[#1c1917]">Algo correu mal</h1>
            <p className="mt-2 text-sm text-[#57534e]">
              Ocorreu um erro inesperado. Pode tentar novamente ou voltar à página inicial.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
              >
                Tentar novamente
              </button>
              <Link
                href="/"
                className="rounded-xl border border-[#e7e5e4] px-4 py-2 text-sm font-medium text-[#57534e] hover:bg-[#fafaf9]"
              >
                Ir ao início
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
