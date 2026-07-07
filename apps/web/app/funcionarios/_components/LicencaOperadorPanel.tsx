"use client";

import type { RefObject } from "react";
import {
  classeBadgeEstadoLicenca,
  rotuloEstadoLicenca,
  type EstadoLicencaOperador,
} from "@/app/lib/licencaOperadorConformidade";
import { FILE_ACCEPT_LICENCA } from "@/app/lib/licencaOperadorForm";
import { inputClass, labelClass } from "@/app/components/ui/tokens";

type Props = {
  mode: "create" | "edit";
  numeroCredencial: string;
  onNumeroCredencialChange: (value: string) => void;
  dataValidade: string;
  onDataValidadeChange: (value: string) => void;
  /** Create: ref no input file. Edit: ficheiro em memória. */
  fileInputRef?: RefObject<HTMLInputElement | null>;
  licFile?: File | null;
  onLicFileChange?: (file: File | null) => void;
  existingDoc?: boolean;
  removerDoc?: boolean;
  onRemoverDocChange?: (value: boolean) => void;
  estado?: EstadoLicencaOperador;
  fileInputId?: string;
};

export default function LicencaOperadorPanel({
  mode,
  numeroCredencial,
  onNumeroCredencialChange,
  dataValidade,
  onDataValidadeChange,
  fileInputRef,
  licFile,
  onLicFileChange,
  existingDoc = false,
  removerDoc = false,
  onRemoverDocChange,
  estado,
  fileInputId = "licenca-operador-ficheiro",
}: Props) {
  const mostraEstado = estado && estado !== "Ausente";

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-[#222] dark:bg-[#0a0a0a]/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Credencial
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            CRED, validade e documento são obrigatórios quando regista a credencial.
          </p>
        </div>
        {mostraEstado && (
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${classeBadgeEstadoLicenca(estado)}`}
          >
            {rotuloEstadoLicenca(estado)}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="licenca-numero-credencial" className={labelClass}>
            N.º credencial (CRED) *
          </label>
          <input
            id="licenca-numero-credencial"
            type="text"
            maxLength={50}
            required
            value={numeroCredencial}
            onChange={(e) => onNumeroCredencialChange(e.target.value)}
            className={inputClass}
            placeholder="Ex.: 12345"
          />
        </div>
        <div>
          <label htmlFor="licenca-data-validade" className={labelClass}>
            Validade da credencial *
          </label>
          <input
            id="licenca-data-validade"
            type="date"
            required
            value={dataValidade}
            onChange={(e) => onDataValidadeChange(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
          Documento da credencial *
        </label>
        {mode === "edit" && existingDoc ? (
          <>
            <label htmlFor={fileInputId} className="mt-1 flex cursor-pointer items-center gap-2">
              <input
                id={fileInputId}
                type="file"
                name="licencaOperadorFicheiro"
                accept={FILE_ACCEPT_LICENCA}
                className="sr-only"
                onChange={(e) => onLicFileChange?.(e.target.files?.[0] ?? null)}
              />
              <span className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-gray-300 dark:hover:bg-[#222]">
                {licFile ? licFile.name : "Alterar documento"}
              </span>
            </label>
            {onRemoverDocChange && (
              <label className="mt-2 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={removerDoc}
                  onChange={(e) => onRemoverDocChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-red-600 dark:text-red-400">Remover este documento</span>
              </label>
            )}
          </>
        ) : mode === "create" && fileInputRef ? (
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            name="LicencaOperadorFicheiro"
            accept={FILE_ACCEPT_LICENCA}
            required
            className={`${inputClass} mt-1`}
            onChange={(e) => onLicFileChange?.(e.target.files?.[0] ?? null)}
          />
        ) : (
          <input
            id={fileInputId}
            type="file"
            name="licencaOperadorFicheiro"
            accept={FILE_ACCEPT_LICENCA}
            required={mode === "create" || !existingDoc}
            className={`${inputClass} mt-1`}
            onChange={(e) => onLicFileChange?.(e.target.files?.[0] ?? null)}
          />
        )}
      </div>
    </div>
  );
}
