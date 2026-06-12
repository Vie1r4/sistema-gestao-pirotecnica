import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  textoClassificacao,
  textoGrupo,
  textoFiltroTecnico,
  textoCalibre,
  type Produto,
} from "@/app/lib/produtos";

const mutedCell = "text-[#57534e] dark:text-gray-400";

export function produtosCatalogColumns(): ColumnDef<Produto, unknown>[] {
  return [
    {
      accessorKey: "nome",
      header: "Nome",
      enableSorting: true,
    },
    {
      accessorKey: "familiaRisco",
      header: "Classif. risco",
      cell: ({ getValue }) => (
        <span className={`whitespace-nowrap ${mutedCell}`}>{textoClassificacao(getValue() as string)}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "grupoCompatibilidade",
      header: "Grupo",
      cell: ({ getValue }) => (
        <span className={`whitespace-nowrap ${mutedCell}`}>{textoGrupo(getValue() as string)}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "filtroTecnico",
      header: "Filtro técn.",
      cell: ({ getValue }) => (
        <span className={`whitespace-nowrap ${mutedCell}`}>{textoFiltroTecnico(getValue() as string)}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "calibre",
      header: "Calibre",
      cell: ({ getValue }) => (
        <span className={`whitespace-nowrap ${mutedCell}`}>{textoCalibre(getValue() as string)}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "nemPorUnidade",
      header: "NEM (kg/un)",
      cell: ({ getValue }) => (
        <span className={`whitespace-nowrap ${mutedCell}`}>{getValue() as number}</span>
      ),
      enableSorting: true,
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => (
        <Link
          href={`/produtos/${row.original.id}`}
          data-button
          className="text-[#f97316] transition-[color] duration-200 hover:underline"
        >
          Detalhes
        </Link>
      ),
      enableSorting: false,
    },
  ];
}

export function produtosGerirColumns(): ColumnDef<Produto, unknown>[] {
  return [
    {
      accessorKey: "nome",
      header: "Nome",
      enableSorting: true,
    },
    {
      accessorKey: "nemPorUnidade",
      header: "NEM (kg/un)",
      cell: ({ getValue }) => (
        <span className={`whitespace-nowrap ${mutedCell}`}>{getValue() as number}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "familiaRisco",
      header: "Classif.",
      cell: ({ getValue }) => (
        <span className={`whitespace-nowrap ${mutedCell}`}>{textoClassificacao(getValue() as string)}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "grupoCompatibilidade",
      header: "Grupo",
      cell: ({ getValue }) => (
        <span className={`whitespace-nowrap ${mutedCell}`}>{textoGrupo(getValue() as string)}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "filtroTecnico",
      header: "Filtro técn.",
      cell: ({ getValue }) => (
        <span className={`whitespace-nowrap ${mutedCell}`}>{textoFiltroTecnico(getValue() as string)}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "calibre",
      header: "Calibre",
      cell: ({ getValue }) => (
        <span className={`whitespace-nowrap ${mutedCell}`}>{textoCalibre(getValue() as string)}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "referencia",
      header: "Ref.",
      cell: ({ getValue }) => {
        const ref = getValue() as string | undefined;
        return (
          <span className={`max-w-[8rem] truncate ${mutedCell}`} title={ref}>
            {ref ?? "—"}
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
          href={`/produtos/${row.original.id}`}
          data-button
          className="text-[#f97316] transition-[color] duration-200 hover:underline"
        >
          Detalhes
        </Link>
      ),
      enableSorting: false,
    },
  ];
}
