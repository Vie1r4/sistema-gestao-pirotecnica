"use client";

import PageError from "@/app/components/PageError";

export default function ArmazemError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      backHref="/armazem"
      backLabel="Voltar ao armazém"
      error={error}
      reset={reset}
    />
  );
}
