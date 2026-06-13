import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

export type ServicoListItem = {
  id: string;
  clienteId: string;
  nomeEvento?: string;
  dataServico: string;
  local?: string;
  publicoPrivado?: string;
  cliente?: { id: string; nome: string } | null;
  coordenadorPirotecnico?: { id: string; nomeCompleto: string } | null;
};

const mutedCell = "text-[#57534e] dark:text-gray-400";

export function servicosColumns(): ColumnDef<ServicoListItem, unknown>[] {
  return [
    {
      accessorKey: "id",
      header: "N.º",
      enableSorting: true,
      sortingFn: (a, b) => Number(a.original.id) - Number(b.original.id),
    },
    {
      accessorKey: "nomeEvento",
      header: "Serviço",
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
      id: "cliente",
      accessorFn: (row) => row.cliente?.nome ?? row.clienteId,
      header: "Cliente",
      cell: ({ row }) => (
        <span className={mutedCell}>{row.original.cliente?.nome ?? row.original.clienteId}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "dataServico",
      header: "Data serviço",
      cell: ({ getValue }) => (
        <span className={`whitespace-nowrap ${mutedCell}`}>
          {new Date(getValue() as string).toLocaleDateString("pt-PT")}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "local",
      header: "Local",
      cell: ({ getValue }) => (
        <span className={`block max-w-[12rem] truncate ${mutedCell}`}>
          {(getValue() as string | undefined) ?? "—"}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "publicoPrivado",
      header: "Público/Privado",
      cell: ({ getValue }) => (
        <span className={mutedCell}>{(getValue() as string | undefined) ?? "—"}</span>
      ),
      enableSorting: true,
    },
    {
      id: "coordenador",
      accessorFn: (row) => row.coordenadorPirotecnico?.nomeCompleto ?? "",
      header: "Coordenador pirotécnico",
      cell: ({ row }) => (
        <span className={mutedCell}>{row.original.coordenadorPirotecnico?.nomeCompleto ?? "—"}</span>
      ),
      enableSorting: true,
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => (
        <Link
          href={`/servicos/${row.original.id}`}
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
