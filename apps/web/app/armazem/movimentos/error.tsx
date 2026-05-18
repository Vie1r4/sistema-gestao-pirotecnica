"use client";

import PageError from "@/app/components/PageError";

export default function ArmazemMovimentosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      backHref="/armazem/movimentos"
      backLabel="Voltar à lista de funcionários"
      error={error}
      reset={reset}
    />
  );
}
