"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getToken } from "@/app/lib/auth";
import { fetchUtilizadores, deleteUtilizador, type UtilizadorComRoles } from "@/app/lib/admin";
import {
  AdminPageHeader,
  AdminCard,
  buildBreadcrumbs,
} from "@/app/admin/_components";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const BTN_SECONDARY =
  "rounded-xl border border-[#e7e5e4] px-4 py-2 text-sm font-medium text-[#57534e] hover:bg-[#fafaf9] dark:border-[#333] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a]";

function filterUtilizadores(
  list: UtilizadorComRoles[],
  query: string,
  roleFilter: string
): UtilizadorComRoles[] {
  const q = query.trim().toLowerCase();
  const byRole =
    roleFilter === ""
      ? list
      : list.filter((u) => u.roles.some((r) => r.toLowerCase() === roleFilter.toLowerCase()));
  if (!q) return byRole;
  return byRole.filter(
    (u) =>
      u.userName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roles.some((r) => r.toLowerCase().includes(q)) ||
      (u.funcionarioAssociadoNome?.toLowerCase().includes(q) ?? false)
  );
}

export default function AdminUtilizadoresPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const token = getToken();

  const { data: utilizadores = [], isLoading, error } = useQuery({
    queryKey: ["admin", "utilizadores"],
    queryFn: async (): Promise<UtilizadorComRoles[]> => {
      if (!token) {
        router.replace("/login");
        throw new Error("Sessão expirada.");
      }
      return fetchUtilizadores(token);
    },
    enabled: !!token,
    staleTime: 30 * 1000,
  });

  const rolesUnicos = useMemo(() => {
    const set = new Set<string>();
    utilizadores.forEach((u) => u.roles.forEach((r) => set.add(r)));
    return Array.from(set).sort();
  }, [utilizadores]);

  const filtered = useMemo(
    () => filterUtilizadores(utilizadores, search, roleFilter),
    [utilizadores, search, roleFilter]
  );

  const handleEliminar = async (id: string) => {
    if (!window.confirm("Eliminar esta conta? A ação é irreversível.")) return;
    if (!token) return;
    setEliminandoId(id);
    try {
      await deleteUtilizador(token, id);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao eliminar.");
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={transitionSmooth}
      className="space-y-6"
    >
      <AdminPageHeader
        title="Utilizadores"
        description="Contas no servidor. Edite roles e associe a funcionários. Novas contas em Registar primeiro utilizador."
        breadcrumb={buildBreadcrumbs("/admin/utilizadores")}
        actions={
          <Link
            href="/registar-primeiro-utilizador"
            className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-medium text-black hover:opacity-90"
          >
            Registar utilizador
          </Link>
        }
      />

      {error && (
        <div className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error instanceof Error ? error.message : "Erro ao carregar."}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <input
          type="search"
          placeholder="Pesquisar por nome, email ou role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full min-w-[200px] max-w-sm rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#111] dark:text-white dark:placeholder:text-[#555]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm text-[#1c1917] focus:border-[#f97316] focus:outline-none dark:border-[#333] dark:bg-[#111] dark:text-white"
        >
          <option value="">Todas as roles</option>
          {rolesUnicos.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <span className="text-sm text-[#78716c] dark:text-[#666]">
          {filtered.length} de {utilizadores.length} utilizador(es)
        </span>
      </div>

      <AdminCard padding={false} className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#78716c] dark:text-[#888]">
            {utilizadores.length === 0
              ? "Nenhum utilizador registado."
              : "Nenhum utilizador corresponde à pesquisa."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e7e5e4] bg-[#fafaf9] dark:border-[#222] dark:bg-[#0a0a0a]">
                  <th className="px-4 py-3 font-semibold text-[#57534e] dark:text-[#888]">
                    Nome / Email
                  </th>
                  <th className="px-4 py-3 font-semibold text-[#57534e] dark:text-[#888]">
                    Roles
                  </th>
                  <th className="px-4 py-3 font-semibold text-[#57534e] dark:text-[#888]">
                    Funcionário
                  </th>
                  <th className="px-4 py-3 font-semibold text-[#57534e] dark:text-[#888] text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[#e7e5e4] transition-colors last:border-0 hover:bg-[#fafaf9] dark:border-[#222] dark:hover:bg-[#0a0a0a]"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-[#1c1917] dark:text-white">
                          {u.userName}
                        </span>
                        <br />
                        <span className="text-[#57534e] dark:text-[#888]">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className="rounded-full bg-[#e7e5e4] px-2 py-0.5 text-xs font-medium text-[#57534e] dark:bg-[#222] dark:text-[#a3a3a3]"
                          >
                            {r}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#57534e] dark:text-[#888]">
                      {u.funcionarioAssociadoNome ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/utilizadores/${encodeURIComponent(u.id)}/editar`}
                          className={BTN_SECONDARY}
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEliminar(u.id)}
                          disabled={eliminandoId === u.id}
                          className="rounded-xl border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          {eliminandoId === u.id ? "A eliminar…" : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </motion.div>
  );
}
