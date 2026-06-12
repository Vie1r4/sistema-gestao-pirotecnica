import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { Cliente } from "@/app/lib/clientes";

/** Colunas da tabela de clientes (lista). */
export function clientesColumns(): ColumnDef<Cliente, unknown>[] {
  return [
    {
      accessorKey: "nome",
      header: "Nome",
      enableSorting: true,
    },
    {
      accessorKey: "tipoCliente",
      header: "Tipo",
      cell: ({ getValue }) => (
        <span className="text-[#57534e] dark:text-gray-400">{getValue() as string}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "nif",
      header: "NIF",
      cell: ({ getValue }) => (
        <span className="text-[#57534e] dark:text-gray-400">{getValue() as string ?? "—"}</span>
      ),
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
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => (
        <Link
          href={`/clientes/${row.original.id}`}
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
