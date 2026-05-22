"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, subDays } from "date-fns";
import { pt } from "date-fns/locale";
import { fetchClientes } from "@/app/lib/clientes";
import {
  fetchConsumoCliente,
  type ConsumoClienteResponse,
  type FiltroOpcao,
} from "@/app/lib/gestorAnalytics";
import { buildDemoConsumoCliente } from "@/app/lib/gestorAnalyticsDemo";
import { fetchList as fetchProdutosList } from "@/app/lib/produtosApi";
import { useGestorDemo } from "./GestorDemoProvider";
import AnalyticsCard, { AnalyticsSkeleton } from "./AnalyticsCard";

const FILTRO_QUERY_OPTS = {
  staleTime: 0,
  refetchOnWindowFocus: true,
  refetchOnMount: "always" as const,
};

function toInputDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function mergeFiltroOpcoes(
  ...listas: (FiltroOpcao[] | undefined)[]
): FiltroOpcao[] {
  const porId = new Map<number, string>();
  for (const lista of listas) {
    for (const item of lista ?? []) {
      if (item.id > 0 && item.nome.trim()) {
        porId.set(item.id, item.nome.trim());
      }
    }
  }
  return Array.from(porId, ([id, nome]) => ({ id, nome })).sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt")
  );
}

function formatData(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy, HH:mm", { locale: pt });
  } catch {
    return iso;
  }
}

function formatIntervalo(desde: string, ate: string): string {
  try {
    const a = format(parseISO(desde), "d MMM yyyy", { locale: pt });
    const b = format(parseISO(ate), "d MMM yyyy", { locale: pt });
    return `${a} – ${b}`;
  } catch {
    return `${desde} – ${ate}`;
  }
}

function formatQty(q: number): string {
  return Number.isInteger(q) ? String(q) : q.toFixed(2);
}

/** Defaults: últimos 30 dias (exemplo Abril 2025 disponível no modo demo). */
function defaultDesde(): string {
  return toInputDate(subDays(new Date(), 30));
}

function defaultAte(): string {
  return toInputDate(new Date());
}

