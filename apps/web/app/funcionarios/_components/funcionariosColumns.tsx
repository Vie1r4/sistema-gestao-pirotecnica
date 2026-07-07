import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { Funcionario } from "@/app/lib/funcionarios";
import LicencaEstadoBadge from "./LicencaEstadoBadge";

/** Colunas da tabela de funcionários (lista). */
export function funcionariosColumns(): ColumnDef<Funcionario, unknown>[] {
  return [
    {
      accessorKey: "nomeCompleto",
      header: "Nome",
      enableSorting: true,
    },
    {
      id: "licenca",
      header: "Credencial",
      cell: ({ row }) => <LicencaEstadoBadge estado={row.original.estadoLicencaOperador} />,
      enableSorting: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => (
        <span className="text-[#57534e] dark:text-gray-400">{getValue() as string ?? "—"}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "telefone",
      header: "Telefone",
      cell: ({ getValue }) => (
        <span className="text-[#57534e] dark:text-gray-400">{getValue() as string ?? "—"}</span>
      ),
      enableSorting: false,
    },
    {
      id: "conta",
      header: "Conta",
      cell: ({ row }) => {
        const f = row.original;
        if (!f.contaAssociada)
          return <span className="text-[#78716c] dark:text-gray-400">Não</span>;
        if (f.emailConfirmado !== false)
          return <span className="font-medium text-green-600 dark:text-green-400">Sim</span>;
        return <span className="font-medium text-amber-600 dark:text-amber-400">Pendente</span>;
      },
      enableSorting: false,
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => (
        <Link
          href={`/funcionarios/${row.original.id}`}
          data-button
          className="text-[#f97316] transition-[color] duration-200 hover:underline"
        >
          Ver detalhes
        </Link>
      ),
      enableSorting: false,
    },
  ];
}
