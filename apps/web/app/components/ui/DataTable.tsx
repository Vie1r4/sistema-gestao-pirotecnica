"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type FilterFn,
  type SortingState,
  type Row,
  flexRender,
} from "@tanstack/react-table";
import { useState } from "react";
import { inputClassSearch as inputClass } from "@/app/components/ui/tokens";

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  pageSize?: number;
  /** Mostrar caixa de pesquisa local (predefinido: sim) */
  showSearch?: boolean;
  searchPlaceholder?: string;
  /** Pesquisa controlada (partilhada com listas mobile, etc.) */
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  /** Função de filtro global personalizada */
  globalFilterFn?: FilterFn<TData>;
  /** Paginação interna (desligar quando a página usa paginação no servidor) */
  showPagination?: boolean;
  /** Conteúdo quando não há dados */
  emptyMessage?: string;
  /** Conteúdo quando a pesquisa não encontra resultados */
  noResultsMessage?: string;
};

/** Pesquisa global: concatena valores da linha e verifica se inclui o termo */
function globalFilterFn<TData>(row: Row<TData>, _columnIds: unknown, filterValue: string): boolean {
  if (!filterValue || typeof filterValue !== "string") return true;
  const term = filterValue.trim().toLowerCase();
  if (!term) return true;
  const values = Object.values(row.original as Record<string, unknown>).filter((v) => v != null && v !== "");
  const text = values.map(String).join(" ").toLowerCase();
  return text.includes(term);
}

export function DataTable<TData>({
  columns,
  data,
  pageSize = 10,
  showSearch = true,
  searchPlaceholder = "Pesquisar…",
  globalFilter: globalFilterProp,
  onGlobalFilterChange,
  globalFilterFn: globalFilterFnProp,
  showPagination = true,
  emptyMessage = "Sem dados para mostrar.",
  noResultsMessage = "Nenhum resultado para a pesquisa.",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
  const globalFilter = globalFilterProp ?? internalGlobalFilter;
  const setGlobalFilter = onGlobalFilterChange ?? setInternalGlobalFilter;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFnProp ?? globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize, pageIndex: 0 },
    },
  });

  const totalRows = data.length;
  const filteredRows = table.getFilteredRowModel().rows.length;
  const isEmpty = totalRows === 0;
  const hasNoResults = totalRows > 0 && filteredRows === 0;

  return (
    <div className="flex flex-col gap-4">
      {showSearch && (
        <div className="flex flex-1 min-w-[200px]">
          <label htmlFor="datatable-search" className="sr-only">
            Pesquisar
          </label>
          <input
            id="datatable-search"
            type="search"
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={`${inputClass} w-full max-w-md`}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[#e7e5e4] dark:border-[#222]">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      className="pb-3 font-semibold text-[#444] dark:text-gray-300"
                    >
                      <div
                        role={canSort ? "button" : undefined}
                        tabIndex={canSort ? 0 : undefined}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        onKeyDown={
                          canSort
                            ? (e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  header.column.toggleSorting();
                                }
                              }
                            : undefined
                        }
                        className={
                          canSort
                            ? "flex cursor-pointer select-none items-center gap-1 hover:text-[#f97316] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] rounded"
                            : ""
                        }
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-[#78716c] dark:text-gray-500">
                            {{
                              asc: " ↑",
                              desc: " ↓",
                            }[header.column.getIsSorted() as string] ?? " ⇅"}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-[#57534e] dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : hasNoResults ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-[#57534e] dark:text-gray-400">
                  {noResultsMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#f5f5f4] transition-colors hover:bg-[#fafaf9] dark:border-[#1a1a1a] dark:hover:bg-[#0a0a0a]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-3 text-[#1c1917] dark:text-white [&:first-child]:font-medium [&:first-child]:text-[#1c1917] dark:[&:first-child]:text-white"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && !isEmpty && !hasNoResults && filteredRows > 0 && filteredRows > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e7e5e4] pt-5 dark:border-[#222]">
          <p className="text-sm text-[#57534e] dark:text-gray-400">
            A mostrar{" "}
            <span className="font-medium text-[#1c1917] dark:text-white">
              {table.getState().pagination.pageIndex * pageSize + 1}–{Math.min((table.getState().pagination.pageIndex + 1) * pageSize, filteredRows)}
            </span>{" "}
            de {filteredRows}
          </p>
          <div className="flex items-center gap-1 rounded-xl bg-[#f5f5f4] p-1 dark:bg-[#1a1a1a]">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-[#1c1917] transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-white hover:text-[#f97316] hover:shadow-sm dark:text-white dark:hover:bg-[#222] dark:hover:text-[#f97316]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            <span className="px-3 py-2 text-sm text-[#57534e] dark:text-gray-400">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-[#1c1917] transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-white hover:text-[#f97316] hover:shadow-sm dark:text-white dark:hover:bg-[#222] dark:hover:text-[#f97316]"
            >
              Seguinte
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
