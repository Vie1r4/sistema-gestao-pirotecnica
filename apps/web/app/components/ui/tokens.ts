/**
 * Design tokens partilhados da app (fonte única de classes Tailwind reutilizadas).
 *
 * Botões têm dois tamanhos propositados:
 * - `btn*`   → listas e páginas de detalhe (px-4 py-2)
 * - `btn*Lg` → formulários (px-5 py-2.5)
 *
 * `btnDangerSolid` é o botão de eliminar com fundo sólido (confirmações destrutivas).
 */

export const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

export const sectionTitleClass = "text-lg font-semibold text-gray-900 dark:text-white";

export const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

export const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";

/**
 * Inputs compactos (px-3 py-2). Três variantes propositadas — não unificar:
 * - `inputClassCompact` → campos compactos de formulário (sem anel de foco/placeholder)
 * - `inputClassFilter`  → controlos de filtro (com anel de foco, sem placeholder)
 * - `inputClassSearch`  → caixas de pesquisa (com anel de foco e placeholder)
 */
export const inputClassCompact =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";

export const inputClassFilter =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";

export const inputClassSearch =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";

/** Card das páginas de autenticação (variante maior: p-8 … sm:p-10). */
export const authCardClass =
  "card-hover rounded-2xl border border-[#e7e5e4] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] dark:shadow-none sm:p-10";

export const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

export const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

export const btnDanger =
  "data-button rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-[border-color,background-color,color] duration-200 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950";

export const btnPrimaryLg =
  "data-button rounded-xl bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

export const btnSecondaryLg =
  "data-button rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

export const btnDangerSolid =
  "data-button rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-[background-color,opacity] duration-200 hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";
