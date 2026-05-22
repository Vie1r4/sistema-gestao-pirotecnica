"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { isDemoModeEnabled, setDemoModeEnabled } from "@/app/lib/gestorAnalyticsDemo";

type GestorDemoContextValue = {
  demoMode: boolean;
  setDemoMode: (on: boolean) => void;
  toggleDemoMode: () => void;
};

const GestorDemoContext = createContext<GestorDemoContextValue | null>(null);

export function GestorDemoProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoModeState] = useState(false);

  useEffect(() => {
    setDemoModeState(isDemoModeEnabled());
  }, []);

  const setDemoMode = useCallback((on: boolean) => {
    setDemoModeEnabled(on);
    setDemoModeState(on);
  }, []);

  const toggleDemoMode = useCallback(() => {
    setDemoMode(!demoMode);
  }, [demoMode, setDemoMode]);

  return (
    <GestorDemoContext.Provider value={{ demoMode, setDemoMode, toggleDemoMode }}>
      {children}
    </GestorDemoContext.Provider>
  );
}

export function useGestorDemo() {
  const ctx = useContext(GestorDemoContext);
  if (!ctx) throw new Error("useGestorDemo must be used within GestorDemoProvider");
  return ctx;
}

export function GestorDemoBanner() {
  const { demoMode, toggleDemoMode } = useGestorDemo();
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[#f97316]/50 bg-[#fff7ed]/80 px-4 py-3 dark:border-[#f97316]/40 dark:bg-[#1a1208]/50">
      <div className="text-sm text-[#57534e] dark:text-[#a3a3a3]">
        {demoMode ? (
          <span>
            <strong className="text-[#ea580c] dark:text-[#f97316]">Modo exemplo ativo</strong> — dados
            ilustrativos a tracejado para ver o potencial de cada secção.
          </span>
        ) : (
          <span>Com poucos dados reais, podes pré-visualizar o painel com exemplos.</span>
        )}
      </div>
      <button
        type="button"
        onClick={toggleDemoMode}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          demoMode
            ? "bg-[#f97316] text-black"
            : "border border-[#e7e5e4] bg-white text-[#1c1917] hover:bg-[#fafaf9] dark:border-[#333] dark:bg-[#111] dark:text-white"
        }`}
      >
        {demoMode ? "Ver dados reais" : "Ver dados de exemplo"}
      </button>
    </div>
  );
}
