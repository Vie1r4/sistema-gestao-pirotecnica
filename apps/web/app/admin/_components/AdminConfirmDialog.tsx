"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  const confirmCls =
    variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
      : "bg-[#f97316] text-black hover:opacity-90";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="admin-confirm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={loading ? undefined : onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            aria-describedby="admin-confirm-desc"
            className="w-full max-w-md rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-xl dark:border-[#222] dark:bg-[#111]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="admin-confirm-title" className="text-lg font-semibold text-[#1c1917] dark:text-white">
              {title}
            </h3>
            <p id="admin-confirm-desc" className="mt-2 text-sm text-[#57534e] dark:text-[#888]">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-[#e7e5e4] px-4 py-2 text-sm font-medium text-[#57534e] hover:bg-[#fafaf9] disabled:opacity-50 dark:border-[#333] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a]"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 ${confirmCls}`}
              >
                {loading ? "A processar…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
