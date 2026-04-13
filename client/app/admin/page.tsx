"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { getToken } from "@/app/lib/auth";
import { fetchAdminStats, fetchAdminLogs, type AdminStats } from "@/app/lib/admin";
import {
  AdminPageHeader,
  AdminCard,
  AdminSection,
  buildBreadcrumbs,
} from "@/app/admin/_components";
import { transitionSmooth, staggerContainer, staggerItem } from "@/app/lib/animations";

type StatItem = { key: keyof AdminStats; label: string; href: string; group: string };

const STATS: StatItem[] = [
  { key: "totalUtilizadores", label: "Utilizadores", href: "/admin/utilizadores", group: "Contas" },
  { key: "totalEncomendas", label: "Encomendas", href: "/encomendas", group: "Encomendas" },
  { key: "encomendasEsteMes", label: "Este mês", href: "/encomendas", group: "Encomendas" },
  { key: "totalServicos", label: "Serviços", href: "/servicos", group: "Serviços" },
  { key: "servicosEsteMes", label: "Este mês", href: "/servicos", group: "Serviços" },
  { key: "totalClientes", label: "Clientes", href: "/clientes", group: "Entidades" },
  { key: "totalFuncionarios", label: "Funcionários", href: "/funcionarios", group: "Entidades" },
  { key: "totalProdutos", label: "Produtos", href: "/produtos", group: "Armazém" },
  { key: "totalPaiois", label: "Paióis", href: "/armazem/gestao", group: "Armazém" },
  { key: "totalLogs", label: "Logs", href: "/admin/logs", group: "Sistema" },
];

const GROUPS_ORDER = ["Contas", "Encomendas", "Serviços", "Entidades", "Armazém", "Sistema"];

function groupStats(stats: StatItem[]) {
  const map = new Map<string, StatItem[]>();
  for (const s of stats) {
    const list = map.get(s.group) ?? [];
    list.push(s);
    map.set(s.group, list);
  }
  return GROUPS_ORDER.filter((g) => map.has(g)).map((g) => ({ group: g, items: map.get(g)! }));
}

export default function AdminDashboardPage() {
  const token = getToken();
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => fetchAdminStats(token!),
    enabled: !!token,
    staleTime: 60 * 1000,
  });
  const { data: logsData, isLoading: loadingLogs } = useQuery({
    queryKey: ["admin", "logs", 1],
    queryFn: () => fetchAdminLogs(token!, { pagina: 1, itensPorPagina: 10 }),
    enabled: !!token,
    staleTime: 30 * 1000,
  });
  const ultimosLogs = logsData?.items ?? [];
  const grouped = groupStats(STATS);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-10"
    >
      <AdminPageHeader
        title="Dashboard"
        description="Visão geral do sistema e atividade recente."
        breadcrumb={buildBreadcrumbs("/admin")}
      />

      {grouped.map(({ group, items }) => (
        <AdminSection
          key={group}
          title={group}
          description={`Métricas de ${group.toLowerCase()}.`}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {loadingStats
              ? items.map((_, i) => (
                  <div key={i} className="rounded-2xl border border-[#e7e5e4] bg-white p-4 dark:border-[#222] dark:bg-[#111]">
                    <div className="h-7 w-14 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                    <div className="mt-2 h-4 w-20 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                  </div>
                ))
              : items.map((item, i) => (
                  <motion.div
                    key={item.key}
                    variants={staggerItem}
                    transition={{ ...transitionSmooth, delay: i * 0.02 }}
                  >
                    <Link href={item.href} className="block">
                      <AdminCard>
                        <p className="text-2xl font-bold tabular-nums text-[#1c1917] dark:text-white">
                          {stats ? String(stats[item.key] ?? "—") : "—"}
                        </p>
                        <p className="mt-1 text-sm text-[#57534e] dark:text-[#888]">
                          {item.label}
                        </p>
                      </AdminCard>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </AdminSection>
      ))}

      <AdminSection
        title="Atividade recente"
        description="Últimas ações registadas no sistema."
        action={
          <Link
            href="/admin/logs"
            className="text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
          >
            Ver todos os logs →
          </Link>
        }
      >
        <AdminCard padding={false} className="overflow-hidden">
          {loadingLogs ? (
            <ul className="divide-y divide-[#e7e5e4] dark:divide-[#222]">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="flex items-center gap-4 px-5 py-4">
                  <span className="h-4 w-24 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                  <span className="h-4 flex-1 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                </li>
              ))}
            </ul>
          ) : ultimosLogs.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#78716c] dark:text-[#888]">
              Nenhum registo de atividade.
            </p>
          ) : (
            <ul className="divide-y divide-[#e7e5e4] dark:divide-[#222]">
              {ultimosLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm"
                >
                  <span className="tabular-nums text-[#78716c] dark:text-[#666]">
                    {log.timestamp
                      ? format(new Date(log.timestamp), "dd/MM/yyyy HH:mm", { locale: pt })
                      : "—"}
                  </span>
                  <span className="rounded bg-[#f1f5f9] px-2 py-0.5 font-medium text-[#475569] dark:bg-[#222] dark:text-[#94a3b8]">
                    {log.acao}
                  </span>
                  {log.userName && (
                    <span className="text-[#57534e] dark:text-[#a3a3a3]">{log.userName}</span>
                  )}
                  {log.jsonDados && (
                    <span
                      className="max-w-xs truncate text-xs text-[#a8a29e] dark:text-[#555]"
                      title={log.jsonDados}
                    >
                      {log.jsonDados}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </AdminSection>

      <AdminSection
        title="Ações rápidas"
        description="Acesso direto às áreas do sistema."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Utilizadores", href: "/admin/utilizadores" },
            { label: "Clientes", href: "/clientes" },
            { label: "Funcionários", href: "/funcionarios" },
            { label: "Encomendas", href: "/encomendas" },
            { label: "Serviços", href: "/servicos" },
            { label: "Armazém", href: "/armazem" },
            { label: "Produtos", href: "/produtos" },
            { label: "Logs do sistema", href: "/admin/logs" },
            { label: "Definições", href: "/admin/definicoes" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <AdminCard className="flex flex-row items-center justify-between">
                <span className="font-medium text-[#1c1917] dark:text-white">{item.label}</span>
                <span className="text-[#a8a29e] dark:text-[#555]">→</span>
              </AdminCard>
            </Link>
          ))}
        </div>
      </AdminSection>
    </motion.div>
  );
}
