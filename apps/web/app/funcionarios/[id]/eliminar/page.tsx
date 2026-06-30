"use client";

import { useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import { getToken } from "../../../lib/auth";
import { useUser } from "@/app/context/UserContext";
import { useToastStore } from "@/app/stores/useToastStore";
import { fetchDeleteGet, deleteFuncionarioApi } from "../../../lib/funcionariosApi";
import { fadeInUp, transitionSmooth } from "../../../lib/animations";
import { cardClass, btnSecondary, btnDangerSolid as btnDanger } from "@/app/components/ui/tokens";

type FuncionarioResumo = {
  id: string;
  nomeCompleto: string;
  email?: string;
  telefone?: string;
  cargo: string;
  contaAssociada: boolean;
};

export default function EliminarFuncionarioPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const numId = parseInt(String(id), 10);
  const validId = !Number.isNaN(numId);
  const { user } = useUser();
  const canGerirFuncionarios = (user?.permissions ?? []).includes("funcionarios.gerir");
  const deletingRef = useRef(false);

  const { data: funcionario, isLoading: loadingApi, error: queryError } = useQuery({
    queryKey: ["funcionarios", id, "delete"],
    queryFn: async (): Promise<FuncionarioResumo> => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      const item = await fetchDeleteGet(token, numId);
      const raw = item as Record<string, unknown>;
      const userId = (raw.userId ?? raw.UserId) as string | undefined;
      return {
        id: String(raw.id ?? raw.Id ?? id),
        nomeCompleto: String(raw.nomeCompleto ?? raw.NomeCompleto ?? ""),
        email: (raw.email ?? raw.Email) as string | undefined,
        telefone: (raw.telefone ?? raw.Telefone) as string | undefined,
        cargo: String(raw.cargo ?? raw.Cargo ?? "Comercial"),
        contaAssociada: Boolean(raw.contaAssociada ?? raw.ContaAssociada ?? userId),
      };
    },
    staleTime: 30 * 1000,
    retry: 1,
    enabled: validId && !!getToken(),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      await deleteFuncionarioApi(token, numId);
    },
    onSuccess: () => {
      useToastStore.getState().show("Funcionário eliminado.", "success");
      queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
      queryClient.invalidateQueries({ queryKey: ["funcionarios", id] });
      router.push("/funcionarios?eliminado=1");
    },
    onSettled: () => {
      deletingRef.current = false;
    },
  });

  const handleConfirmar = () => {
    if (deletingRef.current) return;
    if (!funcionario) return;
    const token = getToken();
    if (!token || !validId) return;
    deletingRef.current = true;
    mutation.mutate();
  };

  const loading = mutation.isPending;

  if (loadingApi && validId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }
  if (queryError || !funcionario) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          {queryError && (
            <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {queryError instanceof Error ? queryError.message : "Erro ao carregar."}
            </p>
          )}
          {!queryError && <p className="text-gray-600 dark:text-gray-400">Funcionário não encontrado.</p>}
          <Link href="/funcionarios" data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">← Voltar</Link>
        </main>
      </div>
    );
  }
  if (!canGerirFuncionarios) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          <p className="text-gray-600 dark:text-gray-400">Apenas utilizadores com permissão para gerir funcionários podem eliminar.</p>
          <Link href={`/funcionarios/${id}`} data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">← Voltar aos detalhes</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-2xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight text-red-600 dark:text-red-400 sm:text-3xl">Eliminar funcionário</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Confirme os dados abaixo. Ao confirmar, a ficha e a pasta de documentos do funcionário são removidas. Se existir conta associada e não for a do utilizador autenticado, o sistema remove ainda o UserId de todos os funcionários e clientes, apaga os Perfis e o utilizador Identity. Se for a sua própria conta, apenas a ficha e os documentos são eliminados; a conta Identity mantém-se para não perder acesso.</p>
          </motion.div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className={`mt-10 ${cardClass}`}
          >
            <dl className="space-y-3">
              <div><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome completo</dt><dd className="text-gray-900 dark:text-white">{funcionario.nomeCompleto}</dd></div>
              <div><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt><dd className="text-gray-700 dark:text-gray-300">{funcionario.email ?? "—"}</dd></div>
              <div><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</dt><dd className="text-gray-700 dark:text-gray-300">{funcionario.telefone ?? "—"}</dd></div>
              <div><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cargo</dt><dd className="text-gray-700 dark:text-gray-300">{funcionario.cargo}</dd></div>
              <div><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Conta associada</dt><dd className="text-gray-700 dark:text-gray-300">{funcionario.contaAssociada ? "Sim" : "Não"}</dd></div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={handleConfirmar} disabled={loading} className={btnDanger}>
                {loading ? "A eliminar…" : "Confirmar eliminação"}
              </button>
              <Link href={`/funcionarios/${id}`} className={btnSecondary}>Cancelar</Link>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
