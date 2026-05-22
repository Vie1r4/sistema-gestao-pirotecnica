"use client";



import { useQuery } from "@tanstack/react-query";

import { getToken } from "@/app/lib/auth";

import { fetchAdminHealth } from "@/app/lib/admin";

import { AdminCard } from "./AdminCard";



type Props = {
  compact?: boolean;
  className?: string;
};

export default function AdminSystemHealth({ compact = false, className = "" }: Props) {

  const token = getToken();

  const { data, isLoading, error, refetch, isFetching } = useQuery({

    queryKey: ["admin", "health"],

    queryFn: () => fetchAdminHealth(token!),

    enabled: !!token,

    staleTime: 60_000,

    refetchInterval: 120_000,

  });



  const ok = data?.status === "ok" && data.database;



  if (compact) {

    return (

      <div

        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${

          isLoading

            ? "border-[#e7e5e4] text-[#78716c] dark:border-[#333] dark:text-[#888]"

            : ok

              ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#16a34a] dark:border-[#166534]/50 dark:bg-[#052e16]/40 dark:text-[#4ade80]"

              : "border-[#fecaca] bg-[#fef2f2] text-[#dc2626] dark:border-[#991b1b]/50 dark:bg-[#450a0a]/40 dark:text-[#f87171]"

        }`}

        title={data ? `API ${data.version} · ${data.environment}` : undefined}

      >

        <span

          className={`h-2 w-2 rounded-full ${ok ? "bg-[#16a34a]" : "bg-[#dc2626]"}`}

          aria-hidden

        />

        {isLoading ? "A verificar…" : ok ? "API operacional" : "API com problemas"}

      </div>

    );

  }



  return (
    <AdminCard className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">

        <div>

          <h3 className="text-sm font-semibold text-[#1c1917] dark:text-white">Estado do sistema</h3>

          <p className="mt-1 text-xs text-[#78716c] dark:text-[#888]">

            Ligação à API e base de dados

          </p>

        </div>

        <button

          type="button"

          onClick={() => refetch()}

          disabled={isFetching}

          className="rounded-lg border border-[#e7e5e4] px-2.5 py-1 text-xs font-medium text-[#57534e] hover:bg-[#fafaf9] disabled:opacity-50 dark:border-[#333] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a]"

        >

          {isFetching ? "…" : "Atualizar"}

        </button>

      </div>



      {error && (

        <p className="mt-3 text-sm text-red-600 dark:text-red-400">

          {error instanceof Error ? error.message : "Erro ao obter estado."}

        </p>

      )}



      {data && !error && (

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">

          <div>

            <dt className="text-xs font-semibold uppercase tracking-wider text-[#a8a29e] dark:text-[#888]">

              Estado

            </dt>

            <dd className={`font-medium ${ok ? "text-[#16a34a]" : "text-[#dc2626]"}`}>

              {data.status === "ok" ? "Operacional" : "Degradado"}

            </dd>

          </div>

          <div>

            <dt className="text-xs font-semibold uppercase tracking-wider text-[#a8a29e] dark:text-[#888]">

              Base de dados

            </dt>

            <dd className="font-medium text-[#1c1917] dark:text-white">

              {data.database ? "Ligada" : "Indisponível"}

            </dd>

          </div>

          <div>

            <dt className="text-xs font-semibold uppercase tracking-wider text-[#a8a29e] dark:text-[#888]">

              Ambiente

            </dt>

            <dd className="font-medium text-[#1c1917] dark:text-white">{data.environment}</dd>

          </div>

          <div>

            <dt className="text-xs font-semibold uppercase tracking-wider text-[#a8a29e] dark:text-[#888]">

              Versão API

            </dt>

            <dd className="font-mono text-xs text-[#57534e] dark:text-[#a3a3a3]">{data.version}</dd>

          </div>

        </dl>

      )}

    </AdminCard>
  );
}


