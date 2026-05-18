"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ensureAccessToken, isAuthenticated } from "@/app/lib/auth";
import { UserProvider } from "@/app/context/UserContext";
import RoutePermissionGuard from "./RoutePermissionGuard";

/** Rotas acessíveis sem login (exceção à proteção). */
const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/registar-primeiro-utilizador",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
];

function isRotaPublica(pathname: string | null): boolean {
  if (!pathname) return false;
  return ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(rota + "/"));
}

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setAuthReady(false);
    ensureAccessToken().then(() => {
      if (!cancelled) setAuthReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, pathname]);

  useEffect(() => {
    if (!mounted || !authReady) return;
    if (isRotaPublica(pathname)) return;
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [mounted, authReady, pathname, router]);

  if (!mounted || !authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (isRotaPublica(pathname)) {
    return (
      <UserProvider>
        {children}
      </UserProvider>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  return (
    <UserProvider>
      <RoutePermissionGuard>{children}</RoutePermissionGuard>
    </UserProvider>
  );
}
