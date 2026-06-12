"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ensureAccessToken, getToken, isAuthenticated } from "@/app/lib/auth";
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
  const initialAuthChecked = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || initialAuthChecked.current) return;

    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      initialAuthChecked.current = true;
      setAuthReady(true);
    };

    if (isRotaSemBootstrapAuth(pathname)) {
      finish();
      return;
    }

    if (getToken()) {
      finish();
      void ensureAccessToken();
      return;
    }

    void ensureAccessToken().then(finish);

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
    return <UserProvider>{children}</UserProvider>;
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
