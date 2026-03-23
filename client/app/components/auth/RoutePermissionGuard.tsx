"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { getRequiredPermissionsForPath } from "@/app/lib/routePermissions";

type RoutePermissionGuardProps = {
  children: React.ReactNode;
};

/**
 * Redireciona para "/" se o utilizador aceder a uma rota para a qual não tem permissão.
 * Deve ser usado dentro de UserProvider.
 */
export default function RoutePermissionGuard({ children }: RoutePermissionGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  const required = useMemo(() => getRequiredPermissionsForPath(pathname), [pathname]);
  const permissions = user?.permissions ?? [];
  const hasPermission = required === null || required.some((p) => permissions.includes(p));

  useEffect(() => {
    if (required === null) return;
    if (loading) return;
    if (!hasPermission) {
      router.replace("/");
    }
  }, [pathname, required, loading, hasPermission, router]);

  if (required !== null && (loading || !hasPermission)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
