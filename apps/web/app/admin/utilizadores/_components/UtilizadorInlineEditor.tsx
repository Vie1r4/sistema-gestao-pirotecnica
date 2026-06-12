"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { refreshSessionAfterRoleChange } from "@/app/lib/refreshSessionAfterRoleChange";
import {
  confirmEmailAdmin,
  fetchUtilizadorParaEditar,
  resendConfirmEmailAdmin,
  sendPasswordResetAdmin,
  updateUtilizador,
  updateUtilizadorCredenciais,
} from "@/app/lib/admin";
import { adminTheme } from "@/app/admin/_components";
import { ALL_ROLES, ROLE_COLORS } from "@/app/admin/utilizadores/_components/utilizadoresConstants";
import { useToastStore } from "@/app/stores/useToastStore";

type Props = {
  userId: string;
  email: string;
  emailConfirmed: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function UtilizadorInlineEditor({
  userId,
  email: initialEmail,
  emailConfirmed,
  onClose,
  onSaved,
}: Props) {
  const token = getToken();
  const queryClient = useQueryClient();
  const { refetch: refetchUser } = useUser();

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
      const assigned = roles.filter((r) => r.atribuido);
      if (assigned.length === 0) throw new Error("Selecione um cargo de acesso.");
      if (assigned.length > 1) throw new Error("Selecione apenas um cargo de acesso por utilizador.");
      return updateUtilizador(token, userId, {
        ...data.model,
        roles,
        funcionarioId: funcId,
      });
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "utilizadores"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "utilizador", userId] });
      await refreshSessionAfterRoleChange(queryClient, result.requiresTokenRefresh);
      if (result.requiresTokenRefresh) await refetchUser();
      onSaved();
    },
  });

  const toggleRole = (nome: string) => {
    setLocalRoles((prev) => {
      const list = prev ?? roles;
      const isOn = list.find((r) => r.nome === nome)?.atribuido ?? false;
      if (isOn) {
        return list.map((r) => (r.nome === nome ? { ...r, atribuido: false } : r));
      }
      return list.map((r) => ({ ...r, atribuido: r.nome === nome }));
    });
  };

  const runAccountAction = async (key: string, fn: () => Promise<string>, toastMsg?: string) => {
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
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#78716c] dark:text-[#666]">
            Cargo de acesso (um por utilizador)
          </p>
          <p className="mb-2 text-xs text-[#a8a29e] dark:text-[#666]">
            Apenas um cargo pode estar activo. O último administrador do sistema não pode ser removido.
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
                      <path
                        fillRule="evenodd"
                        d="M10.28 2.28a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 1.06-1.06L4.25 7.19l4.97-4.97a.75.75 0 0 1 1.06.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {role}
                </button>
              );
            })}
          </div>
        </div>

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
              <path
                fillRule="evenodd"
                d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                clipRule="evenodd"
              />
            </svg>
            Guardado
          </span>
        )}
      </div>
    </div>
  );
}
