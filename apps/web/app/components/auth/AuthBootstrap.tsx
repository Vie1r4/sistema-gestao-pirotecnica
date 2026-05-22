"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getToken, refreshAccessToken } from "@/app/lib/auth";
import { isRotaSemBootstrapAuth } from "@/app/lib/publicRoutes";

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
