"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { useToastStore } from "@/app/stores/useToastStore";
import { fetchCompilado, putCompilado } from "@/app/lib/compiladosApi";
import CompiladoForm, { compiladoToLinhas } from "../../_components/CompiladoForm";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

export default function EditarCompiladoPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const canGerir = (user?.permissions ?? []).includes("produtos.gerir");
  const [mounted, setMounted] = useState(false);
  const numId = parseInt(String(params.id), 10);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!canGerir && user !== undefined) router.replace("/produtos");
  }, [mounted, canGerir, user, router]);

  const { data: compilado, isLoading, error } = useQuery({
    queryKey: ["compilados", numId],
    queryFn: async () => {
      const t = getToken();
      if (!t) throw new Error("Sessão expirada.");
      return fetchCompilado(t, numId);
    },
    enabled: mounted && !Number.isNaN(numId) && !!getToken() && canGerir,
  });

  const mutation = useMutation({
    mutationFn: (body: Parameters<typeof putCompilado>[2]) => {
      const t = getToken();
      if (!t) throw new Error("Sessão expirada.");
      return putCompilado(t, numId, body);
    },
    onSuccess: () => {
      useToastStore.getState().show("Compilado atualizado.", "success");
      queryClient.invalidateQueries({ queryKey: ["compilados"] });
      router.push("/produtos/compilados?criado=1");
    },
  });

  if (!mounted || (user !== undefined && !canGerir)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (error || !compilado) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main className="p-8 pt-content-offset">
          <p className="text-gray-600 dark:text-gray-400">Compilado não encontrado.</p>
          <Link href="/produtos/compilados" className="mt-4 inline-block text-[#f97316] hover:underline">
            ← Voltar aos compilados
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset">
        <div className="mx-auto max-w-2xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Editar compilado
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{compilado.nome}</p>
          </motion.div>

          <div className="mt-10">
            <CompiladoForm
              key={compilado.id}
              initialNome={compilado.nome}
              initialItens={compiladoToLinhas(compilado)}
              submitLabel="Guardar"
              pending={mutation.isPending}
              onSubmit={(data) => mutation.mutate(data)}
              errorMessage={
                mutation.isError && mutation.error instanceof Error ? mutation.error.message : null
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
