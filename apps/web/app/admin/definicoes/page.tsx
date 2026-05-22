"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { getToken } from "@/app/lib/auth";
import { getLimparDados } from "@/app/lib/home";
import { clearAllDataAndRedirect, homeLimparDadosAndRedirect } from "@/app/lib/clearData";
import { runBackupNow, fetchBackups, type BackupResult } from "@/app/lib/admin";
import {
  AdminPageHeader,
  AdminCard,
  AdminSection,
  AdminConfirmDialog,
  AdminSystemHealth,
  adminTheme,
  buildBreadcrumbs,
} from "@/app/admin/_components";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

type ConfirmKind = "backup" | "clearAdmin" | "clearHome" | null;

/** Em produção a API Admin de limpeza total devolve 404 — não mostrar o botão. */
const isProduction = process.env.NODE_ENV === "production";

export default function AdminDefinicoesPage() {
  const token = getToken();
  const queryClient = useQueryClient();
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupResult, setBackupResult] = useState<BackupResult | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [clearLoading, setClearLoading] = useState(false);
  const [homeClearMessage, setHomeClearMessage] = useState<string | null>(null);

  const { data: backups = [], isLoading: loadingBackups, refetch: refetchBackups } = useQuery({
    queryKey: ["admin", "backups"],
    queryFn: () => fetchBackups(token!),
    enabled: !!token,
    staleTime: 30_000,
  });

  const runBackup = async () => {
    if (!token) return;
    setBackupLoading(true);
    setBackupResult(null);
    setBackupError(null);
    try {
      const result = await runBackupNow(token);
      setBackupResult(result);
      await queryClient.invalidateQueries({ queryKey: ["admin", "backups"] });
    } catch (e) {
      setBackupError(e instanceof Error ? e.message : "Erro ao executar backup.");
    } finally {
      setBackupLoading(false);
      setConfirmKind(null);
    }
  };

  const runClearAdmin = async () => {
    setClearLoading(true);
    try {
      await clearAllDataAndRedirect();
    } finally {
      setClearLoading(false);
      setConfirmKind(null);
    }
  };

  const runClearHome = async () => {
    setClearLoading(true);
    try {
      await homeLimparDadosAndRedirect();
    } finally {
      setClearLoading(false);
      setConfirmKind(null);
    }
  };

  const handleConfirm = async () => {
    if (confirmKind === "backup") await runBackup();
    else if (confirmKind === "clearAdmin") await runClearAdmin();
    else if (confirmKind === "clearHome") await runClearHome();
  };

  const openHomeClear = async () => {
    setHomeClearMessage(null);
    if (token) {
      try {
        const { message } = await getLimparDados(token);
        setHomeClearMessage(message);
      } catch {
        setHomeClearMessage("Será redirecionado e a sessão será terminada.");
      }
    } else {
      setHomeClearMessage("Reinicia dados e recria roles. Será redirecionado.");
    }
    setConfirmKind("clearHome");
  };

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const confirmCopy: Record<Exclude<ConfirmKind, null>, { title: string; description: string; label: string }> = {
    backup: {
      title: "Executar backup",
      description: "Criar uma cópia imediata da base de dados na pasta PirofafeData/Backups?",
      label: "Executar backup",
    },
    clearAdmin: {
      title: "Limpar todos os dados (Admin API)",
      description:
        "Apaga todos os dados e contas no servidor (apenas ambiente de desenvolvimento). Também limpa dados no browser. Será redirecionado para a página inicial. Esta ação é irreversível.",
      label: "Apagar tudo",
    },
    clearHome: {
      title: "Reiniciar dados (Home API)",
      description:
        homeClearMessage
          ? `${homeClearMessage}\n\nConfirmar? Será redirecionado para a página inicial.`
          : "Reinicia dados da aplicação via API Home. Será redirecionado. Confirmar?",
      label: "Reiniciar",
    },
  };

  const activeConfirm = confirmKind ? confirmCopy[confirmKind] : null;

  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={transitionSmooth}
      className="space-y-8"
    >
      <AdminPageHeader
        title="Definições"
        description="Backups e ações sensíveis. Utilize apenas quando tiver certeza do que está a fazer."
        breadcrumb={buildBreadcrumbs("/admin/definicoes")}
      />

      <AdminSection title="Sistema" description="Estado da API e ligação à base de dados.">
        <AdminSystemHealth />
      </AdminSection>

      <AdminSection title="Backups" description="Cópia de segurança manual da base de dados.">
        <AdminCard>
          <div className="space-y-4">
            <p className="text-sm text-[#57534e] dark:text-[#888]">
              Executa um backup imediato. O ficheiro é guardado em{" "}
              <code className="rounded bg-[#f1f5f9] px-1.5 py-0.5 font-mono text-xs text-[#475569] dark:bg-[#1e293b] dark:text-[#94a3b8]">
                PirofafeData/Backups
              </code>
              . Download e restauro ficam para uma fase posterior.
            </p>

            <button
              type="button"
              onClick={() => setConfirmKind("backup")}
              disabled={backupLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1c1917] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#292524] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-[#e7e5e4]"
            >
              {backupLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent" />
                  A executar…
                </>
              ) : (
                "Executar backup agora"
              )}
            </button>

            {backupResult && (
              <div className="flex items-start gap-3 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 dark:border-[#166534]/50 dark:bg-[#052e16]/40">
                <div>
                  <p className="text-sm font-medium text-[#166534] dark:text-[#4ade80]">{backupResult.message}</p>
                  <p className="mt-0.5 font-mono text-xs text-[#15803d] dark:text-[#86efac]">
                    {backupResult.nomeFicheiro}{" "}
                    <span className="opacity-70">({formatBytes(backupResult.tamanhoBytes)})</span>
                  </p>
                </div>
              </div>
            )}

            {backupError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {backupError}
              </div>
            )}

            <div className="border-t border-[#f0eeec] pt-4 dark:border-[#1a1a1a]">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#1c1917] dark:text-white">Histórico</h3>
                <button
                  type="button"
                  onClick={() => refetchBackups()}
                  className="text-xs font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
                >
                  Atualizar
                </button>
              </div>
              {loadingBackups ? (
                <p className="text-sm text-[#78716c] dark:text-[#888]">A carregar…</p>
              ) : backups.length === 0 ? (
                <p className="text-sm text-[#78716c] dark:text-[#888]">Nenhum ficheiro .bak na pasta.</p>
              ) : (
                <ul className="max-h-64 space-y-2 overflow-y-auto">
                  {backups.map((b) => (
                    <li
                      key={b.nomeFicheiro}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#f0eeec] bg-[#fafaf9] px-3 py-2 text-sm dark:border-[#222] dark:bg-[#0d0d0d]"
                    >
                      <span className="font-mono text-xs text-[#1c1917] dark:text-white">{b.nomeFicheiro}</span>
                      <span className="text-xs text-[#78716c] dark:text-[#888]">
                        {formatBytes(b.tamanhoBytes)}
                        {b.dataCriacao
                          ? ` · ${format(parseISO(b.dataCriacao), "d MMM yyyy HH:mm", { locale: pt })}`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection
        title="Zona de perigo"
        description="Apaga dados e contas. Apenas para testes ou reinício completo do ambiente."
      >
        <AdminCard variant="danger">
          <div className="space-y-6">
            <p className="text-sm text-red-800/90 dark:text-red-300/90">
              Estas ações são irreversíveis.
              {isProduction
                ? " Em produção, a limpeza via Admin API está desativada — use apenas o fluxo Home se o servidor o permitir."
                : " Em desenvolvimento pode usar Admin API ou Home API."}
            </p>

            <div className={`grid gap-4 ${isProduction ? "" : "sm:grid-cols-2"}`}>
              {!isProduction && (
                <div className="rounded-xl border border-red-200/80 bg-white/80 p-4 dark:border-red-900/50 dark:bg-[#111]/80">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Limpar dados (Admin API)
                  </h3>
                  <p className="mt-1 text-xs text-red-700/80 dark:text-red-400/80">
                    POST <code className="font-mono">/api/admin/clear-all-data</code> — servidor + browser.
                  </p>
                  <button
                    type="button"
                    onClick={() => setConfirmKind("clearAdmin")}
                    disabled={clearLoading}
                    className={`mt-3 ${adminTheme.btnDanger}`}
                  >
                    Limpar tudo (Admin)
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-amber-200/80 bg-white/80 p-4 dark:border-amber-800/50 dark:bg-[#111]/80">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Reiniciar (Home API)</h3>
                <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-400/80">
                  Fluxo via API Home — mensagem de confirmação do servidor antes de apagar.
                </p>
                <button
                  type="button"
                  onClick={openHomeClear}
                  disabled={clearLoading}
                  className="mt-3 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-50 disabled:opacity-50 dark:border-amber-700 dark:bg-[#111] dark:text-amber-400 dark:hover:bg-amber-950/40"
                >
                  Reiniciar dados (Home)
                </button>
              </div>
            </div>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title="Sobre o painel" description="Capacidades desta área.">
        <AdminCard>
          <ul className="space-y-2 text-sm text-[#57534e] dark:text-[#888]">
            <li>
              <strong className="text-[#1c1917] dark:text-white">Dashboard:</strong> contas, auditoria, bootstrap e
              totais de referência.
            </li>
            <li>
              <strong className="text-[#1c1917] dark:text-white">Utilizadores:</strong> filtros (email pendente, sem
              funcionário), roles e associação.
            </li>
            <li>
              <strong className="text-[#1c1917] dark:text-white">Logs:</strong> filtros, paginação, export CSV da página.
            </li>
            <li>
              <strong className="text-[#1c1917] dark:text-white">Backups:</strong> execução manual e histórico.
            </li>
          </ul>
        </AdminCard>
      </AdminSection>

      <AdminConfirmDialog
        open={!!activeConfirm}
        title={activeConfirm?.title ?? ""}
        description={activeConfirm?.description ?? ""}
        confirmLabel={activeConfirm?.label}
        variant={confirmKind === "backup" ? "default" : "danger"}
        loading={backupLoading || clearLoading}
        onClose={() => !backupLoading && !clearLoading && setConfirmKind(null)}
        onConfirm={handleConfirm}
      />
    </motion.div>
  );
}
