"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/app/context/UserContext";

/** Links da sidebar; cada um tem a permissão necessária (qualquer uma da lista permite ver o link). */
const NAV_LINKS: { label: string; href: string; permission: string[] }[] = [
  { label: "Painel Admin", href: "/admin", permission: ["admin"] },
  { label: "Funcionários", href: "/funcionarios", permission: ["funcionarios.gerir"] },
  { label: "Clientes", href: "/clientes", permission: ["clientes.gerir"] },
  { label: "Armazém", href: "/armazem", permission: ["armazem.stock", "armazem.gerir"] },
  { label: "Catálogo", href: "/produtos", permission: ["produtos.ver", "produtos.gerir"] },
  { label: "Encomendas", href: "/encomendas", permission: ["encomendas.gerir"] },
  { label: "Serviços", href: "/servicos", permission: ["servicos.gerir"] },
  { label: "Documentação", href: "/documentacao", permission: ["servicos.gerir"] },
];

export const SIDEBAR_WIDTH = 200;
export const HEADER_HEIGHT = 56;
/** Espaço entre a barra superior e o conteúdo/sidebar (navbar de cima + gap) */
export const CONTENT_OFFSET_TOP = HEADER_HEIGHT + 24;

const navItem = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
};

const HIDE_SIDEBAR_DELAY = 200;

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const userName = user?.nome ?? null;
  const permissions = user?.permissions ?? [];
  const roles = user?.roles ?? [];
  const isAdminOrGestor = roles.includes("Admin") || roles.includes("Gestor");
  const visibleLinks = NAV_LINKS.filter((link) =>
    link.permission.some((p) => permissions.includes(p))
  ).filter((link) =>
    link.href === "/documentacao" ? isAdminOrGestor : true
  );
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = () => {
    setSidebarOpen(false);
  };

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  /** Só abre a sidebar quando há utilizador autenticado. */
  const handleLogoEnter = () => {
    if (!user) return;
    clearHideTimeout();
    setSidebarOpen(true);
  };

  const handleLogoLeave = () => {
    hideTimeoutRef.current = setTimeout(() => setSidebarOpen(false), HIDE_SIDEBAR_DELAY);
  };

  const handleSidebarEnter = () => {
    clearHideTimeout();
    setSidebarOpen(true);
  };

  const handleSidebarLeave = () => {
    hideTimeoutRef.current = setTimeout(() => setSidebarOpen(false), HIDE_SIDEBAR_DELAY);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(typeof window !== "undefined" && window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    return () => clearHideTimeout();
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b px-4 transition-[background-color,box-shadow] duration-200 sm:px-6 ${
          scrolled
            ? "border-[#e7e5e4] bg-white/85 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-[#1a1a1a] dark:bg-[#0a0a0a]/85 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
            : "border-[#e7e5e4] bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:border-[#1a1a1a] dark:bg-[#0a0a0a] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
        }`}
        style={{ height: HEADER_HEIGHT }}
      >
        <Link
          href="/"
          data-button
          onClick={handleLogoClick}
          onMouseEnter={user ? handleLogoEnter : undefined}
          onMouseLeave={user ? handleLogoLeave : undefined}
          className="rounded-lg py-2 text-lg font-semibold tracking-tight text-[#ea580c] transition-[color,filter] duration-200 hover:text-[#f97316] hover:drop-shadow-[0_0_12px_rgba(249,115,22,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:text-[#f97316] dark:hover:opacity-90 dark:hover:drop-shadow-[0_0_16px_rgba(249,115,22,0.35)]"
        >
          PIROFAFE
        </Link>
        {user ? (
            <Link
              href="/perfil"
              data-button
              className="rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-4 py-2 text-sm font-medium text-[#444] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-[#d6d3d1] hover:bg-[#f5f5f4] hover:text-[#1c1917] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#222] dark:bg-[#111]/80 dark:text-[#a0a0a0] dark:shadow-none dark:hover:border-[#333] dark:hover:bg-[#161616] dark:hover:text-white"
            >
              {userName?.trim() ? userName : "Perfil"}
            </Link>
          ) : (
            <Link
              href="/login"
              data-button
              className="rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-4 py-2 text-sm font-medium text-[#444] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-[#d6d3d1] hover:bg-[#f5f5f4] hover:text-[#1c1917] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#222] dark:bg-[#111]/80 dark:text-[#a0a0a0] dark:shadow-none dark:hover:border-[#333] dark:hover:bg-[#161616] dark:hover:text-white"
            >
              Iniciar sessão
            </Link>
          )}
      </motion.header>

      <AnimatePresence>
        {user && sidebarOpen && (
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            onMouseEnter={handleSidebarEnter}
            onMouseLeave={handleSidebarLeave}
            className="fixed bottom-0 left-0 z-40 flex w-[200px] flex-col border-r border-[#e7e5e4] bg-white shadow-[2px_0_12px_-4px_rgba(0,0,0,0.06),1px_0_0_0_rgba(0,0,0,0.03)] backdrop-blur-xl dark:border-[#1a1a1a] dark:bg-[#0a0a0a]/95 dark:shadow-[2px_0_24px_-8px_rgba(0,0,0,0.5)]"
            style={{ top: CONTENT_OFFSET_TOP, minHeight: `calc(100vh - ${CONTENT_OFFSET_TOP}px)` }}
          >
            <div className="flex flex-1 flex-col p-4">
          <motion.span
            variants={navItem}
            transition={{ duration: 0.3 }}
            className="mb-3 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-[#78716c] dark:text-[#666]"
          >
            Navegação
          </motion.span>
          <nav className="flex flex-col gap-2">
            {visibleLinks.map(({ label, href }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <motion.div key={href} variants={navItem} transition={{ duration: 0.35 }}>
                  <Link
                    href={href}
                    className={`relative flex min-h-[48px] items-center rounded-xl px-4 py-3.5 text-base font-medium transition-[border-color,background-color,color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] ${
                      isActive
                        ? "border-l-2 border-[#ea580c] bg-[#fff7ed] text-[#ea580c] shadow-[inset_0_1px_0_0_rgba(0,0,0,0.02)] dark:border-[#f97316] dark:bg-[#161616] dark:text-[#f97316] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),inset_2px_0_12px_-4px_rgba(249,115,22,0.12)]"
                        : "border-l-2 border-transparent text-[#444] hover:border-[#f97316]/35 hover:bg-[#fff7ed]/60 hover:text-[#ea580c] dark:text-white/85 dark:hover:border-[#f97316]/30 dark:hover:bg-[#111] dark:hover:text-[#f97316] dark:hover:shadow-[inset_0_0_0_1px_rgba(249,115,22,0.06)]"
                    }`}
                  >
                    {label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
