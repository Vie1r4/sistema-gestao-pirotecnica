"use client";

import { Fragment, Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getToken } from "@/app/lib/auth";
import {
  fetchUtilizadores,
  fetchUtilizadorParaEditar,
  fetchCriarUtilizadorOpcoes,
  createUtilizador,
  updateUtilizador,
  deleteUtilizador,
  resendConfirmEmailAdmin,
  confirmEmailAdmin,
  sendPasswordResetAdmin,
  updateUtilizadorCredenciais,
  type UtilizadorComRoles,
} from "@/app/lib/admin";
import {
  AdminPageHeader,
  AdminCard,
  AdminConfirmDialog,
  AdminEmptyState,
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
import { useToastStore } from "@/app/stores/useToastStore";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

/* ── Constantes ────────────────────────────────────────── */
const ALL_ROLES = ["Admin", "Gestor", "Comercial", "Armazém"];

const ROLE_COLORS: Record<string, string> = {
  Admin:    "bg-[#f5f3ff] text-[#7c3aed] dark:bg-[#2e1065]/50 dark:text-[#c4b5fd]",
  Gestor:   "bg-[#f0fdf4] text-[#16a34a] dark:bg-[#052e16]/50 dark:text-[#86efac]",
  Comercial:"bg-[#eff6ff] text-[#2563eb] dark:bg-[#1e3a5f]/50 dark:text-[#93c5fd]",
  Armazém:  "bg-[#fefce8] text-[#ca8a04] dark:bg-[#422006]/50 dark:text-[#fde047]",
};

/* ── Avatar com iniciais ─────────────────────────────────── */
function UserAvatar({ name, roles }: { name: string; roles: string[] }) {
  const initials = name
    .split(/[\s._@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const bg = roles.includes("Admin")
    ? "bg-[#f5f3ff] text-[#7c3aed] dark:bg-[#2e1065]/60 dark:text-[#c4b5fd]"
    : roles.includes("Gestor")
    ? "bg-[#f0fdf4] text-[#16a34a] dark:bg-[#052e16]/60 dark:text-[#86efac]"
    : "bg-[#f1f5f9] text-[#475569] dark:bg-[#1e293b] dark:text-[#94a3b8]";

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${bg}`}
    >
      {initials || "?"}
    </div>
  );
}

/* ── Modal novo utilizador ─────────────────────────────── */
function NovoUtilizadorModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const token = getToken();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rolesSel, setRolesSel] = useState<string[]>([]);
  const [funcionarioId, setFuncionarioId] = useState<number | "">("");
  const [enviarEmail, setEnviarEmail] = useState(true);

  useEffect(() => {
    if (open) {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRolesSel([]);
      setFuncionarioId("");
      setEnviarEmail(true);
    }
  }, [open]);

  const { data: opcoes, isLoading } = useQuery({
    queryKey: ["admin", "utilizadores", "criar-opcoes"],
    queryFn: async () => {
      if (!token) throw new Error("Sem sessão.");
      return fetchCriarUtilizadorOpcoes(token);
    },
    enabled: open && !!token,
    staleTime: 60_000,
  });

  const rolesDisponiveis = opcoes?.roles.length ? opcoes.roles : ALL_ROLES;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Sem sessão.");
      await createUtilizador(token, {
        email: email.trim(),
        password,
        confirmPassword,
        roles: rolesSel,
        funcionarioId: funcionarioId === "" ? null : Number(funcionarioId),
        enviarEmailConfirmacao: enviarEmail,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      useToastStore.getState().show("Conta criada com sucesso.", "success");
      onCreated();
      onClose();
    },
    onError: (e) => {
      useToastStore.getState().show(
        e instanceof Error ? e.message : "Erro ao criar conta.",
        "error"
      );
    },
  });

  const toggleRole = (role: string) => {
    setRolesSel((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/40"
        onClick={() => !createMutation.isPending && onClose()}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-xl dark:border-[#333] dark:bg-[#111]">
        <h2 className="text-lg font-semibold text-[#1c1917] dark:text-white">Novo utilizador</h2>
        <p className="mt-1 text-sm text-[#78716c] dark:text-[#888]">
          Criar conta de acesso. Opcionalmente associe a um funcionário sem conta.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={adminTheme.input}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                  Palavra-passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={adminTheme.input}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                  Confirmar
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={adminTheme.input}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                Roles
              </p>
              <div className="flex flex-wrap gap-2">
                {rolesDisponiveis.map((role) => {
                  const checked = rolesSel.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-all ${
                        checked
                          ? `${ROLE_COLORS[role] ?? ""} border-transparent`
                          : "border-[#e7e5e4] bg-white text-[#a8a29e] dark:border-[#333] dark:bg-[#0a0a0a]"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                Funcionário (opcional)
              </label>
              <select
                value={funcionarioId}
                onChange={(e) =>
                  setFuncionarioId(e.target.value === "" ? "" : Number(e.target.value))
                }
                className={adminTheme.input}
              >
                <option value="">— Nenhum —</option>
                {(opcoes?.funcionariosDisponiveis ?? []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nomeCompleto}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-[#57534e] dark:text-[#a3a3a3]">
              <input
                type="checkbox"
                checked={enviarEmail}
                onChange={(e) => setEnviarEmail(e.target.checked)}
                className="rounded border-[#d4d0cc]"
              />
              Enviar email de confirmação
            </label>
            {createMutation.isError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Erro ao criar."}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="rounded-xl border border-[#e7e5e4] px-4 py-2 text-sm font-medium dark:border-[#333]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={createMutation.isPending || isLoading || !email.trim() || !password}
            onClick={() => createMutation.mutate()}
            className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {createMutation.isPending ? "A criar…" : "Criar conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Inline editor ─────────────────────────────────────── */
function InlineEditor({
  userId,
  email: initialEmail,
  emailConfirmed,
  onClose,
  onSaved,
}: {
  userId: string;
  email: string;
  emailConfirmed: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const token = getToken();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "utilizador", userId],
    queryFn: async () => {
      if (!token) throw new Error("Sem sessão.");
      return fetchUtilizadorParaEditar(token, userId);
    },
    enabled: !!token,
    staleTime: 0,
  });

  const [localRoles, setLocalRoles] = useState<{ nome: string; atribuido: boolean }[] | null>(null);
  const [localFuncId, setLocalFuncId] = useState<number | null | undefined>(undefined);
  const [novoEmail, setNovoEmail] = useState(initialEmail);
  const [accountBusy, setAccountBusy] = useState<string | null>(null);

  useEffect(() => {
    setNovoEmail(initialEmail);
  }, [initialEmail]);

  // Sync quando os dados chegam
  useEffect(() => {
    if (data && localRoles === null) {
      setLocalRoles(data.model.roles);
      setLocalFuncId(data.model.funcionarioId);
    }
  }, [data, localRoles]);

  const roles = localRoles ?? data?.model.roles ?? [];
  const funcId = localFuncId !== undefined ? localFuncId : (data?.model.funcionarioId ?? null);
  const funcionariosDisponiveis = data?.funcionariosDisponiveis ?? [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!token || !data) throw new Error("Sem dados.");
      await updateUtilizador(token, userId, {
        ...data.model,
        roles,
        funcionarioId: funcId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "utilizadores"] });
      onSaved();
    },
  });

  const toggleRole = (nome: string) => {
    setLocalRoles((prev) =>
      (prev ?? roles).map((r) =>
        r.nome === nome ? { ...r, atribuido: !r.atribuido } : r
      )
    );
  };

  const runAccountAction = async (
    key: string,
    fn: () => Promise<string>,
    toastMsg?: string
  ) => {
    if (!token) return;
    setAccountBusy(key);
    try {
      const msg = await fn();
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      useToastStore.getState().show(toastMsg ?? msg, "success");
    } catch (e) {
      useToastStore.getState().show(
        e instanceof Error ? e.message : "Operação falhou.",
        "error"
      );
    } finally {
      setAccountBusy(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        <span className="text-sm text-[#78716c] dark:text-[#888]">A carregar…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-5 py-4 text-sm text-red-600 dark:text-red-400">
        {error instanceof Error ? error.message : "Erro ao carregar utilizador."}
      </div>
    );
  }

  return (
    <div className="border-t border-[#f0eeec] bg-[#fafaf9] px-5 py-4 dark:border-[#1a1a1a] dark:bg-[#0d0d0d]">
      <div className="mb-6 rounded-xl border border-[#e7e5e4] bg-white p-4 dark:border-[#333] dark:bg-[#111]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#78716c] dark:text-[#666]">
          Conta e credenciais
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs text-[#78716c]">Email da conta</label>
            <input
              type="email"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              className={adminTheme.input}
            />
          </div>
          <button
            type="button"
            disabled={accountBusy !== null || novoEmail.trim() === initialEmail.trim()}
            onClick={() =>
              runAccountAction("email", () =>
                updateUtilizadorCredenciais(token!, userId, novoEmail.trim())
              )
            }
            className="rounded-xl border border-[#e7e5e4] px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-[#333]"
          >
            {accountBusy === "email" ? "…" : "Guardar email"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {!emailConfirmed && (
            <>
              <button
                type="button"
                disabled={accountBusy !== null}
                onClick={() =>
                  runAccountAction("resend", () => resendConfirmEmailAdmin(token!, userId))
                }
                className="rounded-xl bg-[#eff6ff] px-3 py-1.5 text-xs font-medium text-[#2563eb] disabled:opacity-50 dark:bg-[#1e3a5f]/50 dark:text-[#93c5fd]"
              >
                {accountBusy === "resend" ? "…" : "Reenviar confirmação"}
              </button>
              <button
                type="button"
                disabled={accountBusy !== null}
                onClick={() =>
                  runAccountAction("confirm", () => confirmEmailAdmin(token!, userId))
                }
                className="rounded-xl bg-[#f0fdf4] px-3 py-1.5 text-xs font-medium text-[#16a34a] disabled:opacity-50 dark:bg-[#052e16]/50 dark:text-[#86efac]"
              >
                {accountBusy === "confirm" ? "…" : "Marcar como confirmado"}
              </button>
            </>
          )}
          <button
            type="button"
            disabled={accountBusy !== null}
            onClick={() =>
              runAccountAction("reset", () => sendPasswordResetAdmin(token!, userId))
            }
            className="rounded-xl bg-[#fef3c7] px-3 py-1.5 text-xs font-medium text-[#92400e] disabled:opacity-50 dark:bg-[#451a03]/50 dark:text-[#fbbf24]"
          >
            {accountBusy === "reset" ? "…" : "Enviar reset de palavra-passe"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-8">
        {/* Roles */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#78716c] dark:text-[#666]">
            Cargos (roles)
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map((role) => {
              const checked = roles.find((r) => r.nome === role)?.atribuido ?? false;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all ${
                    checked
                      ? `${ROLE_COLORS[role] ?? ""} border-transparent`
                      : "border-[#e7e5e4] bg-white text-[#a8a29e] hover:border-[#d4d0cc] dark:border-[#333] dark:bg-[#111] dark:text-[#555] dark:hover:border-[#444]"
                  }`}
                >
                  {checked && (
                    <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3">
                      <path fillRule="evenodd" d="M10.28 2.28a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 1.06-1.06L4.25 7.19l4.97-4.97a.75.75 0 0 1 1.06.06Z" clipRule="evenodd" />
                    </svg>
                  )}
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        {/* Funcionário */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#78716c] dark:text-[#666]">
            Funcionário associado
          </p>
          <select
            value={funcId ?? ""}
            onChange={(e) => setLocalFuncId(e.target.value === "" ? null : Number(e.target.value))}
            className="rounded-xl border border-[#e7e5e4] bg-white px-3 py-2 text-sm text-[#1c1917] focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#111] dark:text-white"
          >
            <option value="">— Nenhum —</option>
            {funcionariosDisponiveis.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nomeCompleto}
              </option>
            ))}
          </select>
        </div>
      </div>

      {saveMutation.isError && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {saveMutation.error instanceof Error ? saveMutation.error.message : "Erro ao guardar."}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
        >
          {saveMutation.isPending ? "A guardar…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-[#e7e5e4] px-4 py-2 text-sm font-medium text-[#57534e] hover:bg-white dark:border-[#333] dark:text-[#a3a3a3] dark:hover:bg-[#111]"
        >
          Cancelar
        </button>
        {saveMutation.isSuccess && (
          <span className="flex items-center gap-1 text-sm text-[#16a34a] dark:text-[#4ade80]">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
            </svg>
            Guardado
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Página ─────────────────────────────────────────────── */
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

      {/* Tabela */}
      <AdminCard padding={false} className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            title={
              utilizadores.length === 0
                ? "Nenhum utilizador registado"
                : "Nenhum resultado"
            }
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
                  <th className="px-4 py-3 font-semibold text-[#57534e] dark:text-[#888]">
                    Utilizador
                  </th>
                  <th className="px-4 py-3 font-semibold text-[#57534e] dark:text-[#888]">
                    Roles
                  </th>
                  <th className="px-4 py-3 font-semibold text-[#57534e] dark:text-[#888]">
                    Email
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-[#57534e] dark:text-[#888]">
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
                            <span className="font-medium text-[#1c1917] dark:text-white">
                              {u.userName}
                            </span>
                            <br />
                            <span className="text-xs text-[#78716c] dark:text-[#666]">
                              {u.email}
                            </span>
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
                            <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3">
                              <path fillRule="evenodd" d="M10.28 2.28a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 1.06-1.06L4.25 7.19l4.97-4.97a.75.75 0 0 1 1.06.06Z" clipRule="evenodd" />
                            </svg>
                            Confirmado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-2 py-0.5 text-xs font-medium text-[#92400e] dark:bg-[#451a03]/60 dark:text-[#fbbf24]">
                            <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3">
                              <path fillRule="evenodd" d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1ZM5.25 4.75a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0v-2.5ZM6 9a.75.75 0 1 1 0-1.5A.75.75 0 0 1 6 9Z" clipRule="evenodd" />
                            </svg>
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleEditing(u.id)}
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
                            onClick={() => setDeleteTarget({ id: u.id, nome: u.userName })}
                            disabled={eliminandoId === u.id}
                            className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                          >
                            {eliminandoId === u.id ? "…" : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Linha de edição inline */}
                    <AnimatePresence>
                      {editingId === u.id && (
                        <motion.tr
                          key={`${u.id}-edit`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <td
                            colSpan={4}
                            className="border-b border-[#e7e5e4] p-0 dark:border-[#222]"
                          >
                            <InlineEditor
                              userId={u.id}
                              email={u.email}
                              emailConfirmed={u.emailConfirmed}
                              onClose={() => setEditingId(null)}
                              onSaved={() => setEditingId(null)}
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
