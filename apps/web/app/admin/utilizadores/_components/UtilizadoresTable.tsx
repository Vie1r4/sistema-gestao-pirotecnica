"use client";

import { Fragment } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { UtilizadorComRoles } from "@/app/lib/admin";
import { AdminCard, AdminEmptyState } from "@/app/admin/_components";
import UserAvatar from "@/app/admin/utilizadores/_components/UserAvatar";
import UtilizadorInlineEditor from "@/app/admin/utilizadores/_components/UtilizadorInlineEditor";
import { ROLE_COLORS } from "@/app/admin/utilizadores/_components/utilizadoresConstants";
import type { UtilizadorStatusFilter } from "@/app/admin/lib/utilizadoresFilters";

type Props = {
  isLoading: boolean;
  utilizadores: UtilizadorComRoles[];
  filtered: UtilizadorComRoles[];
  statusFilter: UtilizadorStatusFilter;
  editingId: string | null;
  eliminandoId: string | null;
  onToggleEditing: (id: string) => void;
  onDelete: (id: string, nome: string) => void;
  onCloseEditor: () => void;
};

export default function UtilizadoresTable({
  isLoading,
  utilizadores,
  filtered,
  statusFilter,
  editingId,
  eliminandoId,
  onToggleEditing,
  onDelete,
  onCloseEditor,
}: Props) {
  return (
    <AdminCard padding={false} className="overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          title={utilizadores.length === 0 ? "Nenhum utilizador registado" : "Nenhum resultado"}
          description={
            utilizadores.length === 0
              ? "As contas aparecem aqui quando são criadas no sistema."
              : statusFilter === "email-pendente"
                ? "Não há contas com email por confirmar."
                : statusFilter === "sem-funcionario"
                  ? "Todas as contas têm funcionário associado."
                  : "Ajuste a pesquisa ou os filtros."
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e7e5e4] bg-[#fafaf9] dark:border-[#222] dark:bg-[#0a0a0a]">
                <th scope="col" className="px-4 py-3 font-semibold text-[#57534e] dark:text-[#888]">
                  Utilizador
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-[#57534e] dark:text-[#888]">
                  Roles
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-[#57534e] dark:text-[#888]">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-[#57534e] dark:text-[#888]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <Fragment key={u.id}>
                  <tr
                    className={`border-b border-[#e7e5e4] transition-colors last:border-0 dark:border-[#222] ${
                      editingId === u.id
                        ? "bg-[#fafaf9] dark:bg-[#0d0d0d]"
                        : "hover:bg-[#fafaf9] dark:hover:bg-[#0a0a0a]"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.userName} roles={u.roles} />
                        <div>
                          <span className="font-medium text-[#1c1917] dark:text-white">{u.userName}</span>
                          <br />
                          <span className="text-xs text-[#78716c] dark:text-[#666]">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1">
                        {u.roles.length === 0 ? (
                          <span className="text-xs text-[#a8a29e] dark:text-[#555]">—</span>
                        ) : (
                          u.roles.map((r) => (
                            <span
                              key={r}
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[r] ?? "bg-[#e7e5e4] text-[#57534e] dark:bg-[#222] dark:text-[#a3a3a3]"}`}
                            >
                              {r}
                            </span>
                          ))
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.emailConfirmed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f0fdf4] px-2 py-0.5 text-xs font-medium text-[#16a34a] dark:bg-[#052e16]/60 dark:text-[#4ade80]">
                          Confirmado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-2 py-0.5 text-xs font-medium text-[#92400e] dark:bg-[#451a03]/60 dark:text-[#fbbf24]">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleEditing(u.id)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                            editingId === u.id
                              ? "bg-[#f97316] text-black"
                              : "border border-[#e7e5e4] text-[#57534e] hover:bg-[#fafaf9] dark:border-[#333] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a]"
                          }`}
                        >
                          {editingId === u.id ? "Fechar" : "Editar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(u.id, u.userName)}
                          disabled={eliminandoId === u.id}
                          className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          {eliminandoId === u.id ? "…" : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {editingId === u.id && (
                      <motion.tr
                        key={`${u.id}-edit`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <td colSpan={4} className="border-b border-[#e7e5e4] p-0 dark:border-[#222]">
                          <UtilizadorInlineEditor
                            userId={u.id}
                            email={u.email}
                            emailConfirmed={u.emailConfirmed}
                            onClose={onCloseEditor}
                            onSaved={onCloseEditor}
                          />
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminCard>
  );
}
