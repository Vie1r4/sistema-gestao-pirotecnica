"use client";

import { useEffect, useRef } from "react";
import { getToken } from "@/app/lib/auth";
import { getPreferencias } from "@/app/lib/home";
import { useUIStore } from "@/app/stores/useUIStore";

/**
 * Sincroniza o tema com a API (GET api/home/preferencias) quando o utilizador está autenticado.
 * Corre após a hidratação do store para que a preferência do servidor sobreponha o localStorage.
 */
export default function ThemeSync() {
  const setTheme = useUIStore((s) => s.setTheme);
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    const token = getToken();
    if (!token) return;
    getPreferencias(token)
      .then(({ tema }) => {
        const value = tema === "Dark" ? "dark" : "light";
        setTheme(value);
        applied.current = true;
      })
      .catch(() => {});
  }, [setTheme]);

  return null;
}
