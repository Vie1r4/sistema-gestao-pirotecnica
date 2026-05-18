"use client";

import PageError from "@/app/components/PageError";

export default function perfilError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      backHref="/perfil"
      backLabel="Voltar à lista de funcionários"
      error={error}
      reset={reset}
    />
  );
}
