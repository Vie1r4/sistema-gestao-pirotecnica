"use client";

import PageError from "@/app/components/PageError";

export default function produtosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      backHref="/produtos"
      backLabel="Voltar à lista de funcionários"
      error={error}
      reset={reset}
    />
  );
}
