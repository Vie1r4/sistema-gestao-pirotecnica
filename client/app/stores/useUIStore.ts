"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

const STORAGE_KEY = "pirofafe-theme";

function applyThemeToDom(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.setAttribute("data-theme", theme);
}

type UIState = {
  theme: Theme;
  _hydrated: boolean;
};

type UIActions = {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setHydrated: () => void;
};

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      theme: "dark",
      _hydrated: false,

      setTheme: (theme) => {
        set({ theme });
        applyThemeToDom(theme);
      },

      toggleTheme: () => {
        set((state) => {
          const next = state.theme === "dark" ? "light" : "dark";
          applyThemeToDom(next);
          return { theme: next };
        });
      },

      setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ theme: s.theme }),
      storage: {
        getItem: (name) => {
          const raw = typeof window === "undefined" ? null : localStorage.getItem(name);
          if (!raw) return null;
          try {
            const parsed = JSON.parse(raw) as { state?: { theme?: Theme }; version?: number };
            if (parsed?.state?.theme) return { state: { theme: parsed.state.theme }, version: parsed.version ?? 0 };
            // Compatibilidade: valor antigo era localStorage.setItem(key, "dark"|"light")
            if (raw === "dark" || raw === "light") {
              return { state: { theme: raw as Theme }, version: 0 };
            }
            return null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch {}
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {}
        },
      },
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyThemeToDom(state.theme);
      },
    }
  )
);

/** Aplica o tema guardado ao DOM na primeira hidratação (SSR-safe). */
export function applyStoredThemeOnMount() {
  const theme = useUIStore.getState().theme;
  if (typeof document !== "undefined") applyThemeToDom(theme);
}
