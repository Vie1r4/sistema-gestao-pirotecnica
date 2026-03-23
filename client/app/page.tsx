"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "./components/Navbar";
import DashboardComercial from "./components/DashboardComercial";
import DashboardGestor from "./components/DashboardGestor";
import { useUser } from "./context/UserContext";
import { fadeInUp, transitionSmooth, staggerContainer, staggerItem } from "./lib/animations";
import { getToken } from "./lib/auth";
import { getHomeStats } from "./lib/home";

/** Labels das estatísticas (ordem alinhada com a API: clientes, serviços, produtos, paióis) */
const STATS_LABELS = [
  "clientes",
  "serviços realizados",
  "produtos geridos",
  "paióis ativos",
] as const;

/** Faíscas no hero — poucas e leves para não prejudicar a fluidez (só transform + opacity) */
const SPARKS = [
  { left: "15%", top: "20%", size: 3, delay: 0, gold: false },
  { left: "85%", top: "25%", size: 3, delay: 0.8, gold: true },
  { left: "50%", top: "15%", size: 4, delay: 0.4, gold: true },
  { left: "25%", top: "70%", size: 3, delay: 1.2, gold: false },
  { left: "75%", top: "68%", size: 3, delay: 0.3, gold: false },
  { left: "8%", top: "48%", size: 3, delay: 1, gold: true },
  { left: "92%", top: "52%", size: 3, delay: 0.5, gold: false },
  { left: "40%", top: "38%", size: 3, delay: 1.5, gold: false },
  { left: "60%", top: "42%", size: 3, delay: 0.2, gold: true },
  { left: "20%", top: "82%", size: 3, delay: 0.7, gold: false },
  { left: "80%", top: "12%", size: 3, delay: 1.3, gold: true },
  { left: "48%", top: "55%", size: 4, delay: 0.6, gold: true },
] as const;

/** Hierarquia: Admin > Gestor > Comercial > Armazém. O melhor cargo do utilizador determina a vista. */
const ROLE_APENAS_ARMAZEM = "Armazém";
const ROLE_COMERCIAL = "Comercial";
const ROLE_ADMIN = "Admin";
const ROLE_GESTOR = "Gestor";

function isApenasArmazem(roles: string[] | undefined): boolean {
  if (!roles || roles.length !== 1) return false;
  return roles[0] === ROLE_APENAS_ARMAZEM;
}

/** Melhor cargo = Comercial: tem Comercial e não tem Admin nem Gestor (pode ter Armazém). */
function isMelhorCargoComercial(roles: string[] | undefined): boolean {
  if (!roles || roles.length === 0) return false;
  const hasComercial = roles.some((r) => r === ROLE_COMERCIAL);
  const hasAdmin = roles.some((r) => r === ROLE_ADMIN);
  const hasGestor = roles.some((r) => r === ROLE_GESTOR);
  return hasComercial && !hasAdmin && !hasGestor;
}

