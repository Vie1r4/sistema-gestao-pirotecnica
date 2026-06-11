import type {
  ComparacaoAnualResponse,
  VolumeEncomendaDetalhe,
} from "@/app/lib/gestorAnalytics";

export type YoYChartRow = {
  mes: number;
  rotulo: string;
  detalhes: Record<number, VolumeEncomendaDetalhe[]>;
  [dataKey: `y${number}`]: number | null | undefined;
};

const MESES_CURTOS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

/** Eixo X fixo: 12 meses (Jan–Dez). Uma coluna por ano seleccionado. */
export function buildYoYChartRows(
  data: ComparacaoAnualResponse | undefined,
  anosVisiveis: number[]
): YoYChartRow[] {
  if (!data || anosVisiveis.length === 0) return [];

  const rows: YoYChartRow[] = [];
  for (let mes = 1; mes <= 12; mes++) {
    const row: YoYChartRow = {
      mes,
      rotulo: MESES_CURTOS[mes - 1],
      detalhes: {},
    };

    for (const ano of anosVisiveis) {
      const serie = data.series.find((s) => s.ano === ano);
      const ponto = serie?.pontos.find((p) => p.mes === mes);
      row[`y${ano}`] = ponto?.futuro ? null : (ponto?.total ?? 0);
      row.detalhes[ano] = ponto?.encomendas ?? [];
    }

    rows.push(row);
  }

  return rows;
}

export const CORES_ANOS = [
  "#f97316",
  "#64748b",
  "#3b82f6",
  "#10b981",
  "#a855f7",
  "#eab308",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
] as const;

export function corParaAno(ano: number, anoAtual: number, ordemNoArray: number): string {
  if (ano === anoAtual) return CORES_ANOS[0];
  const idx = (ordemNoArray % (CORES_ANOS.length - 1)) + 1;
  return CORES_ANOS[idx] ?? CORES_ANOS[1];
}

/** Anos por omissão: os dois mais recentes com dados. */
export function anosSelecionadosIniciais(anosDisponiveis: number[]): number[] {
  if (anosDisponiveis.length === 0) return [];
  return anosDisponiveis.slice(-2);
}