export default function ClienteConsumoList({
  token,
  compact = false,
  filtersOnly = false,
}: {
  token: string;
  compact?: boolean;
  /** Painel lateral: só filtros + texto de ajuda (sem tabela). */
  filtersOnly?: boolean;
}) {
  const { demoMode } = useGestorDemo();
  const [desde, setDesde] = useState(defaultDesde);
  const [ate, setAte] = useState(defaultAte);
  const [materialId, setMaterialId] = useState("");
  const [clienteId, setClienteId] = useState("");

  const clienteIdNum = clienteId ? Number(clienteId) : 0;
  const produtoId = materialId ? Number(materialId) : undefined;
  const intervaloValido = desde && ate && desde <= ate;

  const { data: real, isLoading, isError, isFetching } = useQuery({
    queryKey: [
      "gestor-analytics",
      "consumo-cliente",
      clienteIdNum,
      desde,
      ate,
      produtoId,
    ],
    queryFn: () =>
      fetchConsumoCliente(token, {
        clienteId: clienteIdNum,
        desde,
        ate,
        produtoId,
      }),
    staleTime: 30_000,
    enabled: !!token && !demoMode && clienteIdNum > 0 && intervaloValido,
  });

  const { data: produtosCatalogo } = useQuery({
    queryKey: ["gestor-analytics", "consumo-filtro-produtos"],
    queryFn: async () => {
      const res = await fetchProdutosList(token);
      return (res.items ?? [])
        .map((p) => ({
          id: Number(p.id ?? p.Id),
          nome: String(p.nome ?? p.Nome ?? "").trim(),
        }))
        .filter((p) => p.id > 0 && p.nome) as FiltroOpcao[];
    },
    ...FILTRO_QUERY_OPTS,
    enabled: !!token && !demoMode,
  });

  const { data: clientesCatalogo } = useQuery({
    queryKey: ["gestor-analytics", "consumo-filtro-clientes"],
    queryFn: async () => {
      const res = await fetchClientes(token);
      return (res.items ?? [])
        .map((c) => ({
          id: Number(c.id),
          nome: String(c.nome ?? "").trim(),
        }))
        .filter((c) => c.id > 0 && c.nome) as FiltroOpcao[];
    },
    ...FILTRO_QUERY_OPTS,
    enabled: !!token && !demoMode,
  });

  const data = useMemo((): ConsumoClienteResponse | undefined => {
    if (demoMode && clienteIdNum > 0 && intervaloValido) {
      return buildDemoConsumoCliente(clienteIdNum, desde, ate, produtoId);
    }
    return real;
  }, [demoMode, real, clienteIdNum, desde, ate, produtoId, intervaloValido]);

  const demoFiltros = useMemo(
    () =>
      demoMode
        ? buildDemoConsumoCliente(1, "2025-04-15", "2025-04-20")
        : null,
    [demoMode]
  );

  const materiaisOpcoes = useMemo((): FiltroOpcao[] => {
    if (demoFiltros) return demoFiltros.materiais;
    return mergeFiltroOpcoes(data?.materiais, produtosCatalogo);
  }, [demoFiltros, data?.materiais, produtosCatalogo]);

  const clientesOpcoes = useMemo((): FiltroOpcao[] => {
    if (demoFiltros) return demoFiltros.clientes;
    return mergeFiltroOpcoes(data?.clientes, clientesCatalogo);
  }, [demoFiltros, data?.clientes, clientesCatalogo]);

  const clienteNome =
    clientesOpcoes.find((c) => String(c.id) === clienteId)?.nome ??
    data?.clienteNome ??
    "";

  const selectClass =
    "w-full min-w-0 rounded-lg border border-[#e7e5e4] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1c1917] dark:border-[#333] dark:bg-[#0d0d0d] dark:text-white";

  const dateClass =
    "w-full min-w-0 rounded-lg border border-[#e7e5e4] bg-white px-2.5 py-1.5 text-sm text-[#1c1917] dark:border-[#333] dark:bg-[#0d0d0d] dark:text-white [color-scheme:light] dark:[color-scheme:dark]";

  const showResults = clienteIdNum > 0 && intervaloValido;
  const busy = showResults && !demoMode && (isLoading || isFetching);

  const intervaloLabel = formatIntervalo(
    data?.desde ?? desde,
    data?.ate ?? ate
  );

  return (
    <AnalyticsCard
      title="O que o cliente levou"
      subtitle={
        compact
          ? "Intervalo, material e cliente"
          : "Escolhe o intervalo no calendário (ex.: 15 abr – 20 abr 2025), material e cliente"
      }
      compact={compact}
      className={`h-full ${demoMode ? "border-dashed border-[#f97316]/40" : ""}`}
      action={
        isFetching && !isLoading && !demoMode && showResults ? (
          <span className="text-xs text-[#78716c]">A atualizar…</span>
        ) : null
      }
    >
      <div
        className={`mb-3 grid gap-2 ${
          filtersOnly
            ? "grid-cols-1"
            : compact
              ? "grid-cols-2"
              : "gap-3 sm:grid-cols-2 lg:grid-cols-5"
        }`}
      >
        <label className="min-w-0">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#a8a29e]">
            De
          </span>
          <input
            type="date"
            value={desde}
            max={ate || undefined}
            onChange={(e) => setDesde(e.target.value)}
            className={dateClass}
            aria-label="Data inicial"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#a8a29e]">
            Até
          </span>
          <input
            type="date"
            value={ate}
            min={desde || undefined}
            onChange={(e) => setAte(e.target.value)}
            className={dateClass}
            aria-label="Data final"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#a8a29e]">
            Material
          </span>
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            className={selectClass}
          >
            <option value="">Todos os materiais</option>
            {materiaisOpcoes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </label>
        <label
          className={`min-w-0 ${!filtersOnly && (compact ? "col-span-2" : "sm:col-span-2 lg:col-span-2")}`}
        >
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#a8a29e]">
            Cliente
          </span>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className={selectClass}
            required
          >
            <option value="">Selecionar cliente…</option>
            {clientesOpcoes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!intervaloValido ? (
        <p className={`text-center text-sm text-amber-700 dark:text-amber-400 ${compact ? "py-6" : "py-10"}`}>
          A data «Até» deve ser igual ou posterior à data «De».
        </p>
      ) : !showResults || filtersOnly ? (
        <p
          className={`text-center text-sm italic text-[#78716c] ${compact || filtersOnly ? "py-8" : "py-10"}`}
        >
          Escolhe o intervalo no calendário e um cliente para ver o que encomendou.
        </p>
      ) : busy ? (
        <AnalyticsSkeleton height={compact ? 160 : 220} />
      ) : !demoMode && isError ? (
        <p className={`text-center text-sm text-[#78716c] ${compact ? "py-6" : "py-10"}`}>
          Não foi possível carregar os dados.
        </p>
      ) : !data?.linhas.length ? (
        <p className={`text-center text-sm text-[#78716c] ${compact ? "py-6" : "py-10"}`}>
          Sem linhas para{" "}
          <strong className="text-[#1c1917] dark:text-white">{clienteNome}</strong>{" "}
          entre <strong>{intervaloLabel}</strong>
          {produtoId ? " com o material seleccionado" : ""}.
        </p>
      ) : (
        <div className={demoMode ? "opacity-90" : ""}>
          <div
            className={`mb-3 flex flex-wrap gap-2 rounded-xl bg-[#fafaf9] text-sm dark:bg-[#111] ${compact ? "px-3 py-2 text-xs" : "mb-4 gap-3 px-4 py-3"}`}
          >
            <span>
              <strong className="text-[#1c1917] dark:text-white">{clienteNome}</strong>
            </span>
            <span className="text-[#78716c]">·</span>
            <span className="text-[#57534e] dark:text-[#a3a3a3]">{intervaloLabel}</span>
            <span className="text-[#78716c]">·</span>
            <span>
              {formatQty(data.totalQuantidade)} un. em {data.totalEncomendas} encomenda
              {data.totalEncomendas !== 1 ? "s" : ""}
            </span>
            <span className="text-[#78716c]">·</span>
            <span>{data.totalLinhas} linha{data.totalLinhas !== 1 ? "s" : ""}</span>
          </div>
          <div
            className={`overflow-auto rounded-xl border border-[#e7e5e4] dark:border-[#2a2a2a] ${compact ? "max-h-[280px]" : "max-h-[420px]"}`}
          >
            <table
              className={`w-full text-left ${compact ? "min-w-[480px] text-xs" : "min-w-[640px] text-sm"}`}
            >
              <thead className="sticky top-0 z-10 bg-[#fafaf9] dark:bg-[#111]">
                <tr className="border-b border-[#e7e5e4] text-xs uppercase text-[#78716c] dark:border-[#222]">
                  <th className="px-3 py-2.5">Data</th>
                  <th className="px-3 py-2.5">Encomenda</th>
                  <th className="px-3 py-2.5">Material</th>
                  <th className="px-3 py-2.5 text-right">Quantidade</th>
                  <th className="px-3 py-2.5">Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.linhas.map((linha, i) => (
                  <tr
                    key={`${linha.encomendaId}-${linha.produtoId}-${i}`}
                    className="border-b border-[#e7e5e4]/80 last:border-0 dark:border-[#222]"
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 text-[#57534e] dark:text-[#a3a3a3]">
                      {formatData(linha.dataCriacao)}
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/encomendas/${linha.encomendaId}`}
                        className="font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
                      >
                        #{linha.encomendaId}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-[#1c1917] dark:text-white">
                      {linha.produtoNome}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                      {formatQty(linha.quantidade)}
                    </td>
                    <td className="px-3 py-2.5 text-[#57534e] dark:text-[#a3a3a3]">
                      {linha.estado}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AnalyticsCard>
  );
}
