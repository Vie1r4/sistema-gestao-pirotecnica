/**
 * Catálogo de produtos (artigos) para stock no armazém.
 * Alinhado ao backend: Produto (NEM por unidade, FamiliaRisco, GrupoCompatibilidade, FiltroTecnico, Calibre).
 */

export const CLASSIFICACOES_RISCO = ["1.1", "1.2", "1.3", "1.4", "1.4S", "1.5", "1.6"] as const;
export type ClassificacaoRisco = (typeof CLASSIFICACOES_RISCO)[number];

export const GRUPOS_COMPATIBILIDADE: { value: string; text: string }[] = [
  { value: "G", text: "G — Artigos pirotécnicos (foguetes, morteiros, F3/F4)" },
  { value: "S", text: "S — Artigos muito seguros (F1/F2)" },
  { value: "C", text: "C — Pólvoras / propulsoras" },
  { value: "B", text: "B — Iniciadores (detonadores, espoletas)" },
  { value: "D", text: "D — Explosivos secundários sem espoleta" },
];

export const FILTROS_TECNICOS: { value: string; text: string }[] = [
  { value: "Baterias", text: "Baterias (Cakes)" },
  { value: "BombasArremesso", text: "Bombas de Arremesso (Shells)" },
  { value: "Morteiros", text: "Morteiros (Mortars)" },
  { value: "Foguetes", text: "Foguetes (Rockets)" },
  { value: "Cascatas", text: "Cascatas / Fontes" },
  { value: "Bengalas", text: "Bengalas (Sparklers)" },
  { value: "Candelas", text: "Candelas (Roman Candles)" },
  { value: "Monotiros", text: "Monotiros (Single Shots)" },
  { value: "GerbsVulcoes", text: "Gerbs / Vulcões" },
];

/** Categoria pirotécnica (F1–F4, FP) para declaração PSP. */
export const CATEGORIAS_PIROTECNICAS = ["F1", "F2", "F3", "F4", "FP"] as const;
export type CategoriaPirotecnica = (typeof CATEGORIAS_PIROTECNICAS)[number];

export const CALIBRES: { value: string; text: string }[] = [
  { value: "MuitoPequeno", text: "< 20 mm" },
  { value: "BateriasPadrao", text: "20–30 mm" },
  { value: "BombasPequenas", text: "50–75 mm" },
  { value: "BombasMedias", text: "100–125 mm" },
  { value: "BombasGrandes", text: "> 150 mm" },
];

export type Produto = {
  id: string;
  nome: string;
  nemPorUnidade: number;
  familiaRisco: ClassificacaoRisco | string;
  referencia?: string;
  filtroTecnico?: string;
  calibre?: string;
  grupoCompatibilidade?: string;
  /** Categoria pirotécnica (F1–F4, FP) para documentação regulatória. */
  categoria?: string;
};

/** Valida NEM por unidade: número positivo (mínimo 0.0001) */
export function validarNemPorUnidade(val: number): boolean {
  return typeof val === "number" && !Number.isNaN(val) && val >= 0.0001;
}

/** Campos de catálogo obrigatórios ao criar/editar produto. Devolve mensagem de erro ou null se válido. */
export function validarCamposCatalogoProduto(campos: {
  categoria?: string;
  grupoCompatibilidade?: string;
  filtroTecnico?: string;
  calibre?: string;
}): string | null {
  if (!campos.categoria?.trim()) return "A categoria pirotécnica é obrigatória.";
  if (!campos.grupoCompatibilidade?.trim()) return "O grupo de compatibilidade é obrigatório.";
  if (!campos.filtroTecnico?.trim()) return "O filtro técnico é obrigatório.";
  if (!campos.calibre?.trim()) return "O calibre é obrigatório.";
  return null;
}

export function textoClassificacao(valor: string): string {
  if (!valor) return "—";
  return valor === "1.4S" ? valor : `${valor}G`;
}

export function textoGrupo(valor: string | undefined): string {
  if (!valor) return "—";
  const g = GRUPOS_COMPATIBILIDADE.find((x) => x.value === valor);
  return g?.text ?? valor;
}

export function textoFiltroTecnico(valor: string | undefined): string {
  if (!valor) return "—";
  const f = FILTROS_TECNICOS.find((x) => x.value === valor);
  return f?.text ?? valor;
}

export function textoCalibre(valor: string | undefined): string {
  if (!valor) return "—";
  const c = CALIBRES.find((x) => x.value === valor);
  return c?.text ?? valor;
}
