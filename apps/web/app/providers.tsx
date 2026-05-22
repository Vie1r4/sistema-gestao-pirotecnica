"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { logout } from "@/app/lib/auth";
import { gestorAnalyticsQueryKey } from "@/app/lib/gestorAnalytics";
import { gestorDashboardQueryKey } from "@/app/lib/homeGestor";
import { useToastStore } from "@/app/stores/useToastStore";

function isAuthError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("Não autenticado") ||
    msg.includes("Sessão expirada") ||
    msg.includes("autenticado")
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 20 * 1000,
          retry: (failureCount, error) => {
            if (isAuthError(error)) return false;
            return failureCount < 2;
          },
          retryDelay: 600,
        },
        mutations: {
          onSuccess: () => {
            void client.invalidateQueries({ queryKey: gestorDashboardQueryKey });
            void client.invalidateQueries({ queryKey: gestorAnalyticsQueryKey });
          },
          onError: (error) => {
            if (typeof window === "undefined") return;
            if (isAuthError(error)) {
              useToastStore.getState().show("Sessão expirada. A redirecionar para o início de sessão…", "error");
              logout();
            } else {
              useToastStore.getState().show(getErrorMessage(error), "error");
            }
          },
        },
      },
    });
    return client;
  });

  queryClient.getQueryCache().subscribe((event) => {
    if (event?.type === "updated" && event.query.state.status === "error" && event.query.state.error) {
      const err = event.query.state.error;
      if (typeof window !== "undefined" && isAuthError(err)) {
        useToastStore.getState().show("Sessão expirada. A redirecionar para o início de sessão…", "error");
        logout();
      }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
