"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900/50 dark:bg-red-950/30">
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Algo correu mal</h2>
      <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error.message}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Tentar novamente
        </button>
        <Link
          href="/admin"
          className="rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-[#111] dark:text-red-400"
        >
          Voltar ao dashboard
        </Link>
      </div>
    </div>
  );
}
