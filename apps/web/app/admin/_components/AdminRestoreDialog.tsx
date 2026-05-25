"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  nomeFicheiro: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AdminRestoreDialog({
  open,
  nomeFicheiro,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  const [confirmName, setConfirmName] = useState("");
  const nameMatches = confirmName.trim() === nomeFicheiro.trim();

  useEffect(() => {
    if (!open) setConfirmName("");
  }, [open, nomeFicheiro]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="admin-restore"
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
            className="w-full max-w-md rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-xl dark:border-[#222] dark:bg-[#111]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#1c1917] dark:text-white">
              Restaurar backup
            </h3>
            <p className="mt-2 text-sm text-[#57534e] dark:text-[#888]">
              A base de dados e os documentos em{" "}
              <code className="rounded bg-[#f1f5f9] px-1 font-mono text-[11px] dark:bg-[#1e293b]">Uploads</code> serão{" "}
              <strong className="text-[#1c1917] dark:text-white">substituídos</strong> pelo estado deste backup (se existir
              o ZIP de documentos associado). Tudo o que foi criado ou alterado depois perde-se.
            </p>
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 font-mono text-xs text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
              {nomeFicheiro}
            </p>
            <p className="mt-3 text-xs text-[#78716c] dark:text-[#666]">
              Após o restauro terá de voltar a iniciar sessão. Utilizadores, dados e PDFs voltam ao estado do backup.
            </p>
            <label className="mt-4 block text-sm font-medium text-[#57534e] dark:text-[#a3a3a3]">
              Digite o nome exacto do ficheiro .bak para confirmar
            </label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              disabled={loading}
              placeholder={nomeFicheiro}
              className="mt-1.5 w-full rounded-xl border border-[#e7e5e4] bg-white px-3 py-2 font-mono text-xs text-[#1c1917] outline-none focus:border-[#f97316] dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-[#e7e5e4] px-4 py-2 text-sm font-medium text-[#57534e] hover:bg-[#fafaf9] disabled:opacity-50 dark:border-[#333] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading || !nameMatches}
                className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "A restaurar…" : "Restaurar agora"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
