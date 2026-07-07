"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import ClienteConsumoList from "@/app/components/gestor-analytics/ClienteConsumoList";
import TopClientesBlock from "@/app/components/gestor-analytics/TopClientesBlock";
import { pt } from "date-fns/locale";
import {
  gestorDashboardQueryKey,
  getGestorDashboard,
  kpiTrendDelta,
  type MovimentoRecenteDto,
  type UltimaEncomendaDto,
} from "@/app/lib/homeGestor";
import { transitionSmooth, staggerContainer, staggerItem } from "@/app/lib/animations";
import { useLiveDateTime } from "@/app/hooks/useLiveDateTime";
import {
  dashboardPanelClass,
  dashboardPanelHeaderClass,
  dashboardPanelHoverClass,
} from "@/app/components/gestor-analytics/dashboardPanelStyles";

/**
 * Charts (recharts) carregados sob demanda: tira a lib pesada do bundle inicial
 * e acelera a 1.ª compilação/render desta rota. Skeleton evita salto de layout.
 */
const ChartLoading = () => (
  <div className="h-72 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
);

const VolumeChart = dynamic(
  () => import("@/app/components/gestor-analytics/VolumeChart"),
  { ssr: false, loading: ChartLoading }
);
const YoYChart = dynamic(
  () => import("@/app/components/gestor-analytics/YoYChart"),
  { ssr: false, loading: ChartLoading }
);

type TabId = "atividade" | "clientes" | "armazem";

const TABS: { id: TabId; label: string }[] = [
  { id: "atividade", label: "Atividade" },
  { id: "clientes", label: "Clientes" },
  { id: "armazem", label: "Armazém" },
];

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300",
  Gestor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
};

/** Grelha 2/3 + 1/3 em desktop; empilha em mobile. */
const GRID_3_COL = "grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5";
const COL_SPAN_MAIN = "min-w-0 lg:col-span-2";
const COL_SPAN_SIDE = "min-w-0 lg:col-span-1";

type CardStat = {
  title: string;
  value: number;
  href: string;
  icon: React.ReactNode;
  trendDelta?: number | null;
  /** Destaque visual quando há alertas de conformidade. */
  variant?: "default" | "warning" | "danger";
};

const LICENCA_ICON = (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);

