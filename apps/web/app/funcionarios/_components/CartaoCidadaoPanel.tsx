"use client";

import type { RefObject } from "react";
import {
  classeBadgeEstadoCartaoCidadao,
  rotuloEstadoCartaoCidadao,
  type EstadoCartaoCidadao,
} from "@/app/lib/cartaoCidadaoConformidade";
import { FILE_ACCEPT_CARTAO_CIDADAO } from "@/app/lib/cartaoCidadaoForm";
import { inputClass, labelClass } from "@/app/components/ui/tokens";

type Props = {
  mode: "create" | "edit";
  nif: string;
  onNifChange: (value: string) => void;
  morada: string;
  onMoradaChange: (value: string) => void;
  dataValidade: string;
  onDataValidadeChange: (value: string) => void;
  fileInputRef?: RefObject<HTMLInputElement | null>;
  ccFile?: File | null;
  onCcFileChange?: (file: File | null) => void;
  existingDoc?: boolean;
  removerDoc?: boolean;
  onRemoverDocChange?: (value: boolean) => void;
  estado?: EstadoCartaoCidadao;
  fileInputId?: string;
};

export default function CartaoCidadaoPanel({
  mode,
  nif,
  onNifChange,
  morada,
  onMoradaChange,
  dataValidade,
  onDataValidadeChange,
  fileInputRef,
  ccFile,
  onCcFileChange,
  existingDoc = false,
  removerDoc = false,
  onRemoverDocChange,
  estado,
  fileInputId = "cartao-cidadao-ficheiro",
}: Props) {
  const mostraEstado = estado && estado !== "Ausente";

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-[#222] dark:bg-[#0a0a0a]/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Cartão de cidadão
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            NIF, morada, validade e documento são obrigatórios quando regista o cartão.
          </p>
        </div>
        {mostraEstado && (
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${classeBadgeEstadoCartaoCidadao(estado)}`}
          >
            {rotuloEstadoCartaoCidadao(estado)}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cc-nif" className={labelClass}>
            NIF (9 dígitos) *
          </label>
          <input
            id="cc-nif"
            type="text"
            maxLength={9}
            required
            value={nif}
            onChange={(e) => onNifChange(e.target.value.replace(/\D/g, ""))}
            className={inputClass}
            placeholder="123456789"
          />
        </div>
        <div>
          <label htmlFor="cc-data-validade" className={labelClass}>
            Validade do cartão *
          </label>
          <input
            id="cc-data-validade"
            type="date"
            required
            value={dataValidade}
            onChange={(e) => onDataValidadeChange(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cc-morada" className={labelClass}>
            Morada *
          </label>
          <input
            id="cc-morada"
            type="text"
            required
            value={morada}
            onChange={(e) => onMoradaChange(e.target.value)}
            className={inputClass}
            placeholder="Morada completa"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
          Documento do cartão de cidadão *
        </label>
        {mode === "edit" && existingDoc ? (
          <>
            <label htmlFor={fileInputId} className="mt-1 flex cursor-pointer items-center gap-2">
              <input
                id={fileInputId}
                type="file"
                name="cartaoCidadaoFicheiro"
                accept={FILE_ACCEPT_CARTAO_CIDADAO}
                className="sr-only"
                onChange={(e) => onCcFileChange?.(e.target.files?.[0] ?? null)}
              />
              <span className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-gray-300 dark:hover:bg-[#222]">
                {ccFile ? ccFile.name : "Alterar documento"}
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
            name="CartaoCidadaoFicheiro"
            accept={FILE_ACCEPT_CARTAO_CIDADAO}
            required
            className={`${inputClass} mt-1`}
            onChange={(e) => onCcFileChange?.(e.target.files?.[0] ?? null)}
          />
        ) : (
          <input
            id={fileInputId}
            type="file"
            name="cartaoCidadaoFicheiro"
            accept={FILE_ACCEPT_CARTAO_CIDADAO}
            required={mode === "create" || !existingDoc}
            className={`${inputClass} mt-1`}
            onChange={(e) => onCcFileChange?.(e.target.files?.[0] ?? null)}
          />
        )}
      </div>
    </div>
  );
}
