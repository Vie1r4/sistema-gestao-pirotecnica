"use client";

import { getToken } from "@/app/lib/auth";
import { downloadFuncionarioDocumento, openFuncionarioDocumento } from "@/app/lib/funcionariosApi";
import { useToastStore } from "@/app/stores/useToastStore";

type Props = {
  funcionarioId: string;
  label: string;
  tipo: string;
  extraId?: string;
  fileName?: string;
};

export default function FuncionarioDocLink({ funcionarioId, label, tipo, extraId, fileName }: Props) {
  const handleOpen = async () => {
    const token = getToken();
    if (!token) return;
    try {
      await openFuncionarioDocumento(token, funcionarioId, tipo, extraId);
    } catch {
      useToastStore.getState().show("Não foi possível abrir o documento.", "error");
    }
  };

  const handleDownload = async () => {
    const token = getToken();
    if (!token) return;
    try {
      await downloadFuncionarioDocumento(token, funcionarioId, tipo, fileName || `${label}.pdf`, extraId);
    } catch {
      useToastStore.getState().show("Não foi possível transferir o documento.", "error");
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-[#222] px-3 py-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleOpen}
          data-button
          className="text-sm text-[#f97316] transition-[color] duration-200 hover:underline"
        >
          Abrir
        </button>
        <button
          type="button"
          onClick={handleDownload}
          data-button
          className="text-sm text-[#f97316] transition-[color] duration-200 hover:underline"
        >
          Transferir
        </button>
      </div>
    </div>
  );
}
