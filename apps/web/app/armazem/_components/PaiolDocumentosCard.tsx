"use client";

import { motion } from "framer-motion";
import { getToken } from "@/app/lib/auth";
import type { PaiolDocumentoExtra } from "@/app/lib/armazem";
import { openDocumento } from "@/app/lib/paiolApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { useToastStore } from "@/app/stores/useToastStore";
import { cardClass, sectionTitleClass } from "./armazemUi";

type Props = {
  paiolId: string;
  docs: PaiolDocumentoExtra[];
  delay?: number;
};

export default function PaiolDocumentosCard({ paiolId, docs, delay = 0.1 }: Props) {
  const handleOpen = (docId: string) => {
    const token = getToken();
    const numId = parseInt(paiolId, 10);
    const extraId = parseInt(docId, 10);
    if (token && !Number.isNaN(numId) && !Number.isNaN(extraId)) {
      openDocumento(token, numId, extraId).catch(() =>
        useToastStore.getState().show("Não foi possível abrir o documento.", "error")
      );
    }
  };

  return (
    <motion.section
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...transitionSmooth, delay }}
      className={`mt-6 ${cardClass}`}
    >
      <h2 className={sectionTitleClass}>Documentação</h2>
      <div className="mt-4 space-y-2">
        {docs.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum documento guardado.</p>
        ) : (
          docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-[#222]"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">{doc.nome || "Documento"}</span>
              <button
                type="button"
                onClick={() => handleOpen(doc.id)}
                className="text-sm text-[#f97316] transition-[color] duration-200 hover:underline"
              >
                Ver documento
              </button>
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
}
