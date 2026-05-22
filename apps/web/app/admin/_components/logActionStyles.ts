/** Estilos partilhados para ações nos logs (dashboard + página logs). */

export function logActionDotClass(acao: string): string {
  const t = acao.toLowerCase();
  if (t.includes("eliminar") || t.includes("apagar") || t.includes("delete"))
    return "bg-red-400 dark:bg-red-500";
  if (t.includes("criar") || t.includes("registar") || t.includes("create"))
    return "bg-emerald-400 dark:bg-emerald-500";
  if (t.includes("editar") || t.includes("atualizar") || t.includes("update"))
    return "bg-blue-400 dark:bg-blue-500";
  if (t.includes("login") || t.includes("logout") || t.includes("auth"))
    return "bg-violet-400 dark:bg-violet-500";
  return "bg-[#a8a29e] dark:bg-[#555]";
}

export function logActionBadgeClass(acao: string): string {
  const t = acao.toLowerCase();
  if (t.includes("eliminar") || t.includes("apagar"))
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (t.includes("criar") || t.includes("registar"))
    return "bg-[#f0fdf4] text-[#16a34a] dark:bg-[#052e16]/60 dark:text-[#4ade80]";
  if (t.includes("editar") || t.includes("atualizar"))
    return "bg-[#eff6ff] text-[#2563eb] dark:bg-[#1e3a5f]/60 dark:text-[#60a5fa]";
  if (t.includes("login") || t.includes("logout") || t.includes("auth"))
    return "bg-[#f5f3ff] text-[#7c3aed] dark:bg-[#2e1065]/60 dark:text-[#a78bfa]";
  return "bg-[#f1f5f9] text-[#475569] dark:bg-[#1e293b] dark:text-[#94a3b8]";
}
