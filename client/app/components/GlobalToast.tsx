"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/app/stores/useToastStore";

export default function GlobalToast() {
  const { message, type, visible, hide } = useToastStore();

  useEffect(() => {
    return () => {
      useToastStore.getState().hide();
    };
  }, []);

  const bgClass =
    type === "error"
      ? "bg-red-600 text-white dark:bg-red-700"
      : type === "success"
        ? "bg-green-600 text-white dark:bg-green-700"
        : "bg-gray-800 text-white dark:bg-gray-700";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] flex items-end justify-end p-4 sm:p-6"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {visible && message && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`pointer-events-auto max-w-md rounded-xl px-4 py-3 shadow-lg ${bgClass}`}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <p className="flex-1 text-sm font-medium">{message}</p>
              <button
                type="button"
                onClick={hide}
                className="shrink-0 rounded p-1 opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Fechar"
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
