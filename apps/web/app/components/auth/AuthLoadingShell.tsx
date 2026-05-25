"use client";

import { useEffect, useState } from "react";

type Props = {
  className?: string;
};

/**
 * Spinner de sessão só no cliente (após mount).
 * Evita hydration mismatch quando extensões do browser injetam atributos (ex.: qw-selector).
 */
export default function AuthLoadingShell({
  className = "bg-[#fafafa] dark:bg-[#0a0a0a]",
}: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className={`flex min-h-screen items-center justify-center ${className}`}>
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
        role="status"
        aria-label="A carregar"
      />
    </div>
  );
}
