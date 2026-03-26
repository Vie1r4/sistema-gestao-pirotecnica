"use client";

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getToken,
  getRefreshToken,
  getTokenExpirationSeconds,
  refreshAccessToken,
  logout,
} from "@/app/lib/auth";
import { apiPath } from "@/app/lib/apiConfig";

export type CurrentUser = {
  id: string;
  email: string | null;
  nome: string;
  roles: string[];
  /** Permissões calculadas no backend (ex.: admin, clientes.gerir, produtos.ver, armazem.stock) */
  permissions: string[];
};

type UserContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  refetch: () => void;
};

const UserContext = createContext<UserContextValue | null>(null);

function parseMeData(data: Record<string, unknown>): CurrentUser {
  const nome = (data.nome ?? data.Nome ?? "") as string;
  const roles = (data.roles ?? data.Roles ?? []) as string[];
  const permissions = (data.permissions ?? data.Permissions ?? []) as string[];
  return {
    id: String(data.id ?? data.Id ?? ""),
    email: (data.email ?? data.Email ?? data.userName ?? data.UserName) as string | null,
    nome: nome || ((data.userName ?? data.UserName) as string) || "",
    roles: Array.isArray(roles) ? roles : [],
    permissions: Array.isArray(permissions) ? permissions : [],
  };
}

/** Agenda a renovação do JWT 5 minutos antes de expirar. */
function useRefreshTokenScheduler() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function scheduleRefresh() {
      const token = getToken();
      const refreshToken = getRefreshToken();
      if (!token || !refreshToken) return;
      const exp = getTokenExpirationSeconds(token);
      if (exp == null) return;
      const nowSec = Date.now() / 1000;
      const refreshAtSec = exp - 5 * 60; // 5 min before expiry
      const delayMs = Math.max(0, (refreshAtSec - nowSec) * 1000);
      if (delayMs <= 0) {
        refreshAccessToken().then((newToken) => {
          if (newToken) scheduleRefresh();
          else logout();
        });
        return;
      }
      timeoutRef.current = setTimeout(() => {
        refreshAccessToken().then((newToken) => {
          if (newToken) scheduleRefresh();
          else logout();
        });
      }, delayMs);
    }

    if (!getToken() || !getRefreshToken()) return;
    scheduleRefresh();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
}

export function UserProvider({ children }: { children: ReactNode }) {
  useRefreshTokenScheduler();

  const {
    data,
    isLoading,
    refetch: queryRefetch,
    isFetching,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async (): Promise<CurrentUser | null> => {
      const token = getToken();
      if (!token) return null;
      const res = await fetch(apiPath("api/auth/me"), { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || !res.ok) return null;
      const raw = (await res.json()) as Record<string, unknown>;
      return parseMeData(raw);
    },
    staleTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const value = useMemo(
    () => ({
      user: data ?? null,
      loading: isLoading || isFetching,
      refetch: () => queryRefetch(),
    }),
    [data, isLoading, isFetching, queryRefetch]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    return {
      user: null,
      loading: false,
      refetch: () => {},
    };
  }
  return ctx;
}
