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
  { value: "Baterias", text: "Baterias" },
  { value: "BombasArremesso", text: "Bombas de Arremesso" },
  { value: "Morteiros", text: "Morteiros" },
  { value: "Foguetes", text: "Foguetes" },
  { value: "Cascatas", text: "Cascatas / Fontes" },
  { value: "Bengalas", text: "Bengalas" },
  { value: "Candelas", text: "Candelas" },
  { value: "Monotiros", text: "Monotiros" },
  { value: "GerbsVulcoes", text: "Gerbs / Vulcões" },
];

/** Categorias pirotécnicas (declaração PSP). */
export const CATEGORIAS_PIROTECNICAS: { value: string; text: string }[] = [
  { value: "F1", text: "F1" },
  { value: "F2", text: "F2" },
  { value: "F3", text: "F3" },
  { value: "F4", text: "F4" },
  { value: "T1", text: "T1" },
  { value: "T2", text: "T2" },
  { value: "P1", text: "P1" },
  { value: "P2", text: "P2" },
  { value: "FP", text: "FP — Fabrico próprio" },
];
export type CategoriaPirotecnica = (typeof CATEGORIAS_PIROTECNICAS)[number]["value"];

export const CALIBRES: { value: string; text: string }[] = [
  { value: "20_25_30MM", text: "20/25/30MM" },
  { value: "50MM", text: "50MM" },
  { value: "65MM", text: "65MM" },
  { value: "75MM", text: "75MM" },
  { value: "100MM", text: "100MM" },
  { value: "120MM", text: "120MM" },
  { value: "150MM", text: "150MM" },
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
  /** Distância mínima ao público (m) — usada para calcular o raio nas zonas de serviço. */
  distanciaSegurancaPublico_m?: number;
};

/** Valida NEM por unidade: número positivo (mínimo 0.0001) */
export function validarNemPorUnidade(val: number): boolean {
  return typeof val === "number" && !Number.isNaN(val) && val >= 0.0001;
}

/** Valida distância de segurança ao público: inteiro positivo (1–100000 m). */
export function validarDistanciaSegurancaPublico(val: number): boolean {
  return Number.isInteger(val) && val >= 1 && val <= 100_000;
}

/** Campos de catálogo obrigatórios ao criar/editar produto. Devolve mensagem de erro ou null se válido. */
export function validarCamposCatalogoProduto(campos: {
  categoria?: string;
  grupoCompatibilidade?: string;
  filtroTecnico?: string;
  calibre?: string;
  distanciaSegurancaPublico_m?: number | string;
}): string | null {
  if (!campos.categoria?.trim()) return "A categoria pirotécnica é obrigatória.";
  if (!campos.grupoCompatibilidade?.trim()) return "O grupo de compatibilidade é obrigatório.";
  if (!campos.filtroTecnico?.trim()) return "O filtro técnico é obrigatório.";
  if (!campos.calibre?.trim()) return "O calibre é obrigatório.";
  const dist =
    typeof campos.distanciaSegurancaPublico_m === "string"
      ? parseInt(campos.distanciaSegurancaPublico_m, 10)
      : campos.distanciaSegurancaPublico_m;
  if (dist == null || !validarDistanciaSegurancaPublico(dist)) {
    return "A distância de segurança ao público deve ser um número inteiro entre 1 e 100000 metros.";
  }
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

export function textoCategoria(valor: string | undefined): string {
  if (!valor) return "—";
  const c = CATEGORIAS_PIROTECNICAS.find((x) => x.value === valor);
  return c?.text ?? valor;
}
