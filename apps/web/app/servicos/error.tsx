"use client";

import PageError from "@/app/components/PageError";

export default function ServicosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      backHref="/servicos"
      backLabel="Voltar à lista de serviços"
      error={error}
      reset={reset}
    />
  );
}
