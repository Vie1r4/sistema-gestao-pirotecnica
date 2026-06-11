"use client";

import Link from "next/link";
import { useToastStore } from "@/app/stores/useToastStore";

type Props = {
  href: string;
  nome: string;
  disponivel?: boolean;
  /** Se false, mostra só o nome (sem link), mesmo quando a ficha existe. */
  navegavel?: boolean;
  tipo?: "cliente" | "funcionário";
  className?: string;
};

const msgIndisponivel = (tipo: "cliente" | "funcionário") =>
  `Este ${tipo} já não está disponível. O registo foi eliminado, mas o nome mantém-se no histórico.`;

/**
 * Link para ficha de cliente/funcionário; se a ficha foi eliminada (soft delete), mostra o nome
 * sem navegação e informa o utilizador ao clicar.
 */
export default function ReferenciaIndisponivel({
  href,
  nome,
  disponivel = true,
  navegavel = true,
  tipo = "cliente",
  className = "text-[#f97316] hover:underline",
}: Props) {
  if (disponivel && navegavel) {
    return (
      <Link href={href} className={className}>
        {nome}
      </Link>
    );
  }

  if (disponivel && !navegavel) {
    return <span className={className.replace(/\bhover:underline\b/g, "").trim()}>{nome}</span>;
  }

  return (
    <button
      type="button"
      className={`cursor-help border-b border-dotted border-gray-400 bg-transparent p-0 text-left text-gray-700 dark:border-gray-500 dark:text-gray-300 ${className.includes("text-[#f97316]") ? "" : className}`}
      title={msgIndisponivel(tipo)}
      onClick={() => useToastStore.getState().show(msgIndisponivel(tipo), "info")}
    >
      {nome}
    </button>
  );
}
