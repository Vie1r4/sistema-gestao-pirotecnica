"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import {
  fetchTopClientes,
  type TopClienteLinha,
  type TopClientesResponse,
} from "@/app/lib/gestorAnalytics";
import AnalyticsCard, { AnalyticsSkeleton } from "./AnalyticsCard";

type TabId = "encomendas" | "servicos";

const TABS: { id: TabId; label: string; metrica: string }[] = [
  { id: "encomendas", label: "Encomendas", metrica: "n.º encomendas" },
  { id: "servicos", label: "Serviços", metrica: "n.º serviços" },
];

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function formatUltima(data?: string | null): string {
  if (!data) return "Sem encomendas";
  try {
    return format(parseISO(data), "d MMM yyyy", { locale: pt });
  } catch {
    return data;
  }
}

function RankBadge({ posicao }: { posicao: number }) {
  if (posicao === 1) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f97316] text-xs font-bold text-[#1c1917]">
        1
      </span>
    );
  }
  if (posicao === 2) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fdba74] text-xs font-bold text-[#1c1917]">
        2
      </span>
    );
  }
  if (posicao === 3) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fed7aa] text-xs font-bold text-[#78350f]">
        3
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5f5f4] text-xs font-semibold tabular-nums text-[#78716c] dark:bg-[#1a1a1a]">
      {posicao}
    </span>
  );
}

