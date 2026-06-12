"use client";

import { getToken } from "@/app/lib/auth";
import { downloadClienteDocumento, openClienteDocumento } from "@/app/lib/clientes";
import { useToastStore } from "@/app/stores/useToastStore";

type Props = {
  clienteId: string;
  extraId: string;
  label: string;
  fileName?: string;
};

export default function ClienteDocLink({ clienteId, extraId, label, fileName }: Props) {
  const handleOpen = async () => {
    const token = getToken();
    if (!token) return;
    try {
      await openClienteDocumento(token, clienteId, extraId);
    } catch {
      useToastStore.getState().show("Não foi possível abrir o documento.", "error");
    }
  };

  const handleDownload = async () => {
    const token = getToken();
    if (!token) return;
    try {
      await downloadClienteDocumento(token, clienteId, extraId, fileName || `${label}.pdf`);
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
