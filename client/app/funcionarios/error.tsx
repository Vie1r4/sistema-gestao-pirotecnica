"use client";

import PageError from "@/app/components/PageError";

export default function FuncionariosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      backHref="/funcionarios"
      backLabel="Voltar à lista de funcionários"
      error={error}
      reset={reset}
    />
  );
}
