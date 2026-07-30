"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/app/context/UserContext";

/** Links da sidebar; cada um tem o ícone correspondente e a permissão necessária. */
const NAV_LINKS: { label: string; href: string; permission: string[]; icon: React.ReactNode }[] = [
  {
    label: "Painel Admin",
    href: "/admin",
    permission: ["admin"],
    icon: (
      <svg className="h-5 w-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    label: "Funcionários",
    href: "/funcionarios",
    permission: ["funcionarios.gerir"],
    icon: (
      <svg className="h-5 w-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    label: "Clientes",
    href: "/clientes",
    permission: ["clientes.gerir"],
    icon: (
      <svg className="h-5 w-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    label: "Armazém",
    href: "/armazem",
    permission: ["armazem.stock", "armazem.gerir"],
    icon: (
      <svg className="h-5 w-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    label: "Catálogo",
    href: "/produtos",
    permission: ["produtos.ver", "produtos.gerir"],
    icon: (
      <svg className="h-5 w-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.44 1.44 0 002.037 0l4.752-4.752a1.44 1.44 0 000-2.036l-9.58-9.582a2.25 2.25 0 00-1.592-.659zM7.5 6h.008v.008H7.5V6z" />
      </svg>
    ),
  },
  {
    label: "Encomendas",
    href: "/encomendas",
    permission: ["encomendas.gerir"],
    icon: (
      <svg className="h-5 w-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
      </svg>
    ),
  },
  {
    label: "Serviços",
    href: "/servicos",
    permission: ["servicos.gerir"],
    icon: (
      <svg className="h-5 w-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      </svg>
    ),
  },
  {
    label: "Documentação",
    href: "/documentacao",
    permission: ["documentacao.gerir"],
    icon: (
      <svg className="h-5 w-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
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
  const visibleLinks = NAV_LINKS.filter((link) =>
    link.permission.some((p) => permissions.includes(p))
  ).filter((link) =>
    link.href === "/documentacao" ? permissions.includes("documentacao.gerir") : true
  );
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = () => {
    setSidebarOpen(false);
    setSidebarPinned(false);
  };

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const openSidebar = () => {
    clearHideTimeout();
    setSidebarOpen(true);
  };

  const scheduleCloseSidebar = () => {
    if (sidebarPinned) return;
    hideTimeoutRef.current = setTimeout(() => setSidebarOpen(false), HIDE_SIDEBAR_DELAY);
  };

  const toggleSidebar = () => {
    if (!user) return;
    if (sidebarOpen && sidebarPinned) {
      setSidebarOpen(false);
      setSidebarPinned(false);
      return;
    }
    setSidebarPinned(true);
    openSidebar();
  };

  const handleSidebarEnter = () => {
    openSidebar();
  };

  const handleSidebarLeave = () => {
    scheduleCloseSidebar();
  };

  useEffect(() => {
    setSidebarOpen(false);
    setSidebarPinned(false);
  }, [pathname]);

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
      >
        <div className="flex items-center gap-2">
          {user ? (
            <button
              type="button"
              aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={sidebarOpen}
              onClick={toggleSidebar}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e7e5e4] text-[#444] transition-colors hover:border-[#f97316]/40 hover:bg-[#fff7ed] hover:text-[#ea580c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#333] dark:text-gray-300 dark:hover:border-[#f97316]/30 dark:hover:bg-[#161616] dark:hover:text-[#f97316]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          ) : null}
          <Link
            href="/"
            data-button
            onClick={handleLogoClick}
            className="rounded-lg py-2 text-lg font-semibold tracking-tight text-[#ea580c] transition-[color,filter] duration-200 hover:text-[#f97316] hover:drop-shadow-[0_0_12px_rgba(249,115,22,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:text-[#f97316] dark:hover:opacity-90 dark:hover:drop-shadow-[0_0_16px_rgba(249,115,22,0.35)]"
          >
            PIROFAFE
          </Link>
        </div>
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
          <>
            <motion.button
              type="button"
              aria-label="Fechar menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[35] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => {
                setSidebarOpen(false);
                setSidebarPinned(false);
              }}
            />
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              onMouseEnter={handleSidebarEnter}
              onMouseLeave={handleSidebarLeave}
              className="fixed bottom-0 left-0 z-40 flex w-[200px] flex-col border-r border-[#e7e5e4] bg-white top-14 h-[calc(100vh-56px)] shadow-[2px_0_12px_-4px_rgba(0,0,0,0.06),1px_0_0_0_rgba(0,0,0,0.03)] backdrop-blur-xl dark:border-[#1a1a1a] dark:bg-[#0a0a0a]/95 dark:shadow-[2px_0_24px_-8px_rgba(0,0,0,0.5)]"
            >
              <div className="flex flex-1 flex-col p-4">
                <motion.span
                  variants={navItem}
                  transition={{ duration: 0.3 }}
                  className="mb-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#78716c] dark:text-[#666]"
                >
                  Navegação
                </motion.span>
                <nav className="flex flex-col gap-1.5">
                  {visibleLinks.length === 0 ? (
                    <p className="px-4 py-2 text-sm text-[#78716c] dark:text-gray-500">
                      Sem permissões de navegação. Contacte o administrador.
                    </p>
                  ) : null}
                  {visibleLinks.map(({ label, href, icon }) => {
                    const isActive = pathname === href || pathname.startsWith(href + "/");
                    return (
                      <motion.div key={href} variants={navItem} transition={{ duration: 0.35 }}>
                        <Link
                          href={href}
                          className={`group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] ${
                            isActive
                              ? "bg-orange-50 text-[#ea580c] shadow-[inset_0_1px_0_0_rgba(0,0,0,0.01)] dark:bg-[#1e1510] dark:text-[#f97316] font-semibold"
                              : "text-[#57534e] hover:bg-[#fafaf9] hover:text-[#1c1917] dark:text-[#a3a3a3] dark:hover:bg-[#121212] dark:hover:text-white"
                          }`}
                        >
                          <span className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                            isActive ? "text-[#ea580c] dark:text-[#f97316]" : "text-[#878684] dark:text-[#666] group-hover:text-[#1c1917] dark:group-hover:text-white"
                          }`}>
                            {icon}
                          </span>
                          <span className="truncate">{label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
