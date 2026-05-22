"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { getToken } from "@/app/lib/auth";
import { fetchPrimeiroRegistoDisponivel } from "@/app/lib/authApi";
import { fetchAdminStats, fetchAdminLogs, type AdminStats } from "@/app/lib/admin";
import {
  AdminPageHeader,
  AdminCard,
  AdminSection,
  AdminEmptyState,
  AdminIcons,
  AdminSystemHealth,
  buildBreadcrumbs,
  logActionDotClass,
  adminTheme,
} from "@/app/admin/_components";
import {
  STAT_ACCENT_BG,
  STAT_ACCENT_TEXT,
  type StatAccent,
} from "@/app/admin/_components/adminTheme";
import { staggerContainer } from "@/app/lib/animations";

/** Pré-visualização no dashboard; lista completa em /admin/logs */
const RECENT_LOGS_LIMIT = 10;

const IcoUsers = AdminIcons.users;
const IcoBox = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h9.73a1.5 1.5 0 0 0 1.442-1.086l1.414-4.926a.75.75 0 0 0-.826-.95L10 2.5 3.105 2.288ZM4.25 10.75a.75.75 0 0 0 0 1.5h11.5a.75.75 0 0 0 0-1.5H4.25Z" />
  </svg>
);
const IcoLog = AdminIcons.logs;
const IcoPerson = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
  </svg>
);
const IcoWarehouse = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path fillRule="evenodd" d="M1 2.75A.75.75 0 0 1 1.75 2h16.5a.75.75 0 0 1 0 1.5H17v8.75A2.25 2.25 0 0 1 14.75 14.5H5.25A2.25 2.25 0 0 1 3 12.25V3.5H1.75A.75.75 0 0 1 1 2.75Z" clipRule="evenodd" />
  </svg>
);
const IcoCube = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M10 1a6 6 0 0 0-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 0 0 .572.729 6.016 6.016 0 0 0 2.856 0A.75.75 0 0 0 12 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0 0 10 1Z" />
  </svg>
);

type StatItem = {
  key: keyof AdminStats;
  label: string;
  href: string;
  icon: React.ReactNode;
  accent: StatAccent;
};

/** Cartão métrico horizontal (KPIs topo). */
const METRIC_CARD_SHELL =
  "flex h-full items-center gap-4 rounded-2xl border border-[#e7e5e4] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:border-[#222] dark:bg-[#111] dark:hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)]";

/** Totais de referência: altura automática, sem esticar à coluna dos atalhos. */
const REFERENCE_CARD_SHELL =
  "flex flex-row flex-nowrap items-center gap-3 rounded-2xl border border-[#e7e5e4] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:border-[#222] dark:bg-[#111] dark:hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)]";

const REFERENCE_STATS: StatItem[] = [
  { key: "totalEncomendas", label: "Encomendas", href: "/encomendas", icon: IcoBox, accent: "orange" },
  { key: "totalClientes", label: "Clientes", href: "/clientes", icon: IcoPerson, accent: "blue" },
  { key: "totalFuncionarios", label: "Funcionários", href: "/funcionarios", icon: IcoUsers, accent: "blue" },
  { key: "totalProdutos", label: "Produtos", href: "/produtos", icon: IcoCube, accent: "green" },
  { key: "totalPaiois", label: "Paióis", href: "/armazem/gestao", icon: IcoWarehouse, accent: "green" },
];

const QUICK_LINKS = [
  { href: "/admin/utilizadores", label: "Utilizadores", desc: "Roles e contas", icon: AdminIcons.users },
  { href: "/admin/logs", label: "Logs", desc: "Auditoria completa", icon: AdminIcons.logs },
  { href: "/admin/definicoes", label: "Definições", desc: "Backups e sistema", icon: AdminIcons.settings },
  { href: "/", label: "Operacional", desc: "Home / gestor", icon: AdminIcons.dashboard },
];