export default function Home() {
  const token = getToken();
  const { user } = useUser();
  const apenasArmazem = isApenasArmazem(user?.roles);
  const melhorCargoComercial = isMelhorCargoComercial(user?.roles);
  const showAreasSection = !!token && !apenasArmazem && !melhorCargoComercial;
  const showComercialDashboard = !!token && melhorCargoComercial;

  const {
    data: statsData,
    isLoading: loadingStats,
  } = useQuery({
    queryKey: ["home", "stats"],
    queryFn: () => getHomeStats(token!),
    staleTime: 60 * 1000,
    retry: 2,
    enabled: !!token,
  });

  const statsDisplay = statsData
    ? [
        { value: String(statsData.totalClientes), label: STATS_LABELS[0] },
        { value: String(statsData.totalServicos), label: STATS_LABELS[1] },
        { value: String(statsData.totalProdutos), label: STATS_LABELS[2] },
        { value: String(statsData.totalPaioisAtivos), label: STATS_LABELS[3] },
      ]
    : STATS_LABELS.map((label) => ({ value: "—", label }));

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] selection:bg-[#f97316]/20 selection:text-[#1c1917] dark:bg-[#050505] dark:text-white">
      <Navbar />

      <main
        className="relative"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        {/* Hero — ar premium / executivo */}
        <section className="home-hero-bg home-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-28 md:pb-36 md:pt-32">
          {/* Camada de grain sutil */}
          <div className="home-grain" aria-hidden />

          {/* Partículas / faíscas — poucas, sem blur, para manter fluidez */}
          <div className="home-sparks" aria-hidden>
            {SPARKS.map((s, i) => (
              <span
                key={i}
                className={`home-spark ${s.gold ? "home-spark--gold" : ""}`}
                style={{
                  left: s.left,
                  top: s.top,
                  width: s.size,
                  height: s.size,
                  minWidth: s.size,
                  minHeight: s.size,
                  animationDelay: `${s.delay}s`,
                  animationDuration: `${8 + (i % 2)}s`,
                }}
              />
            ))}
          </div>

          {/* Orbs de fundo com animação suave */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
            <motion.div
              className="absolute h-[600px] w-[800px] max-w-[95vw] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 58%)",
              }}
              animate={{
                scale: [1, 1.06, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute h-[380px] w-[480px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 62%)",
                marginLeft: "-15%",
                marginTop: "8%",
              }}
              animate={{
                scale: [1.04, 1, 1.04],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="relative mx-auto max-w-2xl text-center"
          >
            <motion.span
              variants={fadeInUp}
              transition={transitionSmooth}
              className="inline-block rounded-full border border-[#fed7aa]/80 bg-[#fffbf7] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c2410c]/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-[#f97316]/20 dark:bg-[#f97316]/8 dark:text-[#f97316] dark:shadow-none"
            >
              Sistema de Gestão Pirotécnica
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              transition={{ ...transitionSmooth, delay: 0.06 }}
              className="home-wordmark font-heading mt-12 text-5xl font-bold tracking-tight text-[#1c1917] sm:mt-14 sm:text-6xl md:text-7xl lg:text-8xl dark:text-white"
            >
              <motion.span
                className="inline-block text-[#ea580c] dark:text-[#f97316]"
                animate={{ opacity: [1, 0.9, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                P
              </motion.span>
              <span className="text-[#1c1917] dark:text-white">IROFAFE</span>
            </motion.h1>

            <motion.div
              variants={fadeInUp}
              transition={{ ...transitionSmooth, delay: 0.1 }}
              className="mx-auto mt-10 h-px w-16 rounded-full bg-[#ea580c]/30 dark:bg-[#f97316]/40"
              aria-hidden
            />

            <motion.p
              variants={fadeInUp}
              transition={{ ...transitionSmooth, delay: 0.12 }}
              className="mt-10 max-w-md mx-auto text-center text-base leading-relaxed text-[#57534e] tracking-wide sm:text-lg sm:tracking-normal dark:text-[#a3a3a3]"
            >
              Iluminamos os seus sonhos.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ ...transitionSmooth, delay: 0.18 }}
              className="mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-5"
            >
              <Link
                href="/login"
                data-button
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-[#ea580c] px-8 py-4 text-sm font-semibold text-white shadow-[0_2px_12px_-2px_rgba(234,88,12,0.35)] transition-all duration-300 hover:bg-[#c2410c] hover:shadow-[0_8px_24px_-4px_rgba(234,88,12,0.4)] hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c] active:scale-[0.98] dark:bg-[#f97316] dark:text-black dark:shadow-[0_4px_20px_-2px_rgba(249,115,22,0.35)] dark:hover:shadow-[0_12px_32px_-4px_rgba(249,115,22,0.4)]"
              >
                Aceder à aplicação
                <motion.span
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ x: 2 }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.span>
              </Link>
              {(showAreasSection || showComercialDashboard) && (
                <Link
                  href={showComercialDashboard ? "#dashboard-comercial" : "#dashboard-gestor"}
                  data-button
                  className="rounded-2xl border border-[#e7e5e4] bg-white/90 px-8 py-4 text-sm font-medium text-[#444] shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all duration-300 hover:border-[#f97316]/30 hover:bg-white hover:text-[#1c1917] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] active:scale-[0.98] dark:border-[#2a2a2a] dark:bg-white/5 dark:text-white/90 dark:shadow-none dark:hover:border-[#f97316]/25 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {showComercialDashboard ? "Ver painel" : showAreasSection ? "Ver painel" : "Saber mais"}
                </Link>
              )}
            </motion.div>

            {/* Cards de estatísticas (apenas quando autenticado) */}
            {token && (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="mt-36 grid max-w-4xl grid-cols-2 gap-4 sm:mt-44 sm:grid-cols-4 sm:gap-6"
            >
              {statsDisplay.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={staggerItem}
                  transition={{ ...transitionSmooth, delay: 0.22 + i * 0.06 }}
                  className="card-hover rounded-2xl border border-[#e7e5e4] bg-white/80 p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-8 dark:border-[#222] dark:bg-[#0d0d0d]/90 dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)]"
                >
                  <span className="block text-3xl font-bold tracking-tight text-[#1c1917] sm:text-4xl dark:text-white">
                    {loadingStats ? (
                      <span className="inline-block h-9 w-12 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" aria-hidden />
                    ) : (
                      stat.value
                    )}
                  </span>
                  <span className="mt-2 block text-sm font-medium text-[#57534e] dark:text-[#888]">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
            )}
          </motion.div>
        </section>

        {/* Dashboard Comercial — para quem tem melhor cargo = Comercial */}
        {showComercialDashboard && statsData && (
          <DashboardComercial token={token!} totalClientes={statsData.totalClientes} />
        )}

        {/* Dashboard Gestor — para Admin/Gestor: estatísticas, alertas, gráficos, atividade recente */}
        {showAreasSection && token && (
          <DashboardGestor
            token={token}
            userName={user?.nome ?? ""}
            roleLabel={user?.roles?.find((r) => r === ROLE_ADMIN || r === ROLE_GESTOR) ?? ROLE_GESTOR}
          />
        )}

        {/* Footer — estático para scroll fluido */}
        <footer
          className="border-t border-[#e7e5e4] bg-[#fafaf9] px-6 py-10 dark:border-[#1a1a1a] dark:bg-[#050505] sm:px-8"
        >
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs tracking-wide text-[#a8a29e] dark:text-[#555]">
              © {new Date().getFullYear()} PIROFAFE. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
