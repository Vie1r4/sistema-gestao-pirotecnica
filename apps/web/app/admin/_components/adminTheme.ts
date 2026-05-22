/** Tokens visuais partilhados do painel Admin (PIROFAFE). */

export const adminTheme = {
  pageBg: "bg-[#f8f7f5] dark:bg-[#0a0a0a]",
  card:
    "rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:border-[#222] dark:bg-[#111] dark:hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)]",
  cardDanger:
    "rounded-2xl border border-red-200/80 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20",
  sidebar:
    "rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#222] dark:bg-[#111]",
  input:
    "w-full rounded-xl border border-[#e7e5e4] bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#111] dark:text-white dark:placeholder:text-[#555]",
  label: "block text-xs font-semibold text-[#78716c] dark:text-[#888]",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#f97316] px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm font-medium text-[#57534e] transition-colors hover:bg-[#fafaf9] dark:border-[#333] dark:bg-[#111] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a]",
  btnDanger:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-[#111] dark:text-red-400 dark:hover:bg-red-950/40",
  navActive: "bg-[#f97316] text-black",
  navIdle:
    "text-[#57534e] hover:bg-[#fafaf9] hover:text-[#1c1917] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a] dark:hover:text-white",
} as const;

export type StatAccent = "orange" | "violet" | "blue" | "green" | "slate";

export const STAT_ACCENT_BG: Record<StatAccent, string> = {
  orange: "bg-[#fff7ed] dark:bg-[#431407]/40",
  violet: "bg-[#f5f3ff] dark:bg-[#2e1065]/40",
  blue: "bg-[#eff6ff] dark:bg-[#1e3a5f]/40",
  green: "bg-[#f0fdf4] dark:bg-[#052e16]/40",
  slate: "bg-[#f8fafc] dark:bg-[#0f172a]/40",
};

export const STAT_ACCENT_TEXT: Record<StatAccent, string> = {
  orange: "text-[#ea580c] dark:text-[#fb923c]",
  violet: "text-[#7c3aed] dark:text-[#a78bfa]",
  blue: "text-[#2563eb] dark:text-[#60a5fa]",
  green: "text-[#16a34a] dark:text-[#4ade80]",
  slate: "text-[#475569] dark:text-[#94a3b8]",
};
