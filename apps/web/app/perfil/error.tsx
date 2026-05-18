"use client";

import PageError from "@/app/components/PageError";

export default function PerfilError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      backHref="/perfil"
      backLabel="Voltar ao perfil"
      error={error}
      reset={reset}
    />
  );
}
