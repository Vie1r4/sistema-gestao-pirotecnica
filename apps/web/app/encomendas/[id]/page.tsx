"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import ReferenciaIndisponivel from "@/app/components/ReferenciaIndisponivel";
import {
  podeEditarEncomenda,
  corEstado,
  mapApiToEncomendaDetalhe,
  type EncomendaComClienteEItens,
} from "@/app/lib/encomendas";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { fetchEncomendaDetalheParaPagina, postAceitar, postConcluir } from "@/app/lib/encomendasApi";
import type { Cliente } from "@/app/lib/clientes";
import { textoCalibre, textoGrupo } from "@/app/lib/produtos";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import {
  labelClass,
  btnPrimary,
  btnSecondary,
  btnDanger,
} from "@/app/components/ui/tokens";

const valueClass = "mt-1 text-gray-900 dark:text-white";

export default function EncomendaDetalhePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.id ?? user?.email ?? "";
  const canGerirEncomendas = (user?.permissions ?? []).includes("encomendas.gerir");
  const canGerirServicos = (user?.permissions ?? []).includes("servicos.gerir");
  const canGerirClientes = (user?.permissions ?? []).includes("clientes.gerir");
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const aceitarRef = useRef(false);
  const concluirRef = useRef(false);

  const criada = searchParams.get("criada") === "1";
  const editada = searchParams.get("editada") === "1";
  const itensEditados = searchParams.get("itensEditados") === "1";
  const aceite = searchParams.get("aceite") === "1";
  const rejeitada = searchParams.get("rejeitada") === "1";
  const preparacao = searchParams.get("preparacao") === "1";
  const concluida = searchParams.get("concluida") === "1";
  const erro = searchParams.get("erro") === "1";
  const voltarHref = searchParams.get("voltar") ?? "/encomendas";
  const voltarLabel = voltarHref.includes("movimentos") ? "Voltar aos movimentos" : "Voltar à lista";

  const numId = parseInt(id, 10);
  const validId = !Number.isNaN(numId);

  // Após ações noutras páginas (ex.: registar preparação), forçar dados frescos ao voltar.
  useEffect(() => {
    if (preparacao || rejeitada) {
      void queryClient.invalidateQueries({ queryKey: ["encomendas", id] });
      void queryClient.invalidateQueries({ queryKey: ["encomendas"] });
    }
  }, [preparacao, rejeitada, id, queryClient]);

  const {
    data: encomenda,
    isLoading: loadingApi,
    isRefetching,
    error: queryError,
  } = useQuery({
    queryKey: ["encomendas", id],
    queryFn: async (): Promise<EncomendaComClienteEItens | null> => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        throw new Error("Sessão expirada.");
      }
      try {
        const data = await fetchEncomendaDetalheParaPagina(token, numId);
        if (!data) return null;
        return mapApiToEncomendaDetalhe(data);
      } catch (e) {
        if (e instanceof Error && e.message === "UNAUTHORIZED") {
          router.replace("/login");
          throw new Error("Sessão expirada.");
        }
        throw e;
      }
    },
    staleTime: 30 * 1000,
    retry: 2,
    enabled: validId && !!getToken(),
  });

  if (loadingApi) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (queryError || !encomenda) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          {queryError && (
            <p className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {queryError instanceof Error ? queryError.message : "Erro ao carregar encomenda."}
            </p>
          )}
          {!queryError && <p className="text-gray-600 dark:text-gray-400">Encomenda não encontrada.</p>}
          <Link href={voltarHref} className="mt-4 inline-block text-[#f97316] hover:underline">
            ← {voltarLabel}
          </Link>
        </main>
      </div>
    );
  }

  const idNum = parseInt(id, 10);
  const isApiId = !Number.isNaN(idNum);

  const handleAceitar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aceitarRef.current) return;
    setErroAcao(null);
    const token = getToken();
    if (!token || !isApiId) {
      setErroAcao("Sessão expirada ou identificador inválido.");
      return;
    }
    aceitarRef.current = true;
    try {
      await postAceitar(token, idNum);
      queryClient.invalidateQueries({ queryKey: ["encomendas", id] });
      router.push(`/encomendas/${id}?aceite=1`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.";
      setErroAcao(msg === "Failed to fetch"
        ? "Não foi possível contactar a API. Confirme que o backend está a correr (ver variável NEXT_PUBLIC_API_URL)."
        : msg);
    } finally {
      aceitarRef.current = false;
    }
  };

  const handleConcluir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (concluirRef.current) return;
    setErroAcao(null);
    const token = getToken();
    if (!token || !isApiId) {
      setErroAcao("Sessão expirada ou identificador inválido.");
      return;
    }
    concluirRef.current = true;
    try {
      await postConcluir(token, idNum);
      queryClient.invalidateQueries({ queryKey: ["encomendas", id] });
      router.push(`/encomendas/${id}?concluida=1`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.";
      setErroAcao(msg === "Failed to fetch"
        ? "Não foi possível contactar a API. Confirme que o backend está a correr (ver variável NEXT_PUBLIC_API_URL)."
        : msg);
    } finally {
      concluirRef.current = false;
    }
  };

  const { cliente, itens, stockPorProduto, estado } = encomenda;
  const currentUserId = userId && userId !== "current-user" ? userId : null;
  const podeEditar = podeEditarEncomenda(encomenda, currentUserId, canGerirEncomendas);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-5xl">
          {(criada || editada || itensEditados || aceite || rejeitada || preparacao || concluida) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mb-6 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              {criada && "Encomenda criada com sucesso."}
              {editada && "Alterações guardadas."}
              {itensEditados && "Itens da encomenda atualizados."}
              {aceite && "Encomenda aceite."}
              {rejeitada && "Encomenda rejeitada. As reservas foram libertadas."}
              {preparacao && "Preparação registada."}
              {concluida && "Encomenda marcada como concluída."}
            </motion.p>
          )}
          {(erro || erroAcao) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mb-6 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400"
            >
              {erroAcao ?? "Ocorreu um erro. Tente novamente."}
            </motion.p>
          )}

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight sm:text-3xl">
                {encomenda.nome?.trim() ? encomenda.nome.trim() : `Encomenda #${encomenda.id}`}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-[#57534e] dark:text-gray-400">
                {encomenda.nome?.trim() && (
                  <span>N.º {encomenda.id} · </span>
                )}
                Cliente:{" "}
                {cliente ? (
                  <ReferenciaIndisponivel
                    href={`/clientes/${encomenda.clienteId}`}
                    nome={cliente.nome}
                    disponivel={(cliente as Cliente & { disponivel?: boolean }).disponivel !== false}
                    navegavel={canGerirClientes}
                    tipo="cliente"
                  />
                ) : (
                  encomenda.clienteId
                )}
                {isRefetching && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]" />
                    A atualizar
                  </span>
                )}
              </p>
            </div>
            <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${corEstado(estado)}`}>
              {estado}
            </span>
          </motion.div>

          {canGerirEncomendas && estado === "Pendente" && (
            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.03 }}
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20"
            >
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Consulte a coluna &quot;Em stock&quot; antes de aceitar ou rejeitar a encomenda.
              </p>
            </motion.div>
          )}

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-6 dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cliente e datas
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {encomenda.nome?.trim() && (
                <div className="sm:col-span-2">
                  <dt className={labelClass}>Encomenda</dt>
                  <dd className={valueClass}>{encomenda.nome.trim()}</dd>
                </div>
              )}
              <div>
                <dt className={labelClass}>Cliente</dt>
                <dd className={valueClass}>
                  {cliente ? (
                    <ReferenciaIndisponivel
                      href={`/clientes/${encomenda.clienteId}`}
                      nome={cliente.nome}
                      disponivel={(cliente as Cliente & { disponivel?: boolean }).disponivel !== false}
                      navegavel={canGerirClientes}
                      tipo="cliente"
                    />
                  ) : (
                    encomenda.clienteId
                  )}
                </dd>
              </div>
              <div>
                <dt className={labelClass}>Estado</dt>
                <dd className={valueClass}>{encomenda.estado}</dd>
              </div>
              <div>
                <dt className={labelClass}>Data de criação</dt>
                <dd className={valueClass}>{new Date(encomenda.dataCriacao).toLocaleString("pt-PT")}</dd>
              </div>
              <div>
                <dt className={labelClass}>Data de entrega</dt>
                <dd className={valueClass}>{encomenda.dataEntrega ? new Date(encomenda.dataEntrega).toLocaleDateString("pt-PT") : "—"}</dd>
              </div>
              <div>
                <dt className={labelClass}>Aceite por</dt>
                <dd className={valueClass}>{encomenda.funcionarioAceiteNome ?? "—"}</dd>
              </div>
              <div>
                <dt className={labelClass}>Preparado por</dt>
                <dd className={valueClass}>{encomenda.funcionarioPreparouNome ?? "—"}</dd>
              </div>
              <div>
                <dt className={labelClass}>Data de conclusão</dt>
                <dd className={valueClass}>{encomenda.dataConclusao ? new Date(encomenda.dataConclusao).toLocaleString("pt-PT") : "—"}</dd>
              </div>
              {(encomenda.observacoes || encomenda.motivoRejeicao) && (
                <>
                  {encomenda.observacoes && (
                    <div className="sm:col-span-2">
                      <dt className={labelClass}>Observações</dt>
                      <dd className={valueClass}>{encomenda.observacoes}</dd>
                    </div>
                  )}
                  {encomenda.motivoRejeicao && (
                    <div className="sm:col-span-2">
                      <dt className={labelClass}>Motivo de rejeição</dt>
                      <dd className={valueClass}>{encomenda.motivoRejeicao}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </motion.div>

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.07 }}
            className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-6 dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Itens da encomenda
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e7e5e4] dark:border-[#222]">
                    <th className="pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Produto</th>
                    <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Calibre</th>
                    <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Grupo risco</th>
                    <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Qtd pedida</th>
                    <th className="whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300">Em stock</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item) => {
                    const stock = stockPorProduto.get(item.produtoId) ?? 0;
                    const suficiente = stock >= item.quantidadePedida;
                    return (
                      <tr key={item.id} className="border-b border-[#f5f5f4] dark:border-[#1a1a1a]">
                        <td className="py-2 pr-4 font-medium text-[#1c1917] dark:text-white">{item.produto?.nome ?? item.produtoId}</td>
                        <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{textoCalibre(item.produto?.calibre)}</td>
                        <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{textoGrupo(item.produto?.grupoCompatibilidade)}</td>
                        <td className="whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400">{item.quantidadePedida}</td>
                        <td className={`whitespace-nowrap py-2 pr-4 ${suficiente ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                          {stock}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {estado === "Concluída" && (
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.09 }}
              className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-6 dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Serviços no terreno
              </h2>
              <p className="mt-2 text-sm text-[#57534e] dark:text-gray-400">
                Com a encomenda concluída, pode registar um serviço (evento no terreno) associado a este pedido. O formulário abre já com esta encomenda selecionada.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {canGerirServicos ? (
                  <Link
                    href={`/servicos/novo?encomendaId=${encodeURIComponent(id)}`}
                    className={btnPrimary}
                  >
                    Realizar serviço com esta encomenda
                  </Link>
                ) : (
                  <p className="text-sm text-[#78716c] dark:text-gray-500">
                    Para criar serviços é necessária a permissão de gestão de serviços.
                  </p>
                )}
                <Link href="/servicos" className={`${btnSecondary} inline-block text-center`}>
                  Lista de serviços
                </Link>
              </div>
            </motion.section>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            {estado === "Pendente" && (
              <>
                {canGerirEncomendas && (
                  <form onSubmit={handleAceitar} className="inline-block">
                    <button type="submit" className={btnPrimary}>
                      Aceitar encomenda
                    </button>
                  </form>
                )}
                {podeEditar && (
                  <Link href={`/encomendas/${id}/editar`} className={btnSecondary}>
                    Editar
                  </Link>
                )}
                {canGerirEncomendas && (
                  <Link href={`/encomendas/${id}/rejeitar`} className={btnDanger}>
                    Rejeitar
                  </Link>
                )}
              </>
            )}
            {estado === "Aceite" && (
              <>
                {canGerirEncomendas && (
                  <>
                    <Link href={`/encomendas/${id}/preparar`} className={btnPrimary}>
                      Iniciar preparação
                    </Link>
                    <Link href={`/encomendas/${id}/rejeitar`} className={btnDanger}>
                      Rejeitar
                    </Link>
                  </>
                )}
                {podeEditar && (
                  <Link href={`/encomendas/${id}/editar`} className={btnSecondary}>
                    Editar
                  </Link>
                )}
              </>
            )}
            {((estado as string) === "Em preparação" || (estado as string) === "Em preparacao") && canGerirEncomendas && (
              <form onSubmit={handleConcluir} className="inline-block">
                <button type="submit" className={btnPrimary}>
                  Concluir encomenda
                </button>
              </form>
            )}
            <Link href={voltarHref} className={btnSecondary}>
              {voltarLabel}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
