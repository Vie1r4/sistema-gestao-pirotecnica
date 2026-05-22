"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchList } from "@/app/lib/encomendasApi";
import { fetchServicosFromApi } from "@/app/lib/servicos";
import { corEstado, type EstadoEncomenda } from "@/app/lib/encomendas";
import { useLiveDateTime } from "@/app/hooks/useLiveDateTime";

type EncomendaLinha = {
  id: string;
  clienteId: string;
  estado: EstadoEncomenda | string;
  dataCriacao: string;
  dataEntrega?: string;
  clienteNome?: string;
};

function mapApiToEncomendaLinha(e: Record<string, unknown>): EncomendaLinha {
  const id = e.id ?? e.Id;
  const clienteId = e.clienteId ?? e.ClienteId;
  const estadoVal = e.estado ?? e.Estado ?? "Pendente";
  const dataCriacao = e.dataCriacao ?? e.DataCriacao;
  const dataEntrega = e.dataEntrega ?? e.DataEntrega;
  const cliente = (e.cliente ?? e.Cliente) as { nome?: string } | undefined;
  return {
    id: String(id ?? ""),
    clienteId: String(clienteId ?? ""),
    estado: String(estadoVal),
    dataCriacao: typeof dataCriacao === "string" ? dataCriacao : new Date().toISOString(),
    dataEntrega: dataEntrega ? (typeof dataEntrega === "string" ? dataEntrega : "") : undefined,
    clienteNome: cliente?.nome,
  };
}

const hoje = new Date().toISOString().slice(0, 10);

