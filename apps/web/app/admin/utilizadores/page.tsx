"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getToken } from "@/app/lib/auth";
import { deleteUtilizador, fetchUtilizadores, type UtilizadorComRoles } from "@/app/lib/admin";
import {
  AdminPageHeader,
  AdminConfirmDialog,
  AdminFilterChip,
  adminTheme,
  buildBreadcrumbs,
} from "@/app/admin/_components";
import {
  filterUtilizadoresList,
  countByStatusFilter,
  parseUtilizadorFiltro,
  type UtilizadorStatusFilter,
} from "@/app/admin/lib/utilizadoresFilters";
import NovoUtilizadorModal from "@/app/admin/utilizadores/_components/NovoUtilizadorModal";
import UtilizadoresTable from "@/app/admin/utilizadores/_components/UtilizadoresTable";
import { useToastStore } from "@/app/stores/useToastStore";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

function AdminUtilizadoresContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<UtilizadorStatusFilter>("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nome: string } | null>(null);
  const [novoModalOpen, setNovoModalOpen] = useState(false);
  const token = getToken();

  useEffect(() => {
    const edit = searchParams.get("edit");
    if (edit) setEditingId(edit);
    setStatusFilter(parseUtilizadorFiltro(searchParams.get("filtro")));
  }, [searchParams]);

  const setStatusFilterWithUrl = (next: UtilizadorStatusFilter) => {
    setStatusFilter(next);
    const params = new URLSearchParams();
    if (next) params.set("filtro", next);
    const edit = searchParams.get("edit");
    if (edit) params.set("edit", edit);
    const qs = params.toString();
    router.replace(qs ? `/admin/utilizadores?${qs}` : "/admin/utilizadores", { scroll: false });
  };

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
    staleTime: 30_000,
  });

  const rolesUnicos = useMemo(() => {
    const set = new Set<string>();
    utilizadores.forEach((u) => u.roles.forEach((r) => set.add(r)));
    return Array.from(set).sort();
  }, [utilizadores]);

  const counts = useMemo(
    () => ({
      emailPendente: countByStatusFilter(utilizadores, "email-pendente"),
      semFuncionario: countByStatusFilter(utilizadores, "sem-funcionario"),
    }),
    [utilizadores]
  );

  const filtered = useMemo(
    () => filterUtilizadoresList(utilizadores, search, roleFilter, statusFilter),
    [utilizadores, search, roleFilter, statusFilter]
  );

  const confirmEliminar = async () => {
    if (!deleteTarget || !token) return;
    setEliminandoId(deleteTarget.id);
    try {
      await deleteUtilizador(token, deleteTarget.id);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      useToastStore.getState().show("Utilizador eliminado.", "success");
      setDeleteTarget(null);
    } catch (e) {
      useToastStore.getState().show(
        e instanceof Error ? e.message : "Erro ao eliminar.",
        "error"
      );
    } finally {
      setEliminandoId(null);
    }
  };

  const toggleEditing = (id: string) => {
    setEditingId((prev) => (prev === id ? null : id));
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
        description="Contas no sistema. Crie utilizadores, edite roles, credenciais e associação a funcionários."
        breadcrumb={buildBreadcrumbs("/admin/utilizadores")}
        actions={
          <button
            type="button"
            onClick={() => setNovoModalOpen(true)}
            className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-medium text-black hover:opacity-90"
          >
            Novo utilizador
          </button>
        }
      />

      {error && (
        <div className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error instanceof Error ? error.message : "Erro ao carregar."}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#a8a29e] dark:text-[#555]">Estado:</span>
          <AdminFilterChip
            label="Todos"
            active={statusFilter === ""}
            onClick={() => setStatusFilterWithUrl("")}
          />
          <AdminFilterChip
            label="Email por confirmar"
            active={statusFilter === "email-pendente"}
            count={counts.emailPendente}
            onClick={() =>
              setStatusFilterWithUrl(statusFilter === "email-pendente" ? "" : "email-pendente")
            }
          />
          <AdminFilterChip
            label="Sem funcionário"
            active={statusFilter === "sem-funcionario"}
            count={counts.semFuncionario}
            onClick={() =>
              setStatusFilterWithUrl(statusFilter === "sem-funcionario" ? "" : "sem-funcionario")
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Pesquisar por nome, email ou role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`min-w-[200px] max-w-sm ${adminTheme.input}`}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`max-w-[180px] ${adminTheme.input}`}
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
      </div>

      <UtilizadoresTable
        isLoading={isLoading}
        utilizadores={utilizadores}
        filtered={filtered}
        statusFilter={statusFilter}
        editingId={editingId}
        eliminandoId={eliminandoId}
        onToggleEditing={toggleEditing}
        onDelete={(id, nome) => setDeleteTarget({ id, nome })}
        onCloseEditor={() => setEditingId(null)}
      />

      <NovoUtilizadorModal
        open={novoModalOpen}
        onClose={() => setNovoModalOpen(false)}
        onCreated={() => setNovoModalOpen(false)}
      />

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="Eliminar utilizador"
        description={
          deleteTarget
            ? `Eliminar a conta «${deleteTarget.nome}»? A ação é irreversível e remove o acesso ao sistema.`
            : ""
        }
        confirmLabel="Eliminar"
        variant="danger"
        loading={!!deleteTarget && eliminandoId === deleteTarget.id}
        onClose={() => !eliminandoId && setDeleteTarget(null)}
        onConfirm={confirmEliminar}
      />
    </motion.div>
  );
}

export default function AdminUtilizadoresPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <AdminUtilizadoresContent />
    </Suspense>
  );
}
