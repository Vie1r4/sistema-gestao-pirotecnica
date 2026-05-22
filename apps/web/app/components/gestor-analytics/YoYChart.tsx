"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchClientes } from "@/app/lib/clientes";
import {
  fetchComparacaoAnual,
  type ComparacaoAnualResponse,
  type FiltroOpcao,
} from "@/app/lib/gestorAnalytics";
import { buildDemoComparacaoAnual, demoYoY } from "@/app/lib/gestorAnalyticsDemo";
import { fetchList as fetchProdutosList } from "@/app/lib/produtosApi";
import { useGestorDemo } from "./GestorDemoProvider";
import AnalyticsCard, { AnalyticsSkeleton } from "./AnalyticsCard";
import {
  buildYoYChartRows,
  intervaloLegivel,
  mapZonasToPicos,
  indiceFaixaX,
  type PeriodoYoYId,
  type PicoHistorico,
  type YoYChartRow,
} from "./yoYChartData";

const COR_ATUAL = "#f97316";
const COR_ANTERIOR = "#64748b";
const FADE_MS = 220;
const CHART_HEIGHT_DEFAULT = 420;
const CHART_HEIGHT_COMPACT = 280;

const periodosValidos = ["7d", "30d", "90d", "6m", "1a", "2a", "3a"] as const;

type PeriodoYoYPreset = {
  id: PeriodoYoYId;
  label: (typeof periodosValidos)[number];
  dias: number;
};

const PERIODOS_YOY: PeriodoYoYPreset[] = [
  { id: "7", label: "7d", dias: 7 },
  { id: "30", label: "30d", dias: 30 },
  { id: "90", label: "90d", dias: 90 },
  { id: "180", label: "6m", dias: 180 },
  { id: "365", label: "1a", dias: 365 },
  { id: "730", label: "2a", dias: 730 },
  { id: "1095", label: "3a", dias: 1095 },
];

const PERIODO_LABEL_LONGO: Record<PeriodoYoYId, string> = {
  "7": "7 dias",
  "30": "30 dias",
  "90": "90 dias",
  "180": "6 meses",
  "365": "12 meses",
  "730": "2 anos",
  "1095": "3 anos",
};

const PERIODO_INICIAL = PERIODOS_YOY[4];

function periodoPorId(id: PeriodoYoYId): PeriodoYoYPreset {
  return PERIODOS_YOY.find((p) => p.id === id) ?? PERIODO_INICIAL;
}

function indicePeriodo(id: PeriodoYoYId): number {
  return PERIODOS_YOY.findIndex((p) => p.id === id);
}

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

