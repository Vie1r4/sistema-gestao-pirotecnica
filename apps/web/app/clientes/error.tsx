"use client";

import PageError from "@/app/components/PageError";

export default function ClientesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      backHref="/clientes"
      backLabel="Voltar à lista de clientes"
      error={error}
      reset={reset}
    />
  );
}
