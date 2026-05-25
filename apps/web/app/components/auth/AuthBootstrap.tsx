"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getToken, refreshAccessToken } from "@/app/lib/auth";
import { isRotaSemBootstrapAuth } from "@/app/lib/publicRoutes";
import AuthLoadingShell from "./AuthLoadingShell";

type AuthBootstrapProps = {
  children: ReactNode;
};

/** Renova sessão via cookie HttpOnly antes de avaliar rotas protegidas (reload da página). */
export default function AuthBootstrap({ children }: AuthBootstrapProps) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isRotaSemBootstrapAuth(pathname) && !getToken()) {
        await refreshAccessToken();
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!ready) {
    return <AuthLoadingShell />;
  }

  return <>{children}</>;
}
