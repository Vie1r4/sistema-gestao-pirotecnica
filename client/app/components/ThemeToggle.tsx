"use client";

import { motion } from "framer-motion";
import { useUIStore } from "@/app/stores/useUIStore";
import { getToken } from "../lib/auth";
import { postPreferencias } from "../lib/home";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === "dark";

  const handleToggle = () => {
    const nextTheme = isDark ? "light" : "dark";
    const nextTemaApi = nextTheme === "dark" ? "Dark" : "Light";
    toggleTheme();
    const token = getToken();
    if (token) {
      postPreferencias(token, nextTemaApi).catch(() => {});
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      className="relative flex h-8 w-14 shrink-0 items-center rounded-full border-2 border-[#f97316] bg-white shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#f97316] dark:bg-[#1a1a1a]"
    >
      {/* Track: fundo branco (light) ou escuro (dark) */}
      <span className="sr-only">
        {isDark ? "Modo escuro ativo" : "Modo claro ativo"}
      </span>
      <motion.span
        className="absolute top-1 left-1 h-5 w-5 rounded-full bg-[#f97316] shadow-md"
        initial={false}
        animate={{
          x: isDark ? 24 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />
    </button>
  );
}
