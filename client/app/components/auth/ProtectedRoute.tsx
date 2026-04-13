"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/app/lib/auth";
import { UserProvider } from "@/app/context/UserContext";
import RoutePermissionGuard from "./RoutePermissionGuard";

/** Rotas acessíveis sem login (exceção à proteção). */
const ROTAS_PUBLICAS = ["/", "/login", "/registar-primeiro-utilizador"];

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isRotaPublica(pathname)) return;
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [mounted, pathname, router]);

  if (!mounted) {
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