export default function DashboardGestor({
  token,
  userName,
  roleLabel,
}: {
  token: string;
  userName: string;
  roleLabel: string;
}) {
  const [tab, setTab] = useState<TabId>("atividade");

  const liveDate = useLiveDateTime();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: gestorDashboardQueryKey,
    queryFn: () => getGestorDashboard(token),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: 2,
    enabled: !!token,
  });

  const cards: CardStat[] = useMemo(() => {
    if (!data) return [];
    const k = data.kpiContexto;
    const c = data.conformidadeFuncionarios;
    const base: CardStat[] = [
      {
        title: "Serviços registados",
        value: data.totalServicos,
        trendDelta: kpiTrendDelta(k?.servicos),
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
        trendDelta: kpiTrendDelta(k?.paiois),
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
        trendDelta: kpiTrendDelta(k?.clientes),
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
        trendDelta: kpiTrendDelta(k?.funcionarios),
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
        trendDelta: kpiTrendDelta(k?.produtos),
        href: "/produtos",
        icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        ),
      },
    ];

    base.push({
      title: "Cred. a expirar",
      value: c?.aExpirar ?? 0,
      href: "/funcionarios?filtroLicenca=a_expirar",
      icon: LICENCA_ICON,
      variant: (c?.aExpirar ?? 0) > 0 ? "warning" : "default",
    });

    if ((c?.expiradas ?? 0) > 0) {
      base.push({
        title: "Cred. expiradas",
        value: c!.expiradas,
        href: "/funcionarios?filtroLicenca=expirada",
        icon: LICENCA_ICON,
        variant: "danger",
      });
    }

    if ((c?.incompletas ?? 0) > 0) {
      base.push({
        title: "Cred. incompletas",
        value: c!.incompletas,
        href: "/funcionarios?filtroLicenca=incompleta",
        icon: LICENCA_ICON,
        variant: "warning",
      });
    }

    return base;
  }, [data]);

  const ultimosMovimentos: MovimentoRecenteDto[] = useMemo(() => {
    if (!data) return [];
    const entradas = data.entradasRecentes.map((e) => ({ ...e, data: e.data }));
    const saidas = data.saidasRecentes.map((s) => ({ ...s, data: s.data }));
    return [...entradas, ...saidas]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }, [data]);

  const alertasCount = data?.paioisEmManutencao?.length ?? 0;
  const temAlertas = alertasCount > 0;
  const roleBadgeClass = ROLE_COLORS[roleLabel] ?? "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";

  if (isError) {
    return (
      <section
        id="dashboard-gestor"
        className="border-t border-[#e7e5e4] bg-[#fafaf9] px-6 py-24 dark:border-[#1a1a1a] dark:bg-[#050505] sm:px-8 sm:py-32"
      >
        <div className="content-container">
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
      className="border-t border-[#e7e5e4] bg-[#fafaf9] px-4 py-12 dark:border-[#1a1a1a] dark:bg-[#050505] sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="content-container">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#1c1917] sm:text-3xl dark:text-white">
            Bem-vindo, {userName || "Gestor"}
          </h1>
          <p className="mt-1.5 text-sm text-[#57534e] dark:text-[#888]">
            <span className={`mr-2 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${roleBadgeClass}`}>
              {roleLabel}
            </span>
            {format(liveDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })}
            {" · "}
            <span className="tabular-nums">{format(liveDate, "HH:mm:ss")}</span>
          </p>
        </motion.div>

        {/* Métricas — sempre visíveis acima das tabs */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 lg:gap-4"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`${dashboardPanelClass} p-4`}
                >
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-[#e7e5e4] dark:bg-[#333]" />
                  <div className="mt-3 h-8 w-16 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                </div>
              ))
            : cards.map((card, i) => <StatCard key={card.title} card={card} index={i} />)}
        </motion.div>

        {/* Barra de tabs */}
        <div className="mt-6 border-b border-[#e7e5e4] dark:border-[#222]">
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Secções do painel">
            {TABS.map((t) => {
              const ativo = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={ativo}
                  onClick={() => setTab(t.id)}
                  className={`relative -mb-px rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    ativo
                      ? "border-b-2 border-[#f97316] text-[#1c1917] dark:text-white"
                      : "border-b-2 border-transparent text-[#78716c] hover:text-[#1c1917] dark:text-[#888] dark:hover:text-white"
                  }`}
                >
                  {t.label}
                  {t.id === "armazem" && alertasCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-amber-200 px-1.5 text-[10px] font-bold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                      {alertasCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo das tabs */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-5"
        >
          {tab === "atividade" && (
            <div className="space-y-5">
              <YoYChart token={token} />
              <VolumeChart token={token} />
            </div>
          )}

          {tab === "clientes" && (
            <div className="space-y-5">
              <TopClientesBlock token={token} layout="wide" />
              <ClienteConsumoList token={token} />
            </div>
          )}

          {tab === "armazem" && (
            <div className="space-y-5">
              {temAlertas && (
                <Link
                  href="/armazem/gestao"
                  className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 transition-shadow hover:shadow-md dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
                >
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold dark:bg-amber-800">
                    {alertasCount}
                  </span>
                  Paióis em manutenção
                  <span className="text-amber-600 dark:text-amber-400">→</span>
                </Link>
              )}
              <div className={GRID_3_COL}>
                <div className={COL_SPAN_MAIN}>
                  <MovimentosArmazemPanel
                    isLoading={isLoading}
                    movimentos={ultimosMovimentos}
                  />
                </div>
                <div className={COL_SPAN_SIDE}>
                  {isLoading ? (
                    <div className={`${dashboardPanelClass} h-full min-h-[320px] animate-pulse`} />
                  ) : (
                    data && (
                      <PendingEncomendasPanel
                        total={data.encomendasPendentes}
                        lista={data.encomendasPendentesLista}
                        recebidasSemana={
                          data.kpiContexto?.encomendasPendentes?.recebidasSemana ?? 0
                        }
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function MovimentosArmazemPanel({
  isLoading,
  movimentos,
}: {
  isLoading: boolean;
  movimentos: MovimentoRecenteDto[];
}) {
  return (
    <div className={`overflow-hidden ${dashboardPanelClass} ${dashboardPanelHoverClass}`}>
      <div
        className={`${dashboardPanelHeaderClass} flex flex-wrap items-center justify-between gap-3 px-5 py-4`}
      >
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
        <Link
          href="/armazem/movimentos"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
        >
          Ver todos os movimentos
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
      <div className="min-h-[220px]">
        {isLoading ? (
          <ul className="divide-y divide-[#e7e5e4] dark:divide-[#222]">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-4">
                <span className="h-4 w-16 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                <span className="h-4 flex-1 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
              </li>
            ))}
          </ul>
        ) : movimentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <p className="text-sm text-[#78716c] dark:text-[#888]">Nenhum movimento recente.</p>
            <Link
              href="/armazem/movimentos"
              className="mt-2 text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
            >
              Ver histórico
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
              <div className="grid grid-cols-[auto_auto_1fr_1fr_auto_auto] gap-2 border-b border-[#e7e5e4] px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#78716c] dark:border-[#222] dark:text-[#666]">
                <span>Data</span>
                <span className="w-14">Tipo</span>
                <span>P/L</span>
                <span>Produto</span>
                <span className="text-right">Qtd</span>
                <span className="w-12 text-right">Ref.</span>
              </div>
              <ul className="divide-y divide-[#e7e5e4] dark:divide-[#222]">
                {movimentos.map((m) => (
                  <li
                    key={`${m.tipo}-${m.id}`}
                    className="transition-colors hover:bg-[#fafaf9] dark:hover:bg-[#111]"
                  >
                    <div className="grid grid-cols-[auto_auto_1fr_1fr_auto_auto] gap-2 px-5 py-2.5 text-sm">
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
                      <span
                        className="truncate font-medium text-[#1c1917] dark:text-white"
                        title={m.paiolNome}
                      >
                        {m.paiolNome || "—"}
                      </span>
                      <span
                        className="truncate text-[#57534e] dark:text-[#a3a3a3]"
                        title={m.produtoNome}
                      >
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
    </div>
  );
}

function tempoDesdeCriacao(dataCriacao: string, agora: Date): string {
  const diff = Math.max(0, agora.getTime() - new Date(dataCriacao).getTime());
  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function legendaPedidosRecebidos(recebidas: number, pendentes: number): string | undefined {
  if (recebidas <= 0) return undefined;
  const base =
    recebidas === 1
      ? "1 pedido recebido nos últimos 7 dias"
      : `${recebidas} pedidos recebidos nos últimos 7 dias`;
  if (pendentes === 0) return `${base} · nenhum por tratar agora`;
  return base;
}

function PendingEncomendasPanel({
  total,
  lista,
  recebidasSemana,
}: {
  total: number;
  lista: UltimaEncomendaDto[];
  recebidasSemana: number;
}) {
  const agora = useLiveDateTime();
  const legenda = legendaPedidosRecebidos(recebidasSemana, total);
  const verTodasHref = "/encomendas?estado=Todos&pagina=1";
  const destaque = lista[0];
  const restantes = lista.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className={`${dashboardPanelClass} ${dashboardPanelHoverClass} flex h-full min-h-[320px] flex-col`}
    >
      <div
        className={`flex flex-wrap items-start justify-between gap-2 ${dashboardPanelHeaderClass} px-4 py-3`}
      >
        <h2 className="text-sm font-semibold text-[#1c1917] dark:text-white">
          Encomendas pendentes
        </h2>
        <Link
          href={verTodasHref}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
        >
          Ver todas
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {total === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[#e7e5e4] px-3 py-8 text-center dark:border-[#333]">
            <p className="text-sm font-medium text-[#1c1917] dark:text-white">
              Nenhuma encomenda pendente
            </p>
            <p className="mt-1 text-xs text-[#78716c] dark:text-[#888]">
              Novos pedidos aparecem aqui para tratares na ficha da encomenda.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-3 py-2.5 dark:border-[#2a2a2a] dark:bg-[#111]">
              <div className="flex items-center gap-2">
                <span className="text-[#ea580c] dark:text-[#f97316]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-lg font-bold tabular-nums text-[#1c1917] dark:text-white">
                    {total}
                  </p>
                  <p className="text-[10px] text-[#78716c] dark:text-[#888]">
                    {total === 1 ? "encomenda" : "encomendas"} · Aguardando aceitação
                  </p>
                </div>
              </div>
              {legenda && (
                <p className="mt-2 text-[10px] leading-snug text-[#78716c] dark:text-[#888]">
                  {legenda}
                </p>
              )}
            </div>

            {destaque && (
              <Link
                href={`/encomendas/${destaque.id}`}
                className="block rounded-xl border border-[#e7e5e4] bg-white p-3 transition-shadow hover:shadow-md dark:border-[#333] dark:bg-[#0d0d0d]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1c1917] dark:text-white">
                      {destaque.cliente?.nome ?? `Encomenda #${destaque.id}`}
                    </p>
                    <p className="mt-0.5 text-xs text-[#78716c] dark:text-[#888]">
                      #{destaque.id}
                      {destaque.dataEntrega
                        ? ` · Entrega ${format(new Date(destaque.dataEntrega), "dd/MM/yyyy", { locale: pt })}`
                        : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-[#fafaf9] px-2 py-1 font-mono text-xs tabular-nums text-[#57534e] dark:bg-[#111] dark:text-[#a3a3a3]">
                    {tempoDesdeCriacao(destaque.dataCriacao, agora)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#ea580c] dark:text-[#f97316]">
                  Abrir encomenda →
                </p>
              </Link>
            )}

            {restantes.length > 0 ? (
              <ul className="divide-y divide-[#e7e5e4] rounded-xl border border-[#e7e5e4] dark:divide-[#222] dark:border-[#333]">
                {restantes.map((enc) => (
                  <li key={enc.id}>
                    <Link
                      href={`/encomendas/${enc.id}`}
                      className="block px-3 py-2 text-sm transition-colors hover:bg-[#fafaf9] dark:hover:bg-[#111]"
                    >
                      <span className="font-medium text-[#1c1917] dark:text-white">
                        {enc.cliente?.nome ?? `#${enc.id}`}
                      </span>
                      <span className="ml-1 text-xs text-[#78716c]">#{enc.id}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : total <= 1 ? (
              <p className="text-center text-xs text-[#78716c] dark:text-[#888]">
                Nenhuma outra encomenda pendente
              </p>
            ) : null}

            {total > lista.length && (
              <p className="text-center text-xs text-[#78716c] dark:text-[#888]">
                +{total - lista.length} outra{total - lista.length !== 1 ? "s" : ""} ·{" "}
                <Link href={verTodasHref} className="font-medium text-[#ea580c] hover:underline">
                  ver todas
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ card, index }: { card: CardStat; index: number }) {
  const trend =
    card.trendDelta != null && card.trendDelta !== 0
      ? card.trendDelta > 0
        ? "up"
        : "down"
      : null;

  const iconClass =
    card.variant === "danger"
      ? "text-red-600 dark:text-red-400"
      : card.variant === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : "text-[#ea580c] dark:text-[#f97316]";

  const ringClass =
    card.variant === "danger" && card.value > 0
      ? "ring-1 ring-red-200 dark:ring-red-900/50"
      : card.variant === "warning" && card.value > 0
        ? "ring-1 ring-amber-200 dark:ring-amber-900/50"
        : "";

  return (
    <motion.div variants={staggerItem} transition={{ ...transitionSmooth, delay: index * 0.05 }}>
      <Link
        href={card.href}
        className={`card-hover group flex flex-col p-4 ${dashboardPanelClass} ${ringClass} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(249,115,22,0.15)] dark:hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.4)]`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className={iconClass}>{card.icon}</span>
          {trend === "up" && (
            <span
              className="text-sm font-bold text-emerald-600 dark:text-emerald-400"
              title="Total superior ao de há 7 dias"
              aria-hidden
            >
              ▲
            </span>
          )}
          {trend === "down" && (
            <span
              className="text-sm font-bold text-red-500 dark:text-red-400"
              title="Total inferior ao de há 7 dias"
              aria-hidden
            >
              ▼
            </span>
          )}
        </div>
        <span className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-[#1c1917] dark:text-white">
          {card.value}
        </span>
        <span className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[#78716c] dark:text-[#888]">
          {card.title}
        </span>
      </Link>
    </motion.div>
  );
}
