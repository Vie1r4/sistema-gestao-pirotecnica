"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/app/lib/auth";
import { createUtilizador, fetchCriarUtilizadorOpcoes } from "@/app/lib/admin";
import { adminTheme } from "@/app/admin/_components";
import { ALL_ROLES, ROLE_COLORS } from "@/app/admin/utilizadores/_components/utilizadoresConstants";
import { useToastStore } from "@/app/stores/useToastStore";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function NovoUtilizadorModal({ open, onClose, onCreated }: Props) {
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
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#78716c]">Roles</p>
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
