import type { UtilizadorComRoles } from "@/app/lib/admin";

/** Valores aceites em `?filtro=` na página de utilizadores. */
export const UTILIZADOR_FILTROS = ["email-pendente", "sem-funcionario"] as const;
export type UtilizadorStatusFilter = (typeof UTILIZADOR_FILTROS)[number] | "";

export function parseUtilizadorFiltro(value: string | null): UtilizadorStatusFilter {
  if (value === "email-pendente" || value === "sem-funcionario") return value;
  return "";
}

export function filterUtilizadoresList(
  list: UtilizadorComRoles[],
  query: string,
  roleFilter: string,
  statusFilter: UtilizadorStatusFilter
): UtilizadorComRoles[] {
  let result = list;

  if (statusFilter === "email-pendente") {
    result = result.filter((u) => !u.emailConfirmed);
  } else if (statusFilter === "sem-funcionario") {
    result = result.filter((u) => !u.funcionarioAssociadoNome);
  }

  const byRole =
    roleFilter === ""
      ? result
      : result.filter((u) => u.roles.some((r) => r.toLowerCase() === roleFilter.toLowerCase()));

  const q = query.trim().toLowerCase();
  if (!q) return byRole;

  return byRole.filter(
    (u) =>
      u.userName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roles.some((r) => r.toLowerCase().includes(q)) ||
      (u.funcionarioAssociadoNome?.toLowerCase().includes(q) ?? false)
  );
}

export function countByStatusFilter(
  list: UtilizadorComRoles[],
  status: UtilizadorStatusFilter
): number {
  if (status === "email-pendente") return list.filter((u) => !u.emailConfirmed).length;
  if (status === "sem-funcionario") return list.filter((u) => !u.funcionarioAssociadoNome).length;
  return list.length;
}
