"use client";

import PageError from "@/app/components/PageError";

export default function ProdutosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      backHref="/produtos"
      backLabel="Voltar ao catálogo de produtos"
      error={error}
      reset={reset}
    />
  );
}