function YoYTooltip({
  active,
  payload,
  ano,
  anoAnterior,
  unidades,
}: {
  active?: boolean;
  payload?: { payload?: YoYChartRow }[];
  ano: number;
  anoAnterior: number;
  unidades: boolean;
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const p = payload[0].payload;
  const un = unidades ? " un." : "";
  const atualTxt =
    p.futuro || p.atual == null ? "—" : String(p.atual);
  return (
    <div className="rounded-xl border border-[#e7e5e4] bg-white p-3 text-xs shadow-lg dark:border-[#333] dark:bg-[#111]">
      <p className="font-semibold text-[#1c1917] dark:text-white">{p.rotulo}</p>
      <p className="mt-1 text-[#57534e] dark:text-[#a3a3a3]">
        {ano}: <strong>{atualTxt}</strong>
        {un} · {anoAnterior}: <strong>{p.anoAnterior}</strong>
        {un}
      </p>
      {p.produtoDestaque && (p.quantidadeDestaque ?? 0) > 0 && (
        <p className="mt-1 text-amber-800 dark:text-amber-400">
          Pico {anoAnterior}: ~{Math.round(p.quantidadeDestaque!)} un.{" "}
          {p.produtoDestaque}
        </p>
      )}
    </div>
  );
}

function PicosHistoricos({
  picos,
  maxIndice,
}: {
  picos: PicoHistorico[];
  maxIndice: number;
}) {
  return (
    <>
      {picos.map((p) => {
        const band = indiceFaixaX(p.indice, p.semanaFim, maxIndice);
        if (!band) return null;
        const { x1, x2 } = band;
        const texto =
          p.texto.length > 48 ? `${p.texto.slice(0, 46)}…` : p.texto;
        return (
          <ReferenceArea
            key={`${p.indice}-${p.semanaFim ?? p.indice}-${texto.slice(0, 12)}`}
            x1={x1}
            x2={x2}
            fill="#fef08a"
            fillOpacity={0.42}
            stroke="#eab308"
            strokeOpacity={0.35}
            ifOverflow="hidden"
          >
            <Label
              value={texto}
              position="insideTopLeft"
              offset={6}
              fontSize={9}
              fill="#854d0e"
              angle={-14}
            />
          </ReferenceArea>
        );
      })}
    </>
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
  const wheelCleanupRef = useRef<(() => void) | null>(null);
  const pointerInsideZoneRef = useRef(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { demoMode } = useGestorDemo();

  const [periodId, setPeriodId] = useState<PeriodoYoYId>(PERIODO_INICIAL.id);
  const [chartOpaque, setChartOpaque] = useState(true);
  const [materialId, setMaterialId] = useState("");
  const [clienteId, setClienteId] = useState("");

  const periodo = periodoPorId(periodId);

  const viewRef = useRef({ periodId });
  viewRef.current = { periodId };

  const produtoId = materialId ? Number(materialId) : undefined;
  const clienteIdNum = clienteId ? Number(clienteId) : undefined;

  const applyPeriodo = useCallback((id: PeriodoYoYId, animate = true) => {
    if (viewRef.current.periodId === id) return;
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    const apply = () => {
      setPeriodId(id);
      setChartOpaque(true);
    };

    if (!animate) {
      apply();
      return;
    }

    setChartOpaque(false);
    fadeTimerRef.current = setTimeout(apply, FADE_MS);
  }, []);

  const applyPeriodoRef = useRef(applyPeriodo);
  applyPeriodoRef.current = applyPeriodo;

  const bindChartZoneRef = useCallback((node: HTMLDivElement | null) => {
    if (wheelCleanupRef.current) {
      wheelCleanupRef.current();
      wheelCleanupRef.current = null;
    }
    if (!node) return;

    const eventoDentroDaZona = (e: WheelEvent) => {
      const target = e.target;
      if (target instanceof Node && node.contains(target)) return true;
      return pointerInsideZoneRef.current;
    };

    const onPointerEnter = () => {
      pointerInsideZoneRef.current = true;
    };
    const onPointerLeave = (e: PointerEvent) => {
      const related = e.relatedTarget;
      if (related instanceof Node && node.contains(related)) return;
      pointerInsideZoneRef.current = false;
    };

    const onWheelCapture = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      if (!eventoDentroDaZona(e)) return;
      e.preventDefault();
      e.stopPropagation();

      const zoomIn = e.deltaY < 0;
      const idx = indicePeriodo(viewRef.current.periodId);
      if (idx < 0) return;

      const nextIdx = zoomIn
        ? Math.max(0, idx - 1)
        : Math.min(PERIODOS_YOY.length - 1, idx + 1);
      if (nextIdx === idx) return;

      applyPeriodoRef.current(PERIODOS_YOY[nextIdx].id, true);
    };

    node.addEventListener("pointerenter", onPointerEnter);
    node.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("wheel", onWheelCapture, { passive: false, capture: true });

    wheelCleanupRef.current = () => {
      node.removeEventListener("pointerenter", onPointerEnter);
      node.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("wheel", onWheelCapture, true);
      pointerInsideZoneRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      wheelCleanupRef.current?.();
      wheelCleanupRef.current = null;
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const { data: real, isLoading, isFetching, isError } = useQuery({
    queryKey: [
      "gestor-analytics",
      "comparacao-anual",
      periodId,
      produtoId,
      clienteIdNum,
    ],
    queryFn: () =>
      fetchComparacaoAnual(token, {
        periodoId: periodId,
        produtoId,
        clienteId: clienteIdNum,
      }),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    enabled: !!token && !demoMode,
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
    enabled: !!token && !demoMode,
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
    enabled: !!token && !demoMode,
  });

  const data = useMemo((): ComparacaoAnualResponse | undefined => {
    if (demoMode) {
      return buildDemoComparacaoAnual(periodId, {
        produtoId,
        clienteId: clienteIdNum,
      });
    }
    return real;
  }, [demoMode, real, periodId, produtoId, clienteIdNum]);

  const chartData = useMemo(
    () => buildYoYChartRows(data, periodId),
    [data, periodId]
  );

  const chartBusy = !demoMode && (isLoading || (isFetching && !real));

  const rotuloPorIndice = useMemo(
    () => new Map(chartData.map((r) => [r.indice, r.rotulo])),
    [chartData]
  );

  const maxIndice = chartData.length > 0 ? chartData[chartData.length - 1].indice : 0;

  const xTickInterval =
    chartData.length <= 12 ? 0 : chartData.length > 26 ? 3 : chartData.length > 14 ? 1 : 0;

  const anoAtual = data?.ano ?? new Date().getFullYear();
  const anoAnterior = data?.anoAnterior ?? anoAtual - 1;

  const indicePorSemanaIso = useMemo(() => {
    const map = new Map<number, number>();
    chartData.forEach((r) => {
      const m = /-W(\d{2})$/.exec(r.chave);
      if (m) map.set(Number(m[1]), r.indice);
    });
    return map;
  }, [chartData]);

  const picosHistoricos = useMemo(
    () => mapZonasToPicos(data?.zonasPico, indicePorSemanaIso),
    [data?.zonasPico, indicePorSemanaIso]
  );

  const materiaisOpcoes = useMemo((): FiltroOpcao[] => {
    if (demoMode) return demoYoY.materiais;
    return mergeFiltroOpcoes(data?.materiais, produtosCatalogo);
  }, [demoMode, data?.materiais, produtosCatalogo]);

  const clientesOpcoes = useMemo((): FiltroOpcao[] => {
    if (demoMode) return demoYoY.clientes;
    return mergeFiltroOpcoes(data?.clientes, clientesCatalogo);
  }, [demoMode, data?.clientes, clientesCatalogo]);

  const filtroMaterial = materiaisOpcoes.find((m) => String(m.id) === materialId);
  const filtroCliente = clientesOpcoes.find((c) => String(c.id) === clienteId);
  const unidades = !!produtoId;

  const intervaloEixo = useMemo(() => intervaloLegivel(chartData), [chartData]);

  const subtitulo = useMemo(
    () =>
      [
        `${intervaloEixo} · ${anoAtual} vs ${anoAnterior}`,
        PERIODO_LABEL_LONGO[periodId],
        unidades ? "unidades do material" : "n.º encomendas",
      ].join(" · "),
    [intervaloEixo, anoAtual, anoAnterior, periodId, unidades]
  );

  const chartTransitionKey = `${periodId}-${materialId}-${clienteId}-${chartData.length}-${chartData[0]?.chave ?? ""}`;

  const selectClass =
    "w-full min-w-0 rounded-lg border border-[#e7e5e4] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1c1917] dark:border-[#333] dark:bg-[#0d0d0d] dark:text-white";

  return (
    <AnalyticsCard
      title="Este ano vs ano passado"
      subtitle={subtitulo}
      compact={compact}
      className={demoMode ? "border-dashed border-[#f97316]/40" : ""}
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

        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="inline-flex max-w-full shrink-0 flex-nowrap overflow-x-auto rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-1 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] dark:border-[#2a2a2a] dark:bg-[#111] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Intervalo de tempo"
          >
            {PERIODOS_YOY.map((p) => (
              <button
                key={p.id}
                type="button"
                title={PERIODO_LABEL_LONGO[p.id]}
                disabled={demoMode}
                onClick={() => applyPeriodo(p.id, true)}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3 ${
                  periodId === p.id
                    ? "bg-[#f97316] text-[#1c1917] shadow-sm"
                    : "text-[#57534e] hover:text-[#1c1917] dark:text-[#a3a3a3] dark:hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
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
      ) : !demoMode && isError ? (
        <p className="py-12 text-center text-sm text-[#78716c]">Sem dados.</p>
      ) : (
        <div
          ref={bindChartZoneRef}
          className={`overscroll-contain rounded-xl border border-[#e7e5e4]/50 bg-[#fafaf9]/30 p-1 pt-2 dark:border-[#2a2a2a] dark:bg-[#111]/20 ${demoMode ? "opacity-90" : ""}`}
          style={{ touchAction: "pan-x pan-y" }}
          title="Ctrl + roda: 7d ↔ 3a (sem zoom da página)"
        >
          <p className="pointer-events-none mb-1 px-2 text-center text-[10px] text-[#a8a29e]">
            Ctrl + scroll no gráfico para mudar o período
          </p>
          <div
            key={chartTransitionKey}
            className={`transition-opacity ease-in-out ${
              chartOpaque ? "opacity-100 duration-300" : "opacity-0 duration-200"
            }`}
            style={{ height: chartHeight, transitionDuration: `${FADE_MS}ms` }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                key={`yoy-${periodId}-${chartData.length}`}
                data={chartData}
                margin={{ top: 40, right: 16, left: 4, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-[#e7e5e4] dark:stroke-[#333]"
                  vertical={false}
                />
                <PicosHistoricos
                  picos={picosHistoricos}
                  maxIndice={maxIndice}
                />
                <XAxis
                  dataKey="indice"
                  type="category"
                  allowDuplicatedCategory={false}
                  tickFormatter={(value) =>
                    rotuloPorIndice.get(Number(value)) ?? ""
                  }
                  interval={xTickInterval}
                  minTickGap={20}
                  padding={{ left: chartData.length <= 4 ? 28 : 8, right: chartData.length <= 4 ? 28 : 8 }}
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
                <Tooltip
                  content={
                    <YoYTooltip
                      ano={anoAtual}
                      anoAnterior={anoAnterior}
                      unidades={unidades}
                    />
                  }
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="atual"
                  name={`${anoAtual} (atual)`}
                  stroke={COR_ATUAL}
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 4, fill: COR_ATUAL }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="anoAnterior"
                  name={`${anoAnterior} (anterior)`}
                  stroke={COR_ANTERIOR}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  activeDot={{ r: 3, fill: COR_ANTERIOR }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </AnalyticsCard>
  );
}
