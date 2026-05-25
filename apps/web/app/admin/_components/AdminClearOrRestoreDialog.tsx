"use client";

import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import type { BackupListItem } from "@/app/lib/admin";

type Props = {
  open: boolean;
  title: string;
  latestBackup: BackupListItem | null;
  loading?: boolean;
  onClose: () => void;
  onRestore: () => void;
  onProceedClear: () => void;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminClearOrRestoreDialog({
  open,
  title,
  latestBackup,
  loading = false,
  onClose,
  onRestore,
  onProceedClear,
}: Props) {
  const dataLabel =
    latestBackup?.dataCriacao
      ? format(parseISO(latestBackup.dataCriacao), "d MMM yyyy, HH:mm", { locale: pt })
      : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="admin-clear-restore"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={loading ? undefined : onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-xl dark:border-[#222] dark:bg-[#111]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#1c1917] dark:text-white">{title}</h3>
            <p className="mt-2 text-sm text-[#57534e] dark:text-[#888]">
              Existe um backup recente. Pode <strong className="text-[#1c1917] dark:text-white">recuperar</strong> esse
              estado em vez de apagar tudo — é a forma mais simples de «desfazer» uma limpeza acidental.
            </p>

            {latestBackup && (
              <div className="mt-4 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 dark:border-[#166534]/50 dark:bg-[#052e16]/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#166534] dark:text-[#4ade80]">
                  Último backup
                </p>
                <p className="mt-1 font-mono text-xs text-[#15803d] dark:text-[#86efac]">
                  {latestBackup.nomeFicheiro}
                </p>
                <p className="mt-0.5 text-xs text-[#166534]/80 dark:text-[#4ade80]/80">
                  {formatBytes(latestBackup.tamanhoBytes)}
                  {dataLabel ? ` · ${dataLabel}` : ""}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="order-3 rounded-xl border border-[#e7e5e4] px-4 py-2.5 text-sm font-medium text-[#57534e] hover:bg-[#fafaf9] disabled:opacity-50 sm:order-1 dark:border-[#333] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onProceedClear}
                disabled={loading}
                className="order-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                Apagar mesmo assim
              </button>
              <button
                type="button"
                onClick={onRestore}
                disabled={loading || !latestBackup}
                className="order-1 rounded-xl bg-[#f97316] px-4 py-2.5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50 sm:order-3"
              >
                {loading ? "A processar…" : "Recuperar último backup"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
