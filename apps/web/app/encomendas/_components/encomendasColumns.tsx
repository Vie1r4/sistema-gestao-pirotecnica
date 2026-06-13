import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import StatusBadge from "@/app/components/ui/StatusBadge";
import type { EncomendaLinha } from "@/app/lib/encomendas";

const mutedCell = "text-[#57534e] dark:text-gray-400";

export function encomendasColumns(): ColumnDef<EncomendaLinha, unknown>[] {
  return [
    {
      accessorKey: "id",
      header: "N.º",
      enableSorting: true,
      sortingFn: (a, b) => Number(a.original.id) - Number(b.original.id),
    },
    {
      accessorKey: "nome",
      header: "Encomenda",
      cell: ({ getValue }) => {
        const nome = getValue() as string | undefined;
        return (
          <span className="block max-w-[14rem] truncate font-medium">
            {nome?.trim() || "—"}
          </span>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "clienteNome",
      header: "Cliente",
      cell: ({ row }) => (
        <span className={mutedCell}>{row.original.clienteNome ?? row.original.clienteId}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => <StatusBadge label={String(getValue())} />,
      enableSorting: true,
    },
    {
      accessorKey: "dataCriacao",
      header: "Criação",
      cell: ({ getValue }) => (
        <span className={`whitespace-nowrap ${mutedCell}`}>
          {new Date(getValue() as string).toLocaleDateString("pt-PT")}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "dataEntrega",
      header: "Data entrega",
      cell: ({ getValue }) => {
        const v = getValue() as string | undefined;
        return (
          <span className={`whitespace-nowrap ${mutedCell}`}>
            {v ? new Date(v).toLocaleDateString("pt-PT") : "—"}
          </span>
        );
      },
      enableSorting: true,
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => (
        <Link
          href={`/encomendas/${row.original.id}`}
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