function ClienteDetalhe({ cliente, tab }: { cliente: TopClienteLinha; tab: TabId }) {
  const metricaLabel = tab === "encomendas" ? "Encomendas (ranking)" : "Serviços (ranking)";
  return (
    <div className="rounded-xl border border-[#f97316]/25 bg-gradient-to-br from-[#fff7ed] to-[#fafaf9] p-4 dark:border-[#f97316]/30 dark:from-[#1a1208] dark:to-[#0d0d0d]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f97316]/15 text-sm font-bold text-[#ea580c] dark:text-[#f97316]">
            {iniciais(cliente.nome)}
          </span>
          <div className="min-w-0">
            <Link
              href={`/clientes/${cliente.clienteId}`}
              className="text-base font-semibold text-[#1c1917] hover:text-[#ea580c] dark:text-white dark:hover:text-[#f97316]"
            >
              {cliente.nome}
            </Link>
            <p className="mt-0.5 text-xs text-[#78716c]">
              Última encomenda: {formatUltima(cliente.ultimaEncomenda)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {cliente.risco && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              Atenção: volume em queda
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white/80 px-3 py-2 dark:bg-[#111]/80">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#a8a29e]">
            {metricaLabel}
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-[#1c1917] dark:text-white">
            {cliente.valor}
          </p>
        </div>
        <div className="rounded-lg bg-white/80 px-3 py-2 dark:bg-[#111]/80">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#a8a29e]">
            Total encomendas
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-[#1c1917] dark:text-white">
            {cliente.totalEncomendas}
          </p>
        </div>
        <div className="rounded-lg bg-white/80 px-3 py-2 dark:bg-[#111]/80">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#a8a29e]">
            Total serviços
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-[#1c1917] dark:text-white">
            {cliente.totalServicos}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/clientes/${cliente.clienteId}`}
          className="rounded-lg bg-[#f97316] px-3 py-1.5 text-xs font-semibold text-[#1c1917] transition hover:bg-[#fb923c]"
        >
          Ver ficha do cliente
        </Link>
        <Link
          href="/encomendas"
          className="rounded-lg border border-[#e7e5e4] px-3 py-1.5 text-xs font-medium text-[#57534e] hover:bg-white dark:border-[#333] dark:hover:bg-[#111]"
        >
          Ver encomendas
        </Link>
      </div>
    </div>
  );
}

function ListaRanking({
  linhas,
  tab,
  selecionadoId,
  onSelecionar,
}: {
  linhas: TopClienteLinha[];
  tab: TabId;
  selecionadoId: number | null;
  onSelecionar: (id: number) => void;
}) {
  const maxVal = Math.max(1, ...linhas.map((l) => l.valor));

  if (linhas.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-[#78716c]">
        Sem clientes com actividade nesta métrica.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5" role="listbox" aria-label="Ranking de clientes">
      {linhas.map((linha, index) => {
        const posicao = index + 1;
        const activo = selecionadoId === linha.clienteId;
        const pct = maxVal > 0 ? (linha.valor / maxVal) * 100 : 0;

        return (
          <li key={linha.clienteId}>
            <button
              type="button"
              role="option"
              aria-selected={activo}
              onClick={() => onSelecionar(linha.clienteId)}
              className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                activo
                  ? "border-[#f97316]/50 bg-[#fff7ed] shadow-sm dark:border-[#f97316]/40 dark:bg-[#1a1208]"
                  : "border-transparent bg-[#fafaf9] hover:border-[#e7e5e4] hover:bg-white dark:bg-[#111]/40 dark:hover:border-[#333] dark:hover:bg-[#111]"
              }`}
            >
              <div className="flex items-center gap-3">
                <RankBadge posicao={posicao} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="truncate font-medium text-[#1c1917] dark:text-white">
                      {linha.nome}
                    </span>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-[#ea580c] dark:text-[#f97316]">
                      {linha.valor}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e7e5e4] dark:bg-[#262626]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#fb923c] to-[#f97316] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {linha.risco && (
                      <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                        Risco
                      </span>
                    )}
                    <span className="text-[10px] text-[#a8a29e]">
                      {formatUltima(linha.ultimaEncomenda)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function TopClientesBlock({
  token,
  layout = "wide",
}: {
  token: string;
  /** `column` — painel em meia largura do dashboard (ranking + detalhe lado a lado). */
  layout?: "wide" | "column";
}) {
  const emColuna = layout === "column";
  const [tab, setTab] = useState<TabId>("encomendas");
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null);

  const { data: real, isLoading, isError } = useQuery({
    queryKey: ["gestor-analytics", "top-clientes"],
    queryFn: () => fetchTopClientes(token, 10),
    staleTime: 120_000,
    enabled: !!token,
  });

  const data: TopClientesResponse | undefined = real;

  const linhas = useMemo(
    () => (tab === "encomendas" ? data?.porEncomendas : data?.porServicos) ?? [],
    [data, tab]
  );

  const selecionado = useMemo(() => {
    if (selecionadoId == null) return linhas[0] ?? null;
    return linhas.find((l) => l.clienteId === selecionadoId) ?? linhas[0] ?? null;
  }, [linhas, selecionadoId]);

  const handleTab = (id: TabId) => {
    setTab(id);
    setSelecionadoId(null);
  };

  return (
    <AnalyticsCard
      title="Melhores clientes"
      subtitle="Ranking por volume de encomendas ou serviços"
      compact={emColuna}
      className="h-full"
    >
      {isLoading ? (
        <AnalyticsSkeleton height={emColuna ? 260 : 320} />
      ) : isError ? (
        <p className="py-12 text-center text-sm text-[#78716c]">Sem dados de clientes.</p>
      ) : !data ? (
        <p className="py-12 text-center text-sm text-[#78716c]">Sem dados de clientes.</p>
      ) : (
        <div>
          <div className="mb-4 inline-flex rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-1 dark:border-[#2a2a2a] dark:bg-[#111]">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTab(t.id)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  tab === t.id
                    ? "bg-[#f97316] text-[#1c1917] shadow-sm"
                    : "text-[#57534e] hover:text-[#1c1917] dark:text-[#a3a3a3] dark:hover:text-white"
                }`}
              >
                {t.label}
                <span className="ml-1.5 tabular-nums opacity-80">
                  (
                  {t.id === "encomendas"
                    ? data.porEncomendas.length
                    : data.porServicos.length}
                  )
                </span>
              </button>
            ))}
          </div>

          <div
            className={`grid gap-4 ${emColuna ? "md:grid-cols-2" : "gap-5 lg:grid-cols-5"}`}
          >
            <div className={emColuna ? "min-w-0" : "lg:col-span-2"}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#a8a29e]">
                Top 10 · {TABS.find((t) => t.id === tab)?.metrica}
              </p>
              <ListaRanking
                linhas={linhas}
                tab={tab}
                selecionadoId={selecionado?.clienteId ?? null}
                onSelecionar={setSelecionadoId}
              />
            </div>
            <div className={emColuna ? "min-w-0" : "lg:col-span-3"}>
              {selecionado ? (
                <ClienteDetalhe cliente={selecionado} tab={tab} />
              ) : (
                <p className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-[#e7e5e4] text-sm text-[#78716c] dark:border-[#333]">
                  Selecciona um cliente na lista
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </AnalyticsCard>
  );
}
