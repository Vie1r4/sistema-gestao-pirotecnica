"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "../../../components/Navbar";
import { getToken } from "../../../lib/auth";
import { useUser } from "@/app/context/UserContext";
import type { Funcionario } from "../../../lib/funcionarios";
import { fadeInUp, transitionSmooth } from "../../../lib/animations";
import { fetchFuncionarioPorId, postDesassociarConta } from "@/app/lib/funcionariosApi";

const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

const btnDanger =
  "data-button rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-[background-color,opacity] duration-200 hover:bg-amber-700";

export default function DesassociarContaPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const { user } = useUser();
  const currentUserId = user?.id ?? user?.email ?? null;
  const canGerirFuncionarios = (user?.permissions ?? []).includes("funcionarios.gerir");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    data: funcionario,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["funcionarios", id],
    queryFn: async (): Promise<Funcionario | null> => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        throw new Error("Sessão expirada.");
      }
      return fetchFuncionarioPorId(token, id, { onUnauthorized: () => router.replace("/login") });
    },
    enabled: !!id && !!getToken(),
    staleTime: 30 * 1000,
    retry: 1,
  });

  const loadError = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;

  const desassociarMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      await postDesassociarConta(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcionarios", id] });
      setMessage({ type: "success", text: "Conta desassociada. A ficha do funcionário mantém-se." });
      setTimeout(() => router.push(`/funcionarios/${id}`), 1200);
    },
    onError: (err: Error) => {
      const msg = err.message;
      if (msg === "Sessão expirada.") {
        router.replace("/login");
        return;
      }
      setMessage({
        type: "error",
        text: msg === "Failed to fetch" ? "Não foi possível contactar o servidor." : msg,
      });
    },
  });

  const isOwnAccount =
    funcionario?.associadoAoUtilizadorAtual === true ||
    (!!funcionario?.contaAssociada &&
      !!currentUserId &&
      (funcionario.userId === currentUserId || funcionario.email === currentUserId));

  const handleConfirmar = async () => {
    if (desassociarMutation.isPending) return;
    if (!funcionario || !funcionario.contaAssociada) return;
    if (isOwnAccount) {
      setMessage({ type: "error", text: "Não é permitido desassociar a sua própria conta." });
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setMessage(null);
    try {
      await desassociarMutation.mutateAsync();
    } catch {
      /* mensagem em onError da mutation */
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (loadError || !funcionario) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          <p className="text-gray-600 dark:text-gray-400">{loadError || "Funcionário não encontrado."}</p>
          <Link href="/funcionarios" data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">← Voltar</Link>
        </main>
      </div>
    );
  }

  if (!funcionario.contaAssociada) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          <p className="text-gray-600 dark:text-gray-400">Este funcionário não tem conta associada.</p>
          <Link href={`/funcionarios/${id}`} data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">← Voltar aos detalhes</Link>
        </main>
      </div>
    );
  }

  if (!canGerirFuncionarios) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
          <p className="text-gray-600 dark:text-gray-400">Apenas utilizadores com permissão para gerir funcionários podem desassociar contas.</p>
          <Link href={`/funcionarios/${id}`} data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">← Voltar aos detalhes</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        <div className="mx-auto max-w-2xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight text-amber-600 dark:text-amber-400 sm:text-3xl">Desassociar conta</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Ao confirmar, o UserId é removido da ficha, esse utilizador é desassociado de todos os funcionários e clientes, os registos em Perfil são apagados e o utilizador Identity é eliminado. A ficha do funcionário permanece, mas deixa de haver conta de acesso; o mesmo email não poderá ser usado para entrar. Não é permitido desassociar a sua própria conta.
            </p>
          </motion.div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className={`mt-10 ${cardClass}`}
          >
            <p className="text-gray-700 dark:text-gray-300"><strong>{funcionario.nomeCompleto}</strong> · {funcionario.email ?? "—"}</p>
            {isOwnAccount && (
              <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">Não pode desassociar a sua própria conta.</p>
            )}
            {message && (
              <p className={`mt-4 text-sm ${message.type === "error" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                {message.text}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={desassociarMutation.isPending || !!message?.text || isOwnAccount}
                className={btnDanger}
              >
                {desassociarMutation.isPending ? "A processar…" : "Confirmar desassociação"}
              </button>
              <Link href={`/funcionarios/${id}`} className={btnSecondary}>Cancelar</Link>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
