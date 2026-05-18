"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { ColumnDef } from "@tanstack/react-table";
import Navbar, { CONTENT_OFFSET_TOP } from "../components/Navbar";
import { DataTable } from "../components/ui/DataTable";
import type { Funcionario, CargoFuncionario } from "../lib/funcionarios";
import { getToken } from "../lib/auth";
import { fetchFuncionariosLista } from "../lib/funcionariosApi";
import { fadeInUp, transitionSmooth } from "../lib/animations";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

function funcionariosColumns(): ColumnDef<Funcionario, unknown>[] {
  return [
    {
      accessorKey: "nomeCompleto",
      header: "Nome",
      enableSorting: true,
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

/** Resposta da API: contaAssociada / contaEmailConfirmada por item (sem UserId na listagem). */
function mapApiToFuncionario(item: Record<string, unknown>): Funcionario {
  const nome = (item.nomeCompleto ?? item.nome ?? "") as string;
  const userId = (item.userId ?? item.UserId) as string | undefined;
  const contaAssociada = Boolean(item.contaAssociada ?? item.ContaAssociada ?? userId);
  const apiConf = item.contaEmailConfirmada ?? item.ContaEmailConfirmada;
  const emailConfirmado = typeof apiConf === "boolean" ? apiConf : undefined;
  return {
    id: String(item.id ?? item.Id ?? ""),
    nomeCompleto: nome,
    nif: (item.nif ?? item.NIF) as string | undefined,
    email: (item.email ?? item.Email) as string | undefined,
    telefone: (item.telefone ?? item.Telefone) as string | undefined,
    morada: (item.morada ?? item.Morada) as string | undefined,
    cargo: (item.cargo ?? item.Cargo ?? "Comercial") as CargoFuncionario,
    dataRegisto: String(item.dataRegisto ?? item.DataRegisto ?? new Date().toISOString()),
    contaAssociada,
    emailConfirmado,
    userId,
  };
}

function FuncionariosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const eliminado = searchParams.get("eliminado") === "1";
  const columns = useMemo(() => funcionariosColumns(), []);

  const {
    data: funcionarios = [],
    isLoading: loading,
    isRefetching,
    error: queryError,
  } = useQuery({
    queryKey: ["funcionarios"],
    queryFn: async (): Promise<Funcionario[]> => {
      const token = getToken();
      if (!token) {
        if (pathname !== "/login") router.replace("/login");
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      try {
        const { items: arr } = await fetchFuncionariosLista(token);
        return arr.map((item) => mapApiToFuncionario(item));
      } catch (e) {
        if (e instanceof Error && e.message === "UNAUTHORIZED") {
          router.replace("/login");
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        throw e;
      }
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
        ? "Erro ao carregar funcionários."
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
                Funcionários
              </h1>
              <p className="mt-1 flex items-center gap-2 text-[#57534e] dark:text-gray-400">
                Listar, pesquisar e gerir fichas de funcionários.
                {isRefetching && !loading && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]" />
                    A atualizar
                  </span>
                )}
              </p>
            </div>
            <Link href="/funcionarios/novo" className={btnPrimary}>
              Adicionar funcionário
            </Link>
          </motion.div>

          {eliminado && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mt-5 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              Funcionário eliminado com sucesso.
            </motion.p>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400"
            >
              {error}
            </motion.div>
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
                <span>A carregar funcionários…</span>
              </div>
            ) : (
              <DataTable<Funcionario>
                columns={columns}
                data={funcionarios}
                pageSize={10}
                searchPlaceholder="Pesquisar por nome, email, telefone ou NIF..."
                emptyMessage="Ainda não há funcionários registados."
                noResultsMessage="Nenhum resultado para a pesquisa."
              />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function FuncionariosPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    }>
      <FuncionariosContent />
    </Suspense>
  );
}
