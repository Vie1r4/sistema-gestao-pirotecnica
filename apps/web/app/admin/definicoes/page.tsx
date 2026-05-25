"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { getToken } from "@/app/lib/auth";
import { clearAllDataAndRedirect } from "@/app/lib/clearData";
import {
  runBackupNow,
  fetchBackups,
  downloadBackup,
  restoreBackup,
  deleteBackup,
  type BackupResult,
  type BackupListItem,
} from "@/app/lib/admin";
import { useToastStore } from "@/app/stores/useToastStore";
import {
  AdminPageHeader,
  AdminCard,
  AdminSection,
  AdminConfirmDialog,
  AdminSystemHealth,
  adminTheme,
  buildBreadcrumbs,
} from "@/app/admin/_components";
import AdminRestoreDialog from "@/app/admin/_components/AdminRestoreDialog";
import AdminClearOrRestoreDialog from "@/app/admin/_components/AdminClearOrRestoreDialog";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { isClearDataUiEnabled } from "@/app/admin/lib/devOnly";

type ConfirmKind = "backup" | "clearAdmin" | "deleteBackup" | null;

const LOCAL_KEYS = [
  "token",
  "pirofafe-user",
  "pirofafe-user-name",
  "pirofafe-users",
  "pirofafe-theme",
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function redirectAfterRestore() {
  try {
    for (const key of LOCAL_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
  window.location.href = "/login?restored=1";
}

export default function AdminDefinicoesPage() {
  const token = getToken();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);

  const [backupLoading, setBackupLoading] = useState(false);
  const [backupResult, setBackupResult] = useState<BackupResult | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [showClearGate, setShowClearGate] = useState(false);
  const [restoreFile, setRestoreFile] = useState<string | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [downloadFile, setDownloadFile] = useState<string | null>(null);
  const [downloadDocsFile, setDownloadDocsFile] = useState<string | null>(null);
  const [clearLoading, setClearLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: backupsData, isLoading: loadingBackups, refetch: refetchBackups } = useQuery({
    queryKey: ["admin", "backups"],
    queryFn: () => fetchBackups(token!),
    enabled: !!token,
    staleTime: 30_000,
  });

  const backups = backupsData?.items ?? [];
  const backupResumo = backupsData?.resumo;
  const latestBackup = backups[0] ?? null;
  const temBackupsEmDisco = backups.length > 0;

  const runBackup = async () => {
    if (!token) return;
    setBackupLoading(true);
    setBackupResult(null);
    setBackupError(null);
    try {
      const result = await runBackupNow(token);
      setBackupResult(result);
      showToast("Backup criado com sucesso.", "success");
      await queryClient.invalidateQueries({ queryKey: ["admin", "backups"] });
    } catch (e) {
      setBackupError(e instanceof Error ? e.message : "Erro ao executar backup.");
    } finally {
      setBackupLoading(false);
      setConfirmKind(null);
    }
  };

  const runRestore = async (nomeFicheiro: string) => {
    if (!token) return;
    setRestoreLoading(true);
    try {
      const result = await restoreBackup(token, nomeFicheiro);
      showToast(result.message, "success");
      setRestoreFile(null);
      setShowClearGate(false);
      redirectAfterRestore();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro ao restaurar.", "error");
    } finally {
      setRestoreLoading(false);
    }
  };

  const runDownload = async (nomeFicheiro: string, kind: "db" | "docs" = "db") => {
    if (!token) return;
    if (kind === "docs") setDownloadDocsFile(nomeFicheiro);
    else setDownloadFile(nomeFicheiro);
    try {
      await downloadBackup(token, nomeFicheiro);
      showToast("Download iniciado.", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro ao descarregar.", "error");
    } finally {
      setDownloadFile(null);
      setDownloadDocsFile(null);
    }
  };

  const runClearAdmin = async () => {
    setClearLoading(true);
    try {
      await clearAllDataAndRedirect();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro ao limpar dados.", "error");
      setClearLoading(false);
      setConfirmKind(null);
      setShowClearGate(false);
    }
  };

  const handleConfirm = async () => {
    if (confirmKind === "backup") await runBackup();
    else if (confirmKind === "clearAdmin") await runClearAdmin();
    else if (confirmKind === "deleteBackup" && deleteTarget) await runDeleteBackup(deleteTarget);
  };

  const runDeleteBackup = async (nomeFicheiro: string) => {
    if (!token) return;
    setDeleteLoading(true);
    try {
      await deleteBackup(token, nomeFicheiro);
      showToast("Backup apagado.", "success");
      setDeleteTarget(null);
      setConfirmKind(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "backups"] });
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro ao apagar backup.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const startClearAdmin = () => {
    if (temBackupsEmDisco) setShowClearGate(true);
    else setConfirmKind("clearAdmin");
  };

  const confirmCopy: Record<Exclude<ConfirmKind, null>, { title: string; description: string; label: string }> =
    useMemo(
      () => ({
        backup: {
          title: "Executar backup completo",
          description:
            "Criar cópia da base de dados (.bak) e dos documentos em Uploads (.zip) em PirofafeData/Backups?",
          label: "Executar backup",
        },
        clearAdmin: {
          title: "Limpar todos os dados",
          description:
            "Apaga base de dados, documentos em Uploads, contas e sessões. Repõe as roles vazias. Também limpa o browser. Os ficheiros .bak em disco mantêm-se — pode recuperar depois de criar conta. (Só em desenvolvimento na API.)",
          label: "Apagar tudo",
        },
        deleteBackup: {
          title: "Apagar este backup?",
          description: deleteTarget
            ? `Remove ${deleteTarget} e o ZIP de documentos associado (se existir). Não pode ser recuperado.`
            : "",
          label: "Apagar backup",
        },
      }),
      [deleteTarget]
    );

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
        description="Backup completo (BD + documentos), restauro e ações sensíveis."
        breadcrumb={buildBreadcrumbs("/admin/definicoes")}
      />

      <AdminSection title="Sistema" description="Estado da API e ligação à base de dados.">
        <AdminSystemHealth />
      </AdminSection>

      <AdminSection
        title="Backups"
        description="Cópia de segurança da base de dados e dos PDFs/documentos em Uploads."
      >
        <AdminCard>
          <div className="space-y-4">
            <p className="text-sm text-[#57534e] dark:text-[#888]">
              Cada backup gera dois ficheiros em{" "}
              <code className="rounded bg-[#f1f5f9] px-1 font-mono text-xs dark:bg-[#1e293b]">PirofafeData/Backups</code>
              : <code className="rounded bg-[#f1f5f9] px-1 font-mono text-xs dark:bg-[#1e293b]">.bak</code> (base de dados —
              clientes, encomendas, contas, etc.) e{" "}
              <code className="rounded bg-[#f1f5f9] px-1 font-mono text-xs dark:bg-[#1e293b]">_uploads.zip</code> (PDFs e
              documentos de clientes, funcionários, paióis e serviços).{" "}
              <strong className="text-[#1c1917] dark:text-white">Restaurar</strong> repõe os dois. A app continua normal até
              restaurar.
            </p>
            <p className="text-sm text-[#57534e] dark:text-[#888]">
              RPO/RTO e teste de restauro (BD + documentos):{" "}
              <code className="rounded bg-[#f1f5f9] px-1 font-mono text-xs dark:bg-[#1e293b]">Docs/OPERACOES.md</code> e{" "}
              <code className="rounded bg-[#f1f5f9] px-1 font-mono text-xs dark:bg-[#1e293b]">
                scripts/test-restore-backup-rpo.ps1
              </code>
              .
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
                    BD: {backupResult.nomeFicheiro}{" "}
                    <span className="opacity-70">({formatBytes(backupResult.tamanhoBytes)})</span>
                  </p>
                  {backupResult.nomeFicheiroDocumentos && (
                    <p className="mt-0.5 font-mono text-xs text-[#15803d] dark:text-[#86efac]">
                      Docs: {backupResult.nomeFicheiroDocumentos}{" "}
                      <span className="opacity-70">
                        ({formatBytes(backupResult.tamanhoDocumentosBytes ?? 0)})
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {backupError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {backupError}
              </div>
            )}

            {backupResumo?.backupsDeInstalacaoAnterior && (
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
                <p className="font-medium">Backups de uma instalação anterior</p>
                <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-300/90">
                  A base de dados está vazia (sem contas), mas existem {backupResumo.total} ficheiro(s) .bak em
                  disco — normalmente de antes de «Limpar tudo». Pode restaurar para recuperar esse estado ou apagar
                  backups que já não precisa.
                </p>
              </div>
            )}

            <div className="border-t border-[#f0eeec] pt-4 dark:border-[#1a1a1a]">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
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
                <p className="text-sm text-[#78716c] dark:text-[#888]">
                  Nenhum backup ainda. Crie um antes de limpar dados — assim pode recuperar depois.
                </p>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto">
                  {backups.map((b) => (
                    <BackupRow
                      key={b.nomeFicheiro}
                      item={b}
                      isLatest={b.nomeFicheiro === latestBackup?.nomeFicheiro}
                      downloadLoading={downloadFile === b.nomeFicheiro}
                      downloadDocsLoading={downloadDocsFile === b.nomeFicheiroDocumentos}
                      onDownloadDb={() => runDownload(b.nomeFicheiro, "db")}
                      onDownloadDocs={() =>
                        b.nomeFicheiroDocumentos && runDownload(b.nomeFicheiroDocumentos, "docs")
                      }
                      onRestore={() => setRestoreFile(b.nomeFicheiro)}
                      onDelete={() => {
                        setDeleteTarget(b.nomeFicheiro);
                        setConfirmKind("deleteBackup");
                      }}
                      deleteLoading={deleteLoading && deleteTarget === b.nomeFicheiro}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </AdminCard>
      </AdminSection>

      {isClearDataUiEnabled() && (
      <AdminSection
        title="Zona de perigo"
        description="Apagar dados. Se já tiver backup, pode recuperar em vez de perder tudo."
      >
        <AdminCard variant="danger">
          <div className="space-y-6">
            {temBackupsEmDisco && latestBackup && (
              <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4]/80 p-4 dark:border-[#166534]/40 dark:bg-[#052e16]/20">
                <p className="text-sm text-[#166534] dark:text-[#4ade80]">
                  {backupResumo?.backupsDeInstalacaoAnterior
                    ? "Há backups em disco (instalação anterior):"
                    : "Tem backup disponível:"}{" "}
                  <span className="font-mono text-xs">{latestBackup.nomeFicheiro}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setRestoreFile(latestBackup.nomeFicheiro)}
                  disabled={restoreLoading}
                  className="mt-3 rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
                >
                  Recuperar último backup
                </button>
              </div>
            )}

            <p className="text-sm text-red-800/90 dark:text-red-300/90">
              Limpar dados é irreversível sem backup. A API só aceita esta operação com o servidor em ambiente de
              desenvolvimento.
            </p>

            <div className="rounded-xl border border-red-200/80 bg-white/80 p-4 dark:border-red-900/50 dark:bg-[#111]/80">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Limpar todos os dados</h3>
              <p className="mt-1 text-xs text-red-700/80 dark:text-red-400/80">
                Apaga BD, PDFs/documentos, contas e tokens; repõe roles para poder voltar a registar. Se existir backup,
                pode recuperar antes de confirmar.
              </p>
              <button
                type="button"
                onClick={startClearAdmin}
                disabled={clearLoading}
                className={`mt-3 ${adminTheme.btnDanger}`}
              >
                Limpar tudo
              </button>
            </div>
          </div>
        </AdminCard>
      </AdminSection>
      )}

      <AdminClearOrRestoreDialog
        open={showClearGate}
        title="Limpar todos os dados?"
        latestBackup={latestBackup}
        loading={restoreLoading || clearLoading}
        onClose={() => !restoreLoading && !clearLoading && setShowClearGate(false)}
        onRestore={() => {
          if (latestBackup) setRestoreFile(latestBackup.nomeFicheiro);
        }}
        onProceedClear={() => {
          setShowClearGate(false);
          setConfirmKind("clearAdmin");
        }}
      />

      <AdminRestoreDialog
        open={!!restoreFile}
        nomeFicheiro={restoreFile ?? ""}
        loading={restoreLoading}
        onClose={() => !restoreLoading && setRestoreFile(null)}
        onConfirm={() => restoreFile && runRestore(restoreFile)}
      />

      <AdminConfirmDialog
        open={!!activeConfirm}
        title={activeConfirm?.title ?? ""}
        description={activeConfirm?.description ?? ""}
        confirmLabel={activeConfirm?.label}
        variant={confirmKind === "backup" ? "default" : "danger"}
        loading={backupLoading || clearLoading || deleteLoading}
        onClose={() => !backupLoading && !clearLoading && !deleteLoading && setConfirmKind(null)}
        onConfirm={handleConfirm}
      />
    </motion.div>
  );
}

function BackupRow({
  item,
  isLatest,
  downloadLoading,
  downloadDocsLoading,
  onDownloadDb,
  onDownloadDocs,
  onRestore,
  onDelete,
  deleteLoading,
}: {
  item: BackupListItem;
  isLatest: boolean;
  downloadLoading: boolean;
  downloadDocsLoading: boolean;
  onDownloadDb: () => void;
  onDownloadDocs: () => void;
  onRestore: () => void;
  onDelete: () => void;
  deleteLoading: boolean;
}) {
  const totalBytes = item.tamanhoBytes + (item.tamanhoDocumentosBytes ?? 0);
  const dataLabel = item.dataCriacao
    ? format(parseISO(item.dataCriacao), "d MMM yyyy, HH:mm", { locale: pt })
    : null;

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-[#f0eeec] bg-[#fafaf9] p-3 sm:flex-row sm:items-center sm:justify-between dark:border-[#222] dark:bg-[#0d0d0d]">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-mono text-xs text-[#1c1917] dark:text-white">{item.nomeFicheiro}</span>
          {isLatest && (
            <span className="shrink-0 rounded-full bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#ea580c] dark:bg-[#431407]/50 dark:text-[#fb923c]">
              Mais recente
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-[#78716c] dark:text-[#888]">
          {formatBytes(totalBytes)} total
          {item.temDocumentos
            ? ` · BD ${formatBytes(item.tamanhoBytes)} + docs ${formatBytes(item.tamanhoDocumentosBytes)}`
            : ` · só BD`}
          {dataLabel ? ` · ${dataLabel}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={onDownloadDb}
          disabled={downloadLoading}
          className={adminTheme.btnSecondary}
        >
          {downloadLoading ? "…" : "BD (.bak)"}
        </button>
        {item.temDocumentos && item.nomeFicheiroDocumentos && (
          <button
            type="button"
            onClick={onDownloadDocs}
            disabled={downloadDocsLoading}
            className={adminTheme.btnSecondary}
          >
            {downloadDocsLoading ? "…" : "Docs (.zip)"}
          </button>
        )}
        <button
          type="button"
          onClick={onRestore}
          className="rounded-xl bg-[#f97316] px-3 py-2 text-xs font-semibold text-black hover:opacity-90"
        >
          Restaurar
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleteLoading}
          className="rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          {deleteLoading ? "…" : "Apagar"}
        </button>
      </div>
    </li>
  );
}