function AttentionCard({
  icon,
  label,
  value,
  href,
  urgent,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
  urgent: boolean;
  loading: boolean;
}) {
  return (
    <Link href={href} className="block h-full">
      <div
        className={`flex h-full items-center gap-4 rounded-2xl border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)] ${
          urgent
            ? "border-[#fed7aa] bg-[#fff7ed] dark:border-[#431407]/60 dark:bg-[#431407]/20"
            : "border-[#e7e5e4] bg-white dark:border-[#222] dark:bg-[#111]"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            urgent
              ? "bg-[#f97316]/10 text-[#ea580c] dark:text-[#fb923c]"
              : "bg-[#f1f5f9] text-[#475569] dark:bg-[#1e293b] dark:text-[#94a3b8]"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`text-2xl font-bold tabular-nums ${
              urgent ? "text-[#ea580c] dark:text-[#fb923c]" : "text-[#1c1917] dark:text-white"
            }`}
          >
            {loading ? (
              <span className="inline-block h-7 w-10 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
            ) : (
              value.toLocaleString("pt-PT")
            )}
          </p>
          <p className="truncate text-xs text-[#78716c] dark:text-[#888]">{label}</p>
        </div>
        {urgent && value > 0 && (
          <span className="shrink-0 rounded-full bg-[#f97316] px-2 py-0.5 text-xs font-semibold text-black">
            !
          </span>
        )}
      </div>
    </Link>
  );
}

function ReferenceMetricCard({
  icon,
  label,
  value,
  href,
  accent,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
  accent: StatAccent;
  loading: boolean;
}) {
  return (
    <Link
      href={href}
      className="block min-w-[10.5rem] flex-[1_1_10.5rem] self-start"
    >
      <div className={REFERENCE_CARD_SHELL}>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${STAT_ACCENT_BG[accent]} ${STAT_ACCENT_TEXT[accent]}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold leading-none tabular-nums text-[#1c1917] dark:text-white">
            {loading ? (
              <span className="inline-block h-7 w-10 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
            ) : (
              value.toLocaleString("pt-PT")
            )}
          </p>
          <p className="mt-1 text-xs leading-snug text-[#78716c] dark:text-[#888]">{label}</p>
        </div>
      </div>
    </Link>
  );
}

function ReferenceMetricCardSkeleton() {
  return (
    <div className={`${REFERENCE_CARD_SHELL} min-w-[10.5rem] flex-[1_1_10.5rem] self-start`} aria-hidden>
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-[#e7e5e4] dark:bg-[#333]" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-7 w-12 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
        <div className="h-4 w-20 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const token = getToken();

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => fetchAdminStats(token!),
    enabled: !!token,
    staleTime: 60_000,
  });

  const { data: primeiroRegistoDisponivel } = useQuery({
    queryKey: ["auth", "primeiro-registo"],
    queryFn: fetchPrimeiroRegistoDisponivel,
    staleTime: 120_000,
  });

  const { data: logsData, isLoading: loadingLogs } = useQuery({
    queryKey: ["admin", "logs", 1],
    queryFn: () => fetchAdminLogs(token!, { pagina: 1, itensPorPagina: RECENT_LOGS_LIMIT }),
    enabled: !!token,
    staleTime: 30_000,
  });

  const ultimosLogs = logsData?.items ?? [];
  const semEmail = stats?.utilizadoresSemEmailConfirmado ?? 0;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      <AdminPageHeader
        title="Dashboard"
        description="Visão geral do sistema PIROFAFE — contas, auditoria e totais de referência."
        breadcrumb={buildBreadcrumbs("/admin")}
      />

      {primeiroRegistoDisponivel === true && (
        <div className="rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 dark:border-[#1d4ed8]/50 dark:bg-[#1e3a5f]/30">
          <p className="text-sm text-[#1e40af] dark:text-[#93c5fd]">
            O <strong>primeiro registo</strong> de administrador está disponível — ainda não há contas no sistema.
          </p>
          <Link
            href="/registar-primeiro-utilizador"
            className="mt-2 inline-block text-sm font-semibold text-[#2563eb] hover:underline dark:text-[#60a5fa]"
          >
            Ir para registo do primeiro utilizador →
          </Link>
        </div>
      )}

      {/* Linha superior: 3 KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AttentionCard
          icon={AdminIcons.mail}
          label="Emails por confirmar"
          value={semEmail}
          href="/admin/utilizadores?filtro=email-pendente"
          urgent={semEmail > 0}
          loading={loadingStats}
        />
        <AttentionCard
          icon={IcoUsers}
          label="Contas no sistema"
          value={stats?.totalUtilizadores ?? 0}
          href="/admin/utilizadores"
          urgent={false}
          loading={loadingStats}
        />
        <AttentionCard
          icon={IcoLog}
          label="Registos de auditoria"
          value={stats?.totalLogs ?? 0}
          href="/admin/logs"
          urgent={false}
          loading={loadingStats}
        />
      </div>

      {/* Linha: Totais (2/3) | Atalhos (1/3) */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <AdminSection
          className="flex h-full flex-col lg:col-span-2"
          title="Totais de referência"
          description="Totais na base de dados — gestão nas respetivas áreas."
        >
          <div className="flex flex-wrap gap-3">
            {loadingStats
              ? REFERENCE_STATS.map((item) => (
                  <ReferenceMetricCardSkeleton key={item.key} />
                ))
              : REFERENCE_STATS.map((item) => (
                  <ReferenceMetricCard
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    value={stats ? (stats[item.key] as number) : 0}
                    href={item.href}
                    accent={item.accent}
                    loading={loadingStats}
                  />
                ))}
          </div>
        </AdminSection>

        <AdminSection
          className="flex h-full flex-col lg:col-span-1"
          title="Atalhos"
          description="Secções do painel e aplicação principal."
        >
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`group ${adminTheme.card} flex flex-col p-4 transition-all hover:border-[#f97316]/40 dark:hover:border-[#f97316]/30`}
              >
                <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#475569] dark:bg-[#1e293b] dark:text-[#94a3b8]">
                  {link.icon}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-[#1c1917] group-hover:text-[#ea580c] dark:text-white dark:group-hover:text-[#f97316]">
                  {AdminIcons.link}
                  {link.label}
                </span>
                <p className="mt-1 text-xs text-[#78716c] dark:text-[#666]">{link.desc}</p>
              </Link>
            ))}
          </div>
        </AdminSection>
      </div>

      {/* Linha: Atividade (2/3) | Estado (1/3) — mesma altura */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <AdminSection
          className="flex h-full flex-col lg:col-span-2"
          title="Atividade recente"
          description="Pré-visualização — lista completa em Logs do sistema."
          action={
            <Link
              href="/admin/logs"
              className="shrink-0 text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
            >
              Ver todos os logs →
            </Link>
          }
        >
          <AdminCard padding={false} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {loadingLogs ? (
              <ul className="divide-y divide-[#f0eeec] dark:divide-[#1a1a1a]">
                {Array.from({ length: RECENT_LOGS_LIMIT }).map((_, i) => (
                  <li key={i} className="flex h-7 shrink-0 items-center gap-2 px-3 text-xs">
                    <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#e7e5e4] dark:bg-[#333]" />
                    <span className="h-3 flex-1 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                  </li>
                ))}
              </ul>
            ) : ultimosLogs.length === 0 ? (
              <div className="flex flex-1 items-center justify-center px-4 py-8">
                <AdminEmptyState
                  title="Sem atividade recente"
                  description="As ações dos utilizadores aparecerão aqui."
                  actionHref="/admin/logs"
                  actionLabel="Abrir auditoria"
                />
              </div>
            ) : (
              <ul className="flex flex-1 flex-col divide-y divide-[#f0eeec] dark:divide-[#1a1a1a]">
                {ultimosLogs.map((log, idx) => (
                  <li
                    key={log.id > 0 ? log.id : `${log.timestamp}-${idx}`}
                    className="flex h-7 shrink-0 items-center gap-2 px-3 text-xs"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${logActionDotClass(log.acao)}`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate font-mono font-medium text-[#1c1917] dark:text-white">
                      {log.acao}
                    </span>
                    {log.userName && (
                      <span className="hidden max-w-[7rem] truncate text-[#78716c] sm:inline dark:text-[#666]">
                        {log.userName}
                      </span>
                    )}
                    <span className="shrink-0 tabular-nums text-[#a8a29e] dark:text-[#555]">
                      {log.timestamp ? format(parseISO(log.timestamp), "HH:mm") : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </AdminSection>

        <AdminSection
          className="flex h-full flex-col lg:col-span-1"
          title="Estado do sistema"
          description="Ligação à API e base de dados."
        >
          <AdminSystemHealth className="flex min-h-0 flex-1 flex-col" />
        </AdminSection>
      </div>
    </motion.div>
  );
}
