"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { ColumnDef } from "@tanstack/react-table";
import Navbar, { CONTENT_OFFSET_TOP } from "../components/Navbar";
import { DataTable } from "../components/ui/DataTable";
import { fetchClientes, type Cliente } from "../lib/clientes";
import { getToken } from "../lib/auth";
import { fadeInUp, transitionSmooth } from "../lib/animations";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

function clientesColumns(): ColumnDef<Cliente, unknown>[] {
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

function ClientesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const criado = searchParams.get("criado") === "1";
  const editado = searchParams.get("editado") === "1";
  const eliminado = searchParams.get("eliminado") === "1";
  const columns = useMemo(() => clientesColumns(), []);

  const {
    data: clientes = [],
    isLoading: loading,
    isRefetching,
    error: queryError,
  } = useQuery({
    queryKey: ["clientes"],
    queryFn: async (): Promise<Cliente[]> => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      const r = await fetchClientes(token);
      return r.items;
    },
    staleTime: 30 * 1000,
    retry: 3,
    enabled: !!getToken(),
  });

  const error =
    queryError instanceof Error
      ? queryError.message === "Failed to fetch"
        ? "Falha de rede. Verifique se a API está a correr (NEXT_PUBLIC_API_URL) e se CORS permite pedidos do frontend."
        : queryError.message
      : queryError
        ? "Erro ao carregar clientes."
        : null;

  const alerta =
    criado ? "Cliente criado com sucesso."
    : editado ? "Alterações guardadas."
    : eliminado ? "Cliente eliminado com sucesso."
    : null;

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-[#1c1917] dark:text-white sm:text-3xl">
                Clientes
              </h1>
              <p className="mt-1 flex items-center gap-2 text-[#57534e] dark:text-gray-400">
                Listar, pesquisar e gerir fichas de clientes (particulares e empresas).
                {isRefetching && !loading && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]" />
                    A atualizar
                  </span>
                )}
              </p>
            </div>
            <Link href="/clientes/novo" className={btnPrimary}>
              Adicionar cliente
            </Link>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400"
            >
              {error}
            </motion.p>
          )}
          {alerta && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mt-5 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              {alerta}
            </motion.p>
          )}

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] dark:shadow-none sm:p-6"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-[#57534e] dark:text-gray-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
                <span>A carregar clientes…</span>
              </div>
            ) : (
              <DataTable<Cliente>
                columns={columns}
                data={clientes}
                pageSize={10}
                searchPlaceholder="Pesquisar por nome, email, telefone ou NIF..."
                emptyMessage="Ainda não há clientes registados."
                noResultsMessage="Nenhum resultado para a pesquisa."
              />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function ClientesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <ClientesContent />
    </Suspense>
  );
}