export default function DashboardComercial({
  token,
  totalClientes,
}: {
  token: string;
  totalClientes: number;
}) {
  const liveNow = useLiveDateTime();
  const {
    data: encomendasData,
    isLoading: loadingEncomendas,
    dataUpdatedAt: encomendasUpdatedAt,
  } = useQuery({
    queryKey: ["encomendas-dashboard", "all"],
    queryFn: () => fetchList(token, { estado: "", pagina: 1, itensPorPagina: 10 }),
    enabled: !!token,
    staleTime: 60 * 1000,
  });

  const {
    data: servicosData,
    isLoading: loadingServicos,
    dataUpdatedAt: servicosUpdatedAt,
  } = useQuery({
    queryKey: ["servicos-dashboard", "proximos"],
    queryFn: () => fetchServicosFromApi(token, undefined, 1, 25),
    enabled: !!token,
    staleTime: 60 * 1000,
  });

  const totaisPorEstado = (encomendasData?.totaisPorEstado ?? {}) as Record<string, number>;
  const pendentes = Number(totaisPorEstado?.Pendente ?? 0);
  const aceites = Number(totaisPorEstado?.Aceite ?? 0);
  const itemsEncomendas = (encomendasData?.items ?? []) as Array<Record<string, unknown>>;
  const ultimasEncomendas = itemsEncomendas.slice(0, 5).map(mapApiToEncomendaLinha);

  const listaServicos = servicosData?.lista ?? [];
  const proximosServicos = listaServicos
    .filter((s) => s.dataServico >= hoje)
    .sort((a, b) => String(a.dataServico).localeCompare(String(b.dataServico)))
    .slice(0, 5);
  const totalServicosAgendados = listaServicos.filter((s) => s.dataServico >= hoje).length;
  const pendentesRequerAtencao = pendentes > 0;
  const lastUpdated = Math.max(encomendasUpdatedAt ?? 0, servicosUpdatedAt ?? 0);
  const lastUpdatedText =
    lastUpdated > 0
      ? liveNow.getTime() - lastUpdated < 120_000
        ? "Atualizado agora"
        : `Atualizado às ${new Date(lastUpdated).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`
      : null;

  const cards = [
    {
      title: "Encomendas pendentes",
      value: pendentes,
      href: "/encomendas?estado=Pendente",
      accent: "orange",
      description: "A aguardar decisão",
    },
    {
      title: "Encomendas aceites",
      value: aceites,
      href: "/encomendas?estado=Aceite",
      accent: "blue",
      description: "Em curso",
    },
    {
      title: "Serviços agendados",
      value: totalServicosAgendados,
      href: "/servicos",
      accent: "emerald",
      description: "Próximos no terreno",
    },
    {
      title: "Total de clientes",
      value: totalClientes,
      href: "/clientes",
      accent: "slate",
      description: "Contexto geral",
    },
  ];

  return (
    <section
      id="dashboard-comercial"
      className="border-t border-[#e7e5e4] bg-[#fafaf9] px-6 py-24 dark:border-[#1a1a1a] dark:bg-[#050505] sm:px-8 sm:py-32"
    >
      <div className="content-container">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ea580c] dark:text-[#f97316]">
          Área Comercial
        </p>
        <div className="mt-2 h-px w-12 rounded-full bg-[#ea580c]/40 dark:bg-[#f97316]/50" aria-hidden />
        <h2 className="font-heading mt-3 text-2xl font-bold tracking-tight text-[#1c1917] sm:text-3xl dark:text-white">
          O seu painel
        </h2>
        <p className="mt-3 text-[#57534e] dark:text-[#888]">
          Encomendas pendentes, em curso e próximos serviços.
        </p>

        {/* Ação rápida — executivo, discreto */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/encomendas/novo"
            className="rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm font-medium text-[#1c1917] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-[#f97316]/40 hover:bg-[#fffbf7] hover:text-[#ea580c] dark:border-[#222] dark:bg-[#0d0d0d] dark:text-white dark:hover:border-[#f97316]/30 dark:hover:bg-[#0d0d0d]"
          >
            Nova encomenda
          </Link>
          <Link
            href="/encomendas?estado=Pendente"
            className="rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm font-medium text-[#57534e] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-[#e7e5e4] hover:bg-[#fafaf9] hover:text-[#1c1917] dark:border-[#222] dark:bg-[#0d0d0d] dark:text-[#a3a3a3] dark:hover:bg-[#111] dark:hover:text-white"
          >
            Pendentes
          </Link>
          {lastUpdatedText && (
            <span className="ml-auto text-xs text-[#a8a29e] dark:text-[#555]">
              {lastUpdatedText}
            </span>
          )}
        </div>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {loadingEncomendas ? (
            cards.map((card) => (
              <div
                key={card.title}
                className="flex flex-col rounded-2xl border border-[#e7e5e4] bg-white p-6 dark:border-[#222] dark:bg-[#0d0d0d]"
              >
                <span className="h-9 w-12 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                <span className="mt-2 h-4 w-24 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                <span className="mt-1 h-3 w-20 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
              </div>
            ))
          ) : (
            cards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`group relative flex flex-col rounded-2xl border bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_24px_-8px_rgba(249,115,22,0.2)] dark:bg-[#0d0d0d] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)] ${
                  card.title === "Encomendas pendentes" && pendentesRequerAtencao
                    ? "border-[#f97316]/40 dark:border-[#f97316]/30 dark:hover:border-[#f97316]/50"
                    : "border-[#e7e5e4] hover:border-[#f97316]/30 dark:border-[#222] dark:hover:border-[#f97316]/25"
                }`}
              >
                {card.title === "Encomendas pendentes" && pendentesRequerAtencao && (
                  <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    Requer atenção
                  </span>
                )}
                <span className="text-3xl font-bold tracking-tight text-[#1c1917] dark:text-white">
                  {card.value}
                </span>
                <span className="mt-1 text-sm font-semibold text-[#1c1917] dark:text-white">
                  {card.title}
                </span>
                <span className="mt-0.5 text-xs text-[#78716c] dark:text-[#888]">
                  {card.description}
                </span>
              </Link>
            ))
          )}
        </div>

        {/* Duas colunas: últimas encomendas + próximos serviços */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:gap-10">
          {/* Últimas 5 encomendas */}
          <div className="rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-[#222] dark:bg-[#0d0d0d]">
            <div className="border-b border-[#e7e5e4] px-6 py-4 dark:border-[#222]">
              <h3 className="font-semibold text-[#1c1917] dark:text-white">
                Últimas encomendas
              </h3>
              <p className="text-xs text-[#78716c] dark:text-[#888]">
                Com estado atual
              </p>
            </div>
            <ul className="divide-y divide-[#e7e5e4] dark:divide-[#222]">
              {loadingEncomendas ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="flex items-center gap-3 px-6 py-4">
                    <span className="h-4 w-12 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                    <span className="h-4 flex-1 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                    <span className="h-5 w-16 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                  </li>
                ))
              ) : ultimasEncomendas.length === 0 ? (
                <li className="px-6 py-8 text-center">
                  <p className="text-sm text-[#78716c] dark:text-[#888]">
                    Nenhuma encomenda recente.
                  </p>
                  <Link
                    href="/encomendas/novo"
                    className="mt-3 inline-block text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
                  >
                    Criar encomenda
                  </Link>
                </li>
              ) : (
                ultimasEncomendas.map((enc) => (
                  <li key={enc.id}>
                    <Link
                      href={`/encomendas/${enc.id}`}
                      className="flex items-center justify-between gap-3 px-6 py-4 text-sm transition-colors hover:bg-[#fafaf9] dark:hover:bg-[#111]"
                    >
                      <span className="font-medium text-[#1c1917] dark:text-white">
                        #{enc.id}
                      </span>
                      <span className="truncate text-[#57534e] dark:text-[#a3a3a3]">
                        {enc.clienteNome ?? `Cliente ${enc.clienteId}`}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${corEstado(enc.estado)}`}
                      >
                        {enc.estado}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <div className="border-t border-[#e7e5e4] px-6 py-3 dark:border-[#222]">
              <Link
                href="/encomendas"
                className="text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
              >
                Ver todas as encomendas →
              </Link>
            </div>
          </div>

          {/* Próximos serviços */}
          <div className="rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-[#222] dark:bg-[#0d0d0d]">
            <div className="border-b border-[#e7e5e4] px-6 py-4 dark:border-[#222]">
              <h3 className="font-semibold text-[#1c1917] dark:text-white">
                Próximos serviços
              </h3>
              <p className="text-xs text-[#78716c] dark:text-[#888]">
                Agendados no terreno
              </p>
            </div>
            <ul className="divide-y divide-[#e7e5e4] dark:divide-[#222]">
              {loadingServicos ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="flex items-center gap-3 px-6 py-4">
                    <span className="h-4 w-20 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                    <span className="h-4 flex-1 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                    <span className="h-4 w-4 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
                  </li>
                ))
              ) : proximosServicos.length === 0 ? (
                <li className="px-6 py-8 text-center">
                  <p className="text-sm text-[#78716c] dark:text-[#888]">
                    Nenhum serviço agendado.
                  </p>
                  <Link
                    href="/servicos"
                    className="mt-3 inline-block text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
                  >
                    Ver serviços
                  </Link>
                </li>
              ) : (
                proximosServicos.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/servicos/${s.id}`}
                      className="flex items-center justify-between gap-3 px-6 py-4 text-sm transition-colors hover:bg-[#fafaf9] dark:hover:bg-[#111]"
                    >
                      <span className="font-medium text-[#1c1917] dark:text-white">
                        {new Date(s.dataServico).toLocaleDateString("pt-PT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="truncate text-[#57534e] dark:text-[#a3a3a3]">
                        {s.local ?? s.moradaCompleta ?? "—"}
                      </span>
                      <span className="shrink-0 text-[#ea580c] dark:text-[#f97316]">
                        →
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <div className="border-t border-[#e7e5e4] px-6 py-3 dark:border-[#222]">
              <Link
                href="/servicos"
                className="text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
              >
                Ver todos os serviços →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
