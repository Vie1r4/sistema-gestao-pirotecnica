"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchVolume, type VolumePeriodo } from "@/app/lib/gestorAnalytics";
import { buildDemoVolume } from "@/app/lib/gestorAnalyticsDemo";
import { useGestorDemo } from "./GestorDemoProvider";
import AnalyticsCard, { AnalyticsSkeleton } from "./AnalyticsCard";
import { buildVolumeXAxisConfig } from "./volumeChartAxis";
import {
  prepareVolumeChartData,
  type VolumeChartPoint,
} from "./volumeChartSeries";
import { useChartCtrlWheelZoneRef } from "./chartCtrlWheelZone";

type AgrupamentoVolume = "dia" | "semana" | "mes" | "ano";
type PeriodoVolumeId = "7" | "30" | "90" | "180" | "365" | "730" | "1095";

/** Ordem da barra de filtros: mais curto → mais longo (índice 0 = 7d). */
const periodosValidos = ["7d", "30d", "90d", "6m", "1a", "2a", "3a"] as const;

type PeriodoPreset = {
  id: PeriodoVolumeId;
  label: (typeof periodosValidos)[number];
  dias: number;
  agrupamento: AgrupamentoVolume;
  descricao: string;
};

const PERIODOS_VOLUME: PeriodoPreset[] = [
  { id: "7", label: "7d", dias: 7, agrupamento: "dia", descricao: "última semana" },
  { id: "30", label: "30d", dias: 30, agrupamento: "semana", descricao: "último mês" },
  { id: "90", label: "90d", dias: 90, agrupamento: "semana", descricao: "último trimestre" },
  { id: "180", label: "6m", dias: 180, agrupamento: "mes", descricao: "último semestre" },
  { id: "365", label: "1a", dias: 365, agrupamento: "mes", descricao: "último ano" },
  { id: "730", label: "2a", dias: 730, agrupamento: "mes", descricao: "últimos 2 anos" },
  { id: "1095", label: "3a", dias: 1095, agrupamento: "ano", descricao: "últimos 3 anos" },
];

const PERIODO_LABEL_LONGO: Record<PeriodoVolumeId, string> = {
  "7": "7 dias",
  "30": "30 dias",
  "90": "90 dias",
  "180": "6 meses",
  "365": "12 meses",
  "730": "2 anos",
  "1095": "3 anos",
};

const LABEL_AGRUPAMENTO: Record<AgrupamentoVolume, string> = {
  ano: "por ano",
  mes: "por mês",
  semana: "por semana",
  dia: "por dia",
};

function periodoPorId(id: PeriodoVolumeId): PeriodoPreset {
  return PERIODOS_VOLUME.find((p) => p.id === id) ?? PERIODOS_VOLUME[1];
}

function indicePeriodo(id: PeriodoVolumeId): number {
  return PERIODOS_VOLUME.findIndex((p) => p.id === id);
}

const PERIODO_INICIAL = PERIODOS_VOLUME[1];

const TICK = "#a8a29e";
const GRID = "#ebe8e3";
const FADE_MS = 220;

function VolumeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: VolumeChartPoint }[];
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-[#e7e5e4]/90 bg-white/95 px-3 py-2.5 text-xs shadow-lg ring-1 ring-black/5 backdrop-blur-sm dark:border-[#333] dark:bg-[#141414]/95 dark:ring-white/5">
      <p className="text-[11px] font-medium text-[#78716c] dark:text-[#a3a3a3]">{p.tooltipTitulo}</p>
      <p className="mt-0.5 text-base font-bold tabular-nums text-[#1c1917] dark:text-white">
        {p.total} encomenda{p.total !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

function StatChip({
  label,
  value,
  hint,
  accent,
  dense = false,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: boolean;
  dense?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border ${
        dense ? "px-2.5 py-2" : "px-4 py-3"
      } ${
        accent
          ? "border-[#fed7aa]/80 bg-gradient-to-br from-[#fff7ed] to-white dark:border-[#7c2d12]/40 dark:from-[#1c1008] dark:to-[#0d0d0d]"
          : "border-[#e7e5e4]/70 bg-[#fafaf9]/80 dark:border-[#2a2a2a] dark:bg-[#111]/80"
      }`}
    >
      <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-[#a8a29e]">
        {label}
      </p>
      <p
        className={`mt-0.5 font-bold tabular-nums tracking-tight text-[#1c1917] dark:text-white ${
          dense ? "text-lg" : "text-xl"
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 truncate text-[10px] text-[#78716c] sm:text-[11px]">{hint}</p>}
    </div>
  );
}

/** `panel` = coluna 2/3 do dashboard (linha de análise). */
export default function VolumeChart({
  token,
  layout = "default",
  compact = false,
}: {
  token: string;
  layout?: "default" | "panel";
  /** @deprecated Usa `layout="panel"`. */
  compact?: boolean;
}) {
  const emPainel = layout === "panel" || compact;
  const gradientId = useId().replace(/:/g, "");
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { demoMode } = useGestorDemo();

  const [periodId, setPeriodId] = useState<PeriodoVolumeId>(PERIODO_INICIAL.id);
  const [agrupamentoAtual, setAgrupamentoAtual] = useState<AgrupamentoVolume>(
    PERIODO_INICIAL.agrupamento
  );
  const [chartOpaque, setChartOpaque] = useState(true);

  const periodo = periodoPorId(periodId);

  const viewRef = useRef({ periodId, agrupamento: agrupamentoAtual });
  viewRef.current = { periodId, agrupamento: agrupamentoAtual };

  const applyPeriodoEAgrupamento = useCallback(
    (id: PeriodoVolumeId, agrupamento: AgrupamentoVolume, animate = true) => {
      const current = viewRef.current;
      if (current.periodId === id && current.agrupamento === agrupamento) return;

      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

      const apply = () => {
        setPeriodId(id);
        setAgrupamentoAtual(agrupamento);
        setChartOpaque(true);
      };

      if (!animate) {
        apply();
        return;
      }

      setChartOpaque(false);
      fadeTimerRef.current = setTimeout(apply, FADE_MS);
    },
    []
  );

  const selectPeriodo = useCallback(
    (id: PeriodoVolumeId) => {
      const preset = periodoPorId(id);
      applyPeriodoEAgrupamento(preset.id, preset.agrupamento, true);
    },
    [applyPeriodoEAgrupamento]
  );

  const chartZoneRef = useChartCtrlWheelZoneRef((zoomIn) => {
    const idx = indicePeriodo(viewRef.current.periodId);
    if (idx < 0) return;
    const nextIdx = zoomIn
      ? Math.max(0, idx - 1)
      : Math.min(PERIODOS_VOLUME.length - 1, idx + 1);
    if (nextIdx === idx) return;
    const preset = PERIODOS_VOLUME[nextIdx];
    applyPeriodoEAgrupamento(preset.id, preset.agrupamento, true);
  });

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const periodoLabelLongo = PERIODO_LABEL_LONGO[periodId];

  const { data: real, isLoading, isError } = useQuery({
    queryKey: ["gestor-analytics", "volume", agrupamentoAtual, periodo.dias],
    queryFn: () => fetchVolume(token, agrupamentoAtual, periodo.dias),
    staleTime: 60_000,
    enabled: !!token && !demoMode,
  });

  const apiPeriodos: VolumePeriodo[] | undefined = demoMode
    ? buildDemoVolume(agrupamentoAtual, periodo.dias).periodos
    : real?.periodos;

  const { points: chartData, range } = useMemo(
    () => prepareVolumeChartData(apiPeriodos, periodo.dias, agrupamentoAtual),
    [apiPeriodos, periodo.dias, agrupamentoAtual]
  );

  const xAxis = useMemo(
    () =>
      buildVolumeXAxisConfig(
        range,
        agrupamentoAtual,
        chartData.map((d) => d.ms),
        periodo.dias
      ),
    [range, agrupamentoAtual, chartData, periodo.dias]
  );

  const stats = useMemo(() => {
    if (!chartData.length) return null;
    const sum = chartData.reduce((a, d) => a + d.total, 0);
    const withData = chartData.filter((d) => d.total > 0);
    const max = Math.max(0, ...chartData.map((d) => d.total));
    const maxIdx = chartData.findIndex((d) => d.total === max);
    const bucketsComDados = withData.length || 1;
    const avg = sum / bucketsComDados;
    return {
      sum,
      avg,
      max,
      maxRotulo: chartData[maxIdx]?.rotulo ?? "—",
      sparse: sum > 0 && withData.length <= 2 && chartData.length > 14,
    };
  }, [chartData]);

  const yMax = useMemo(() => {
    const values = chartData.flatMap((d) =>
      [
        d.total,
        agrupamentoAtual === "dia" && d.mediaMovel30 != null ? d.mediaMovel30 : 0,
      ].filter((v) => typeof v === "number")
    );
    const m = Math.max(0, ...values);
    return Math.max(Math.ceil(m * 1.15), 1);
  }, [chartData, agrupamentoAtual]);

  const showDots = chartData.filter((d) => d.total > 0).length <= 21;
  const showMa = agrupamentoAtual === "dia" && periodo.dias >= 14;
  const accent = demoMode ? "#fb923c" : "#f97316";
  const unidade =
    agrupamentoAtual === "dia"
      ? "dia"
      : agrupamentoAtual === "semana"
        ? "semana"
        : agrupamentoAtual === "mes"
          ? "mês"
          : "ano";
  const chartHeight = emPainel ? 260 : 292;
  const marginBottom = xAxis.layout === "angled" ? (emPainel ? 44 : 48) : emPainel ? 32 : 36;
  const chartMargin = {
    top: emPainel ? 20 : 24,
    right: emPainel ? 16 : 20,
    left: 0,
    bottom: marginBottom,
  };
  const yAxisWidth = 32;

  const chartTransitionKey = `${periodId}-${agrupamentoAtual}`;

  const periodoToolbar = (
    <div
      className="inline-flex max-w-full flex-wrap rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-1 shadow-sm dark:border-[#2a2a2a] dark:bg-[#111]"
      role="group"
      aria-label="Intervalo de tempo"
    >
      {PERIODOS_VOLUME.map((p) => (
        <button
          key={p.id}
          type="button"
          title={PERIODO_LABEL_LONGO[p.id]}
          disabled={demoMode}
          onClick={() => selectPeriodo(p.id)}
          className={`rounded-lg px-2 py-1 text-xs font-semibold transition-all sm:px-2.5 sm:py-1.5 ${
            periodId === p.id
              ? "bg-[#f97316] text-[#1c1917] shadow-sm"
              : "text-[#57534e] hover:text-[#1c1917] dark:text-[#a3a3a3] dark:hover:text-white"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  return (
    <AnalyticsCard
      title="Volume de encomendas"
      subtitle={
        emPainel
          ? `${xAxis.intervaloLegivel} · ${LABEL_AGRUPAMENTO[agrupamentoAtual]}`
          : `${xAxis.intervaloLegivel} · ${LABEL_AGRUPAMENTO[agrupamentoAtual]} · Ctrl+scroll: ${periodosValidos.join(" → ")}`
      }
      compact={emPainel}
      className={`h-full min-w-0 ${demoMode ? "border-dashed border-[#f97316]/40" : ""}`}
      action={emPainel ? undefined : periodoToolbar}
    >
      <div
        ref={chartZoneRef}
        className="min-w-0 overscroll-contain"
        style={{ touchAction: "pan-x pan-y" }}
        title="Mantém Ctrl e usa a roda do rato aqui para mudar o período (7d → 3a)"
      >
        {emPainel && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            {periodoToolbar}
            <p className="text-[10px] text-[#a8a29e]">
              Ctrl + scroll nesta área · 7d → 3a
            </p>
          </div>
        )}

        {!demoMode && isLoading ? (
          <AnalyticsSkeleton height={emPainel ? chartHeight + 88 : 320} />
        ) : !demoMode && isError ? (
          <p className="py-12 text-center text-sm text-[#78716c]">Sem dados suficientes.</p>
        ) : chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#78716c]">Sem dados suficientes.</p>
        ) : (
          <div className={demoMode ? "opacity-90" : ""}>
          {stats && (
            <div
              className={`mb-4 grid grid-cols-3 gap-2 transition-opacity duration-200 ${
                emPainel ? "sm:gap-2.5" : "gap-2.5 sm:gap-3"
              } ${chartOpaque ? "opacity-100" : "opacity-60"}`}
            >
              <StatChip
                dense={emPainel}
                label={`Total (${periodoLabelLongo})`}
                value={stats.sum}
              />
              <StatChip
                dense={emPainel}
                label={emPainel ? `Média / ${unidade}` : `Média por ${unidade} (com dados)`}
                value={stats.avg < 10 ? stats.avg.toFixed(1) : Math.round(stats.avg)}
              />
              <StatChip
                dense={emPainel}
                label="Pico"
                value={stats.max}
                hint={stats.maxRotulo}
                accent
              />
            </div>
          )}

          {stats?.sparse && (
            <p className="mb-3 text-center text-[11px] text-[#78716c]">
              Poucas encomendas no intervalo — o eixo X cobre todo o período ({periodoLabelLongo});
              a atividade aparece apenas onde há registos.
            </p>
          )}

          <div
            className="w-full min-w-0 overflow-hidden rounded-xl border border-[#e7e5e4]/60 bg-gradient-to-b from-[#fafaf9]/50 to-transparent px-1 pb-2 pt-1 dark:border-[#2a2a2a] dark:from-[#111]/30"
            title="Ctrl + roda: 7d ↔ 3a (agrupamento automático por período)"
          >
            <p className="mb-1 flex justify-end pr-2 text-[11px] text-[#78716c] dark:text-[#666]">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
                Encomendas
              </span>
            </p>
            <div
              key={chartTransitionKey}
              className={`w-full min-w-0 transition-opacity ease-in-out ${
                chartOpaque ? "opacity-100 duration-300" : "opacity-0 duration-200"
              }`}
              style={{ height: chartHeight, width: "100%", transitionDuration: `${FADE_MS}ms` }}
            >
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <ComposedChart data={chartData} margin={chartMargin}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accent} stopOpacity={0.4} />
                      <stop offset="85%" stopColor={accent} stopOpacity={0.06} />
                      <stop offset="100%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID} strokeDasharray="4 6" vertical={false} />
                  <XAxis
                    type="number"
                    dataKey="ms"
                    domain={[range.startMs, range.endMs]}
                    scale="time"
                    ticks={xAxis.ticks}
                    tickFormatter={(ms) => xAxis.formatTick(Number(ms))}
                    tick={{
                      fontSize: 10,
                      fill: TICK,
                      fontWeight: agrupamentoAtual === "ano" ? 600 : 400,
                    }}
                    dy={6}
                    axisLine={false}
                    tickLine={false}
                    angle={xAxis.layout === "angled" ? -35 : 0}
                    textAnchor={xAxis.layout === "angled" ? "end" : "middle"}
                    height={xAxis.layout === "angled" ? 52 : 36}
                    tickMargin={4}
                    padding={{ left: 0, right: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: TICK }}
                    domain={[0, yMax]}
                    allowDataOverflow={false}
                    width={yAxisWidth}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<VolumeTooltip />}
                    cursor={{ stroke: accent, strokeOpacity: 0.35, strokeWidth: 1 }}
                  />
                  {stats && stats.max > 0 && stats.max < yMax && (
                    <ReferenceLine
                      y={stats.max}
                      stroke={accent}
                      strokeOpacity={0.25}
                      strokeDasharray="4 6"
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Encomendas"
                    baseValue={0}
                    stroke={accent}
                    strokeWidth={chartData.length > 40 ? 1.5 : 2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill={`url(#${gradientId})`}
                    activeDot={{
                      r: 6,
                      fill: accent,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    dot={
                      showDots
                        ? (props) => {
                            const row = props.payload as VolumeChartPoint | undefined;
                            if (
                              !row?.total ||
                              props.cx == null ||
                              props.cy == null
                            ) {
                              return null;
                            }
                            return (
                              <circle
                                key={row.chave ?? `dot-${props.index}`}
                                cx={props.cx}
                                cy={props.cy}
                                r={3.5}
                                fill={accent}
                                stroke="#fff"
                                strokeWidth={1.5}
                              />
                            );
                          }
                        : false
                    }
                  />
                  {showMa && (
                    <Line
                      type="monotone"
                      dataKey="mediaMovel30"
                      name="Média 30 dias"
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      dot={false}
                      activeDot={{ r: 3, fill: "#94a3b8", stroke: "#fff", strokeWidth: 1 }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {stats && stats.sum <= 3 && !stats.sparse && (
            <p className="mt-3 text-center text-[11px] text-[#a8a29e]">
              Poucos dados em {periodo.descricao} — experimenta um intervalo maior.
            </p>
          )}
          </div>
        )}
      </div>
    </AnalyticsCard>
  );
}
