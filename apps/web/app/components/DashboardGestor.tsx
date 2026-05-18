"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { useRef } from "react";
import { getGestorDashboard, type MovimentoRecenteDto } from "@/app/lib/homeGestor";
import { transitionSmooth, staggerContainer, staggerItem } from "@/app/lib/animations";
import { useLiveDateTime } from "@/app/hooks/useLiveDateTime";

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300",
  Gestor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
};

/** Áreas e cores para o gráfico "Resumo por área" */
const AREAS_PIE: { key: string; label: string; color: string }[] = [
  { key: "clientes", label: "Clientes", color: "#3b82f6" },
  { key: "servicos", label: "Serviços", color: "#8b5cf6" },
  { key: "produtos", label: "Produtos", color: "#f97316" },
  { key: "paiois", label: "Paióis", color: "#22c55e" },
  { key: "funcionarios", label: "Funcionários", color: "#06b6d4" },
];

const LEGEND_DOT_CLASS: Record<string, string> = {
  clientes: "legend-dot-clientes",
  servicos: "legend-dot-servicos",
  produtos: "legend-dot-produtos",
  paiois: "legend-dot-paiols",
  funcionarios: "legend-dot-funcionarios",
};

function useCountUp(value: number, enabled: boolean, durationMs = 800) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!enabled || value === 0) {
      setDisplay(value);
      return;
    }
    const startTime = performance.now();
    const step = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - (1 - progress) ** 2;
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return () => {};
  }, [value, enabled, durationMs]);
  return display;
}

type CardStat = {
  title: string;
  value: number;
  href: string;
  icon: React.ReactNode;
  variation?: string;
};

