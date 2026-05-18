"use client";

import PageError from "@/app/components/PageError";

export default function EncomendasError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      backHref="/encomendas"
      backLabel="Voltar à lista de encomendas"
      error={error}
      reset={reset}
    />
  );
}
