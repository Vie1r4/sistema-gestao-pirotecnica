"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getToken, refreshAccessToken } from "@/app/lib/auth";
import { isRotaSemBootstrapAuth } from "@/app/lib/publicRoutes";
import AuthLoadingShell from "./AuthLoadingShell";

type AuthBootstrapProps = {
  children: ReactNode;
};

/**
 * Renova sessão via cookie HttpOnly no arranque (reload ou 1.ª visita).
 * Não bloqueia navegações posteriores — o token em memória é suficiente entre rotas.
 */
export default function AuthBootstrap({ children }: AuthBootstrapProps) {
  const pathname = usePathname();
  const bootstrapDone = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (bootstrapDone.current) return;

    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      bootstrapDone.current = true;
      setReady(true);
    };

    if (isRotaSemBootstrapAuth(pathname)) {
      finish();
      return;
    }

    if (getToken()) {
      finish();
      void refreshAccessToken();
      return;
    }

    void refreshAccessToken().then(finish);

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!ready) {
    return <AuthLoadingShell />;
  }

  return <>{children}</>;
}