export default function DashboardGestor({
  token,
  userName,
  roleLabel,
}: {
  token: string;
  userName: string;
  roleLabel: string;
}) {
  const sec2Ref = useRef(null);
  const sec3Ref = useRef(null);
  const sec4Ref = useRef(null);
  const sec2InView = useInView(sec2Ref, { once: true, margin: "-80px" });
  const sec3InView = useInView(sec3Ref, { once: true, margin: "-80px" });
  const sec4InView = useInView(sec4Ref, { once: true, margin: "-80px" });

  const liveDate = useLiveDateTime();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["gestor-dashboard"],
    queryFn: () => getGestorDashboard(token),
    staleTime: 60 * 1000,
    retry: 2,
    enabled: !!token,
  });

  const cards: CardStat[] = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: "Encomendas pendentes",
        value: data.encomendasPendentes,
        href: "/encomendas?estado=Pendente",
        icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
        ),
      },
      {
        title: "Serviços ativos",
        value: data.totalServicos,
        href: "/servicos",
        icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.227-.226.34-.53.34-.836V6.75A2.25 2.25 0 109.75 9v4.18c0 .306.113.61.34.836l2.496 3.03" />
          </svg>
        ),
      },
      {
        title: "Paióis ativos",
        value: data.totalPaioisAtivos,
        href: "/armazem/gestao",
        icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        ),
      },
      {
        title: "Clientes",
        value: data.totalClientes,
        href: "/clientes",
        icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        ),
      },
      {
        title: "Funcionários",
        value: data.totalFuncionarios,
        href: "/funcionarios",
        icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        ),
      },
      {
        title: "Produtos",
        value: data.totalProdutos,
        href: "/produtos",
        icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        ),
      },
    ];
  }, [data]);

  /** Dados para o gráfico circular: resumo por área (clientes, serviços, produtos, paióis, funcionários) */
  const pieData = useMemo(() => {
    if (!data) return [];
    const values: Record<string, number> = {
      clientes: data.totalClientes ?? 0,
      servicos: data.totalServicos ?? 0,
      produtos: data.totalProdutos ?? 0,
      paiois: data.totalPaioisAtivos ?? 0,
      funcionarios: data.totalFuncionarios ?? 0,
    };
    const total = Object.values(values).reduce((a, b) => a + b, 0);
    return AREAS_PIE.filter((a) => values[a.key] > 0).map((a) => ({
      key: a.key,
      name: a.label,
      value: values[a.key],
      total,
      percent: total > 0 ? (values[a.key] / total) * 100 : 0,
      color: a.color,
    }));
  }, [data]);

  const lineData = useMemo(() => {
    if (!data?.encomendasPorMes?.length) return [];
    return data.encomendasPorMes.map(({ mes, total }) => ({
      mes: format(parseISO(mes + "-01"), "MMM yy", { locale: pt }),
      total,
      mesKey: mes,
    }));
  }, [data]);

  const ultimosMovimentos: MovimentoRecenteDto[] = useMemo(() => {
    if (!data) return [];
    const entradas = data.entradasRecentes.map((e) => ({ ...e, data: e.data }));
    const saidas = data.saidasRecentes.map((s) => ({ ...s, data: s.data }));
    return [...entradas, ...saidas]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }, [data]);

  /** Encomendas com estado Pendente (das últimas recebidas); para o primeiro card. */
  const encomendasPendentesLista = useMemo(() => {
    if (!data?.ultimasEncomendas) return [];
    return data.ultimasEncomendas.filter((e) => e.estado === "Pendente").slice(0, 5);
  }, [data]);

  const temAlertas = data && (data.paioisEmManutencao?.length > 0);
  const roleBadgeClass = ROLE_COLORS[roleLabel] ?? "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";

  if (isError) {
    return (
      <section
        id="dashboard-gestor"
        className="border-t border-[#e7e5e4] bg-[#fafaf9] px-6 py-24 dark:border-[#1a1a1a] dark:bg-[#050505] sm:px-8 sm:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-900/20">
            <p className="font-medium text-amber-900 dark:text-amber-200">
              {error instanceof Error ? error.message : "Erro ao carregar o painel."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="dashboard-gestor"
      className="border-t border-[#e7e5e4] bg-[#fafaf9] px-6 py-24 dark:border-[#1a1a1a] dark:bg-[#050505] sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        {/* Topo — Boas-vindas, badge, data/hora */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#1c1917] sm:text-3xl dark:text-white">
              Bem-vindo, {userName || "Gestor"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClass}`}>
                {roleLabel}
              </span>
              <span className="text-sm text-[#57534e] dark:text-[#888]">
                {format(liveDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })}
                {" · "}
                <span className="tabular-nums">{format(liveDate, "HH:mm:ss")}</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Secção 1 — Cards de estatísticas */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#e7e5e4] bg-white p-5 dark:border-[#222] dark:bg-[#0d0d0d]"
                >
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-[#e7e5e4] dark:bg-[#333]" />
                  <div className="mt-3 h-8 w-16 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                </div>
              ))
            : cards.map((card, i) => (
                <StatCard key={card.title} card={card} index={i} enabled={!!data} />
              ))}
        </motion.div>

        {/* Secção 2 — Alertas (só se houver) */}
        {temAlertas && (
          <motion.div
            ref={sec2Ref}
            initial={{ opacity: 0, y: 24 }}
            animate={sec2InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="mt-14"
          >
            <h2 className="font-semibold text-[#1c1917] dark:text-white">Alertas</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {data!.paioisEmManutencao.length > 0 && (
                <Link
                  href="/armazem/gestao"
                  className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 transition-shadow hover:shadow-md dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
                >
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold dark:bg-amber-800">
                    {data!.paioisEmManutencao.length}
                  </span>
                  Paióis em manutenção
                  <span className="text-amber-600 dark:text-amber-400">→</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Secção 3 — Gráficos Recharts */}
        <motion.div
          ref={sec3Ref}
          initial={{ opacity: 0, y: 24 }}
          animate={sec3InView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mt-14 grid gap-8 lg:grid-cols-2"
        >
          <div className="overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:border-[#222] dark:bg-[#0d0d0d] dark:hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)]">
            <div className="border-b border-[#e7e5e4] bg-[#fafaf9] px-5 py-4 dark:border-[#222] dark:bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff6ff] text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-3 3m0 0l3 3m-3-3h7.5m-7.5 0V9" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold text-[#1c1917] dark:text-white">Resumo por área</h3>
                  <p className="text-xs text-[#78716c] dark:text-[#666]">Distribuição de registos no sistema</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              {pieData.length > 0 ? (
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-stretch">
                  <div className="h-[220px] w-full min-w-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                          animationBegin={0}
                          animationDuration={500}
                        >
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          wrapperClassName="rounded-xl border border-[#e7e5e4] bg-white px-3 py-2 text-sm shadow dark:border-[#333] dark:bg-[#111]"
                          formatter={(value: number, name: string, props: { payload?: { percent?: number } }) => {
                            const pct = props?.payload?.percent;
                            return [
                              `${value} registo(s)${typeof pct === "number" ? ` — ${pct.toFixed(1)}%` : ""}`,
                              name,
                            ];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-1 flex-wrap content-start gap-x-4 gap-y-2 sm:flex-col sm:justify-center">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <span
                          className={`h-3 w-3 shrink-0 rounded-full ${LEGEND_DOT_CLASS[entry.key] ?? ""}`}
                          aria-hidden
                        />
                        <span className="text-sm text-[#1c1917] dark:text-white">{entry.name}</span>
                        <span className="tabular-nums text-sm font-medium text-[#57534e] dark:text-[#a3a3a3]">
                          {entry.value}
                          {entry.total > 0 && (
                            <span className="ml-0.5 text-xs text-[#a8a29e] dark:text-[#555]">
                              ({entry.percent.toFixed(0)}%)
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-[220px] flex-col items-center justify-center rounded-xl bg-[#fafaf9] dark:bg-[#0a0a0a]">
                  <p className="text-sm text-[#78716c] dark:text-[#666]">Sem registos para mostrar.</p>
                  <p className="mt-1 text-xs text-[#a8a29e] dark:text-[#555]">Os totais aparecem quando existir dados.</p>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-[#222] dark:bg-[#0d0d0d]">
            <h3 className="font-semibold text-[#1c1917] dark:text-white">Evolução encomendas (últimos 6 meses)</h3>
            <div className="mt-4 h-[260px]">
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-[#e7e5e4] dark:stroke-[#333]" />
                    <XAxis dataKey="mes" className="text-xs" stroke="#78716c" />
                    <YAxis className="text-xs" stroke="#78716c" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e7e5e4" }}
                      formatter={(v: number) => [v, "Encomendas"]}
                      labelFormatter={(mes) => mes}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Encomendas"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ fill: "#f97316", r: 4 }}
                      animationBegin={0}
                      animationDuration={600}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#78716c] dark:text-[#666]">
                  Sem dados
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Secção 4 — Atividade recente */}
        <motion.div
          ref={sec4Ref}
          initial={{ opacity: 0, y: 24 }}
          animate={sec4InView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mt-14 grid gap-8 lg:grid-cols-2"
        >
          {/* Card Encomendas pendentes — requerem decisão (aceitar/rejeitar) */}
          <div className="overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:border-[#222] dark:bg-[#0d0d0d] dark:hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)]">
            <div className="border-b border-[#e7e5e4] bg-[#fffbeb] px-5 py-4 dark:border-[#222] dark:bg-amber-950/20">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#1c1917] dark:text-white">Encomendas pendentes</h3>
                    <p className="text-xs text-[#78716c] dark:text-[#a3a3a3]">A aguardar aceite ou rejeição</p>
                  </div>
                </div>
                {!isLoading && data && (
                  <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-full bg-amber-200 px-2.5 text-sm font-bold tabular-nums text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                    {data.encomendasPendentes}
                  </span>
                )}
              </div>
            </div>
            <div className="min-h-[200px]">
              {isLoading ? (
                <ul className="divide-y divide-[#e7e5e4] dark:divide-[#222]">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="flex items-center gap-3 px-5 py-4">
                      <span className="h-4 w-12 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                      <span className="h-4 flex-1 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                    </li>
                  ))}
                </ul>
              ) : encomendasPendentesLista.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                  <p className="text-sm text-[#78716c] dark:text-[#888]">
                    {data && data.encomendasPendentes > 0
                      ? "Nenhuma pendente nas últimas encomendas listadas."
                      : "Nenhuma encomenda pendente."}
                  </p>
                  <Link
                    href={data?.encomendasPendentes ? "/encomendas?estado=Pendente" : "/encomendas"}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-100 dark:hover:bg-amber-800/50"
                  >
                    {data?.encomendasPendentes ? "Ver pendentes" : "Ver encomendas"}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-[#e7e5e4] dark:divide-[#222]">
                  {encomendasPendentesLista.map((enc) => (
                    <li key={enc.id}>
                      <Link
                        href={`/encomendas/${enc.id}`}
                        className="group flex items-center gap-4 border-l-2 border-transparent px-5 py-4 transition-colors hover:border-amber-500 hover:bg-[#fffbeb]/50 dark:hover:border-amber-500 dark:hover:bg-amber-950/10"
                      >
                        <span className="font-semibold tabular-nums text-[#1c1917] dark:text-white">#{enc.id}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#1c1917] dark:text-white">
                            {enc.cliente?.nome ?? `Cliente ${enc.clienteId}`}
                          </p>
                          {enc.dataCriacao && (
                            <p className="text-xs text-[#78716c] dark:text-[#666]">
                              {format(new Date(enc.dataCriacao), "d MMM, HH:mm", { locale: pt })}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                          Pendente
                        </span>
                        <svg className="h-4 w-4 shrink-0 text-[#a8a29e] group-hover:text-amber-600 dark:group-hover:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-[#e7e5e4] bg-[#fafaf9] px-5 py-3 dark:border-[#222] dark:bg-[#0a0a0a]">
              <Link
                href="/encomendas?estado=Pendente"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#ea580c] transition-colors hover:text-[#c2410c] dark:text-[#f97316] dark:hover:text-[#fb923c]"
              >
                Ver todas as pendentes
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Card Últimos movimentos */}
          <div className="overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:border-[#222] dark:bg-[#0d0d0d] dark:hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)]">
            <div className="border-b border-[#e7e5e4] bg-[#fafaf9] px-5 py-4 dark:border-[#222] dark:bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0fdf4] text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold text-[#1c1917] dark:text-white">Movimentos de armazém</h3>
                  <p className="text-xs text-[#78716c] dark:text-[#666]">Entradas e saídas recentes</p>
                </div>
              </div>
            </div>
            <div className="min-h-[200px]">
              {isLoading ? (
                <ul className="divide-y divide-[#e7e5e4] dark:divide-[#222]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li key={i} className="flex items-center gap-3 px-5 py-4">
                      <span className="h-4 w-16 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                      <span className="h-4 flex-1 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                    </li>
                  ))}
                </ul>
              ) : ultimosMovimentos.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                  <p className="text-sm text-[#78716c] dark:text-[#888]">Nenhum movimento recente.</p>
                  <Link href="/armazem/movimentos" className="mt-2 text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]">
                    Ver histórico
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[480px]">
                    <div className="grid grid-cols-[auto_auto_1fr_1fr_auto_auto] gap-2 border-b border-[#e7e5e4] px-5 py-2 text-xs font-medium uppercase tracking-wider text-[#78716c] dark:border-[#222] dark:text-[#666]">
                      <span>Data</span>
                      <span className="w-16">Tipo</span>
                      <span className="truncate">Paiol</span>
                      <span className="truncate">Produto</span>
                      <span className="text-right">Qtd</span>
                      <span className="w-12 text-right">Ref.</span>
                    </div>
                    <ul className="divide-y divide-[#e7e5e4] dark:divide-[#222]">
                      {ultimosMovimentos.map((m) => (
                        <li
                          key={`${m.tipo}-${m.id}`}
                          className="transition-colors hover:bg-[#fafaf9] dark:hover:bg-[#111]"
                        >
                          <div className="grid grid-cols-[auto_auto_1fr_1fr_auto_auto] gap-2 px-5 py-3 text-sm">
                            <span className="tabular-nums text-[#57534e] dark:text-[#a3a3a3]">
                              {format(new Date(m.data), "dd/MM HH:mm", { locale: pt })}
                            </span>
                            <span
                              className={`w-fit rounded px-2 py-0.5 text-xs font-medium ${
                                m.tipo === "Entrada"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                              }`}
                            >
                              {m.tipo}
                            </span>
                            <span className="truncate font-medium text-[#1c1917] dark:text-white" title={m.paiolNome}>
                              {m.paiolNome || "—"}
                            </span>
                            <span className="truncate text-[#57534e] dark:text-[#a3a3a3]" title={m.produtoNome}>
                              {m.produtoNome || "—"}
                            </span>
                            <span className="text-right tabular-nums font-medium text-[#1c1917] dark:text-white">
                              {Number(m.quantidade)}
                            </span>
                            <span className="w-12 text-right">
                              {m.encomendaId != null ? (
                                <Link
                                  href={`/encomendas/${m.encomendaId}`}
                                  className="font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
                                >
                                  #{m.encomendaId}
                                </Link>
                              ) : (
                                <span className="text-[#a8a29e] dark:text-[#555]">—</span>
                              )}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-[#e7e5e4] bg-[#fafaf9] px-5 py-3 dark:border-[#222] dark:bg-[#0a0a0a]">
              <Link
                href="/armazem/movimentos"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#ea580c] transition-colors hover:text-[#c2410c] dark:text-[#f97316] dark:hover:text-[#fb923c]"
              >
                Ver todos os movimentos
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({ card, index, enabled }: { card: CardStat; index: number; enabled: boolean }) {
  const displayValue = useCountUp(card.value, enabled);
  return (
    <motion.div variants={staggerItem} transition={{ ...transitionSmooth, delay: index * 0.05 }}>
      <Link
        href={card.href}
        className="card-hover group flex flex-col rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(249,115,22,0.2)] dark:border-[#222] dark:bg-[#0d0d0d] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.4)]"
      >
        <span className="text-[#ea580c] dark:text-[#f97316]">{card.icon}</span>
        <span className="mt-3 text-2xl font-bold tracking-tight text-[#1c1917] dark:text-white">{displayValue}</span>
        <span className="mt-1 text-sm font-semibold text-[#1c1917] dark:text-white">{card.title}</span>
        {card.variation && (
          <span className="mt-0.5 text-xs text-[#78716c] dark:text-[#888]">{card.variation}</span>
        )}
      </Link>
    </motion.div>
  );
}
