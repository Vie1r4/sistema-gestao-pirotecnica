"use client";

import PageError from "@/app/components/PageError";

export default function ArmazemStockError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      backHref="/armazem/stock"
      backLabel="Voltar à lista de funcionários"
      error={error}
      reset={reset}
    />
  );
}
