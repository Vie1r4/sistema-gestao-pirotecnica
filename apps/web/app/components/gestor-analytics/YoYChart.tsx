"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { fetchClientes } from "@/app/lib/clientes";
import {
  fetchComparacaoAnual,
  type ComparacaoAnualResponse,
  type FiltroOpcao,
} from "@/app/lib/gestorAnalytics";
import { fetchList as fetchProdutosList } from "@/app/lib/produtosApi";
import AnalyticsCard, { AnalyticsSkeleton } from "./AnalyticsCard";
import {
  anosSelecionadosIniciais,
  buildYoYChartRows,
  corParaAno,
  type YoYChartRow,
} from "./yoYChartData";

const CHART_HEIGHT_DEFAULT = 420;
const CHART_HEIGHT_COMPACT = 280;

const FILTRO_QUERY_OPTS = {
  staleTime: 0,
  refetchOnWindowFocus: true,
  refetchOnMount: "always" as const,
};

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
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

function YoYTooltip({
  active,
  payload,
  label,
  unidades,
}: {
  active?: boolean;
  payload?: { dataKey?: string; value?: number | null; color?: string; name?: string }[];
  label?: string;
  unidades: boolean;
}) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload as YoYChartRow | undefined;
  if (!row) return null;

  const un = unidades ? " un." : " enc.";
  const entradas = payload
    .filter((p) => p.dataKey?.startsWith("y") && p.value != null)
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));

  return (
    <div className="max-h-72 max-w-xs overflow-y-auto rounded-xl border border-[#e7e5e4] bg-white p-3 text-xs shadow-lg dark:border-[#333] dark:bg-[#111]">
      <p className="font-semibold text-[#1c1917] dark:text-white">{label}</p>
      <div className="mt-2 space-y-3">
        {entradas.map((p) => {
          const ano = Number(String(p.dataKey).slice(1));
          const encs = row.detalhes[ano] ?? [];
          return (
            <div key={String(p.dataKey)}>
              <p className="font-medium" style={{ color: p.color }}>
                {p.name}: <strong>{p.value}</strong>
                {un}
              </p>
              {encs.length > 0 && (
                <ul className="mt-1 space-y-1 border-l-2 pl-2" style={{ borderColor: p.color }}>
                  {encs.slice(0, 8).map((e) => (
                    <li key={e.encomendaId} className="text-[#57534e] dark:text-[#a3a3a3]">
                      <Link
                        href={`/encomendas/${e.encomendaId}`}
                        className="font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
                      >
                        #{e.encomendaId}
                      </Link>
                      {" · "}
                      {e.clienteNome}
                      {e.produtoPrincipal ? ` · ${e.produtoPrincipal}` : ""}
                      <span className="block text-[10px] opacity-80">{formatData(e.dataCriacao)}</span>
                    </li>
                  ))}
                  {encs.length > 8 && (
                    <li className="text-[10px] text-[#a8a29e]">+{encs.length - 8} encomendas</li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function YoYChart({
  token,
  compact = false,
}: {
  token: string;
  compact?: boolean;
}) {
  const chartHeight = compact ? CHART_HEIGHT_COMPACT : CHART_HEIGHT_DEFAULT;
  const [materialId, setMaterialId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [anosSelecionados, setAnosSelecionados] = useState<number[]>([]);

  const produtoId = materialId ? Number(materialId) : undefined;
  const clienteIdNum = clienteId ? Number(clienteId) : undefined;

  const { data: real, isLoading, isFetching, isError } = useQuery({
    queryKey: ["gestor-analytics", "comparacao-anual", produtoId, clienteIdNum],
    queryFn: () =>
      fetchComparacaoAnual(token, {
        produtoId,
        clienteId: clienteIdNum,
      }),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    enabled: !!token,
  });

  const { data: produtosCatalogo } = useQuery({
    queryKey: ["gestor-analytics", "yoy-filtro-produtos"],
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
    enabled: !!token,
  });

  const { data: clientesCatalogo } = useQuery({
    queryKey: ["gestor-analytics", "yoy-filtro-clientes"],
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
    enabled: !!token,
  });

  const data = useMemo((): ComparacaoAnualResponse | undefined => real, [real]);

  useEffect(() => {
    if (!data?.anosDisponiveis?.length) return;
    setAnosSelecionados((prev) => {
      const validos = prev.filter((a) => data.anosDisponiveis.includes(a));
      if (validos.length > 0) return validos;
      return anosSelecionadosIniciais(data.anosDisponiveis);
    });
  }, [data?.anosDisponiveis]);

  const anosVisiveis = useMemo(
    () =>
      [...anosSelecionados]
        .filter((a) => data?.anosDisponiveis.includes(a))
        .sort((a, b) => a - b),
    [anosSelecionados, data?.anosDisponiveis]
  );

  const chartData = useMemo(
    () => buildYoYChartRows(data, anosVisiveis),
    [data, anosVisiveis]
  );

  const chartBusy = isLoading || (isFetching && !real);
  const anoAtual = data?.anoAtual ?? new Date().getFullYear();

  const materiaisOpcoes = useMemo(
    (): FiltroOpcao[] => mergeFiltroOpcoes(data?.materiais, produtosCatalogo),
    [data?.materiais, produtosCatalogo]
  );

  const clientesOpcoes = useMemo(
    (): FiltroOpcao[] => mergeFiltroOpcoes(data?.clientes, clientesCatalogo),
    [data?.clientes, clientesCatalogo]
  );

  const filtroMaterial = materiaisOpcoes.find((m) => String(m.id) === materialId);
  const filtroCliente = clientesOpcoes.find((c) => String(c.id) === clienteId);
  const unidades = !!produtoId;

  const subtitulo = useMemo(
    () =>
      [
        "Jan – Dez",
        anosVisiveis.length > 0 ? anosVisiveis.join(" · ") : "—",
        unidades ? "unidades do material" : "n.º encomendas",
      ].join(" · "),
    [anosVisiveis, unidades]
  );

  const toggleAno = (ano: number) => {
    setAnosSelecionados((prev) => {
      if (prev.includes(ano)) {
        if (prev.length <= 1) return prev;
        return prev.filter((a) => a !== ano);
      }
      return [...prev, ano].sort((a, b) => a - b);
    });
  };

  const selectClass =
    "w-full min-w-0 rounded-lg border border-[#e7e5e4] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1c1917] dark:border-[#333] dark:bg-[#0d0d0d] dark:text-white";

  return (
    <AnalyticsCard
      title="Comparação anual"
      subtitle={subtitulo}
      compact={compact}
    >
      <div className="-mt-1 mb-3 space-y-2.5 border-b border-[#e7e5e4]/80 pb-3 dark:border-[#2a2a2a]">
        {(filtroMaterial || filtroCliente) && (
          <div className="flex flex-wrap gap-1.5">
            {filtroMaterial && (
              <span className="inline-flex max-w-full items-center truncate rounded-full bg-[#fff7ed] px-2.5 py-0.5 text-[10px] font-medium text-[#c2410c] dark:bg-[#1c1008] dark:text-[#fb923c]">
                {filtroMaterial.nome}
              </span>
            )}
            {filtroCliente && (
              <span className="inline-flex max-w-full items-center truncate rounded-full bg-[#f5f5f4] px-2.5 py-0.5 text-[10px] font-medium text-[#57534e] dark:bg-[#1a1a1a] dark:text-[#a3a3a3]">
                {filtroCliente.nome}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#a8a29e]">
              Anos a comparar
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(data?.anosDisponiveis ?? []).map((ano, idx) => {
                const activo = anosVisiveis.includes(ano);
                const cor = corParaAno(ano, anoAtual, idx);
                return (
                  <button
                    key={ano}
                    type="button"
                    onClick={() => toggleAno(ano)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      activo
                        ? "border-transparent text-[#1c1917] shadow-sm dark:text-white"
                        : "border-[#e7e5e4] bg-transparent text-[#78716c] opacity-60 hover:opacity-100 dark:border-[#333] dark:text-[#888]"
                    }`}
                    style={activo ? { backgroundColor: `${cor}22`, borderColor: cor, color: cor } : undefined}
                    aria-pressed={activo}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: activo ? cor : "#d6d3d1" }}
                    />
                    {ano}
                    {ano === anoAtual && (
                      <span className="text-[9px] font-normal opacity-75">(actual)</span>
                    )}
                  </button>
                );
              })}
              {!chartBusy && (data?.anosDisponiveis?.length ?? 0) === 0 && (
                <span className="text-xs text-[#78716c]">Sem encomendas registadas.</span>
              )}
            </div>
          </div>

          <div className="grid w-full shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:min-w-[22rem] lg:max-w-md">
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
            <label className="min-w-0">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#a8a29e]">
                Cliente
              </span>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className={selectClass}
              >
                <option value="">Todos os clientes</option>
                {clientesOpcoes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {chartBusy ? (
        <AnalyticsSkeleton height={chartHeight + 48} />
      ) : isError ? (
        <p className="py-12 text-center text-sm text-[#78716c]">Sem dados.</p>
      ) : chartData.length === 0 ? (
        <p className="py-12 text-center text-sm text-[#78716c]">
          Seleccione pelo menos um ano com dados.
        </p>
      ) : (
        <div className="rounded-xl border border-[#e7e5e4]/50 bg-[#fafaf9]/30 p-1 pt-2 dark:border-[#2a2a2a] dark:bg-[#111]/20">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chartData} margin={{ top: 16, right: 16, left: 4, bottom: 8 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-[#e7e5e4] dark:stroke-[#333]"
                vertical={false}
              />
              <XAxis
                dataKey="rotulo"
                tick={{ fontSize: 10, fill: "#a8a29e" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#a8a29e" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<YoYTooltip unidades={unidades} />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="plainline"
                wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
              />
              {anosVisiveis.map((ano, idx) => {
                const cor = corParaAno(ano, anoAtual, idx);
                const actual = ano === anoAtual;
                return (
                  <Line
                    key={ano}
                    type="monotone"
                    dataKey={`y${ano}`}
                    name={String(ano)}
                    stroke={cor}
                    strokeWidth={actual ? 2.5 : 2}
                    strokeDasharray={actual ? undefined : "6 4"}
                    dot={false}
                    connectNulls={false}
                    activeDot={{ r: 4, fill: cor }}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </AnalyticsCard>
  );
}
