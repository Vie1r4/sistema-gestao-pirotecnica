"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ensureAccessToken, isAuthenticated } from "@/app/lib/auth";
import { isRotaPublica, isRotaSemBootstrapAuth } from "@/app/lib/publicRoutes";
import { UserProvider } from "@/app/context/UserContext";
import RoutePermissionGuard from "./RoutePermissionGuard";
import AuthLoadingShell from "./AuthLoadingShell";

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
    if (isRotaSemBootstrapAuth(pathname)) {
      setAuthReady(true);
      return;
    }
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
    return <AuthLoadingShell />;
  }

  if (isRotaPublica(pathname)) {
    return (
      <UserProvider>
        {children}
      </UserProvider>
    );
  }

  if (!isAuthenticated()) {
    return <AuthLoadingShell />;
  }

  return (
    <UserProvider>
      <RoutePermissionGuard>{children}</RoutePermissionGuard>
    </UserProvider>
  );
}
