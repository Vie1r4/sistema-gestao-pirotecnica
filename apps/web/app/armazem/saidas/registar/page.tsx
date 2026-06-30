"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import { useActionGuard } from "@/app/hooks/useActionGuard";
import { getToken } from "@/app/lib/auth";
import { fetchSaidaRegistarForm, postRegistarSaida } from "@/app/lib/saidaPaiolApi";
import { useToastStore } from "@/app/stores/useToastStore";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import {
  cardClass,
  inputClass,
  labelClass,
  btnPrimaryLg as btnPrimary,
  btnSecondaryLg as btnSecondary,
} from "@/app/components/ui/tokens";

function parsePaiolProdutoIds(paiolId: string, produtoId: string): { paiolNum: number; produtoNum: number } | null {
  const pidPaiol = parseInt(String(paiolId).trim(), 10);
  const m = String(paiolId).trim().match(/^D(\d+)$/i);
  const paiolNum = m ? parseInt(m[1], 10) : pidPaiol;
  const produtoNum = parseInt(String(produtoId).trim(), 10);
  if (Number.isNaN(paiolNum) || paiolNum < 1 || Number.isNaN(produtoNum) || produtoNum < 1) return null;
  return { paiolNum, produtoNum };
}

function RegistarSaidaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const paiolId = searchParams.get("paiolId") ?? "";
  const produtoId = searchParams.get("produtoId") ?? "";
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [quantidade, setQuantidade] = useState("");
  const token = getToken();
  const ids = parsePaiolProdutoIds(paiolId, produtoId);
  const submitGuard = useActionGuard();

  const { data: formFromApi, isLoading: loadingForm } = useQuery({
    queryKey: ["armazem", "saida-paiol", "registar", ids?.paiolNum, ids?.produtoNum],
    queryFn: async (): Promise<{ paiolNome: string; produtoNome: string; stockDisponivel: number }> => {
      if (!token || !ids) throw new Error("Parâmetros em falta");
      try {
        return await fetchSaidaRegistarForm(token, ids.paiolNum, ids.produtoNum);
      } catch (e) {
        if (e instanceof Error && e.message === "UNAUTHORIZED") {
          router.replace("/login");
          throw new Error("Não autenticado");
        }
        throw e;
      }
    },
    staleTime: 30 * 1000,
    enabled: mounted && !!token && !!ids,
  });

  const registarMutation = useMutation({
    mutationFn: async (body: { PaiolId: number; ProdutoId: number; Quantidade: number }) => {
      if (!token) {
        router.replace("/login");
        throw new Error("Não autenticado");
      }
      try {
        return await postRegistarSaida(token, body);
      } catch (e) {
        if (e instanceof Error && e.message === "UNAUTHORIZED") {
          router.replace("/login");
          throw new Error("Não autenticado");
        }
        throw e;
      }
    },
    onSuccess: () => {
      useToastStore.getState().show("Saída registada com sucesso.", "success");
      queryClient.invalidateQueries({ queryKey: ["armazem"] });
      queryClient.invalidateQueries({ queryKey: ["armazem", paiolId] });
      router.push(`/armazem/${paiolId}/conteudo`);
    },
    onError: (err) => {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao registar saída. Verifique se a API está a correr.",
      });
    },
    onSettled: (_data, error) => {
      if (error) submitGuard.end();
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  const stockDisponivel = formFromApi?.stockDisponivel ?? 0;
  const paiolNome = formFromApi?.paiolNome ?? "";
  const produtoNome = formFromApi?.produtoNome ?? "";
  const temDadosParaForm = formFromApi != null && (formFromApi.paiolNome || formFromApi.produtoNome);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitGuard.begin() || registarMutation.isPending) return;
    setMessage(null);
    if (!paiolId || !produtoId || !ids) {
      setMessage({ type: "error", text: "Paiol e produto são obrigatórios. Aceda a partir do conteúdo do paiol." });
      submitGuard.end();
      return;
    }
    const qty = Number(quantidade);
    if (!Number.isFinite(qty) || qty <= 0) {
      setMessage({ type: "error", text: "A quantidade deve ser um número positivo." });
      submitGuard.end();
      return;
    }
    if (qty > stockDisponivel) {
      setMessage({ type: "error", text: `A quantidade não pode exceder o stock disponível (${stockDisponivel}).` });
      submitGuard.end();
      return;
    }
    if (!token) {
      router.replace("/login");
      submitGuard.end();
      return;
    }
    registarMutation.mutate({
      PaiolId: ids.paiolNum,
      ProdutoId: ids.produtoNum,
      Quantidade: Number(qty),
    });
  };

  const submitting = submitGuard.isBlocked(registarMutation.isPending);

  if (!paiolId || !produtoId) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          <p className="text-gray-600 dark:text-gray-400">
            Deve indicar o paiol e o produto. Aceda a partir do conteúdo do paiol e clique em &quot;Retirar&quot; na linha do produto.
          </p>
          <Link href="/armazem" className="mt-5 inline-block text-[#f97316] hover:underline">
            ← Voltar ao Armazém
          </Link>
        </main>
      </div>
    );
  }

  if (!temDadosParaForm) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          {loadingForm ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
            </div>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400">Paiol ou produto não encontrado. Aceda a partir do conteúdo do paiol.</p>
              <Link href="/armazem" className="mt-5 inline-block text-[#f97316] hover:underline">
                ← Voltar ao Armazém
              </Link>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
          >
            <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Registar saída
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Paiol: <strong>{paiolNome}</strong>. Produto: <strong>{produtoNome}</strong>.
            </p>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Stock disponível: <strong>{stockDisponivel}</strong> unidades.
            </p>
          </motion.div>

          {stockDisponivel <= 0 ? (
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.05 }}
              className={`mt-8 ${cardClass}`}
            >
              <p className="text-gray-600 dark:text-gray-400">
                Não há stock disponível para este produto neste paiol. Não é possível registar saída.
              </p>
              <Link href={`/armazem/${paiolId}/conteudo`} className={btnSecondary + " mt-4 inline-block"}>
                Voltar ao conteúdo do paiol
              </Link>
            </motion.section>
          ) : (
            <form onSubmit={handleSubmit}>
              <motion.section
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...transitionSmooth, delay: 0.05 }}
                className={`mt-8 ${cardClass}`}
              >
                <div>
                  <label htmlFor="quantidade" className={labelClass}>
                    Quantidade *
                  </label>
                  <input
                    id="quantidade"
                    type="number"
                    step="1"
                    min="1"
                    max={stockDisponivel}
                    required
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className={inputClass}
                    placeholder={`Máx. ${stockDisponivel}`}
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Máximo: {stockDisponivel} unidades.
                  </p>
                </div>
                {message && (
                  <p className={`mt-4 text-sm ${message.type === "error" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                    {message.text}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="submit" className={btnPrimary} disabled={submitting}>
                    {submitting ? "A registar…" : "Registar saída"}
                  </button>
                  <Link href={`/armazem/${paiolId}/conteudo`} className={btnSecondary}>
                    Cancelar
                  </Link>
                </div>
              </motion.section>
            </form>
          )}

          <p className="mt-8">
            <Link href={`/armazem/${paiolId}/conteudo`} className="text-[#f97316] hover:underline">
              ← Voltar ao conteúdo do paiol
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function RegistarSaidaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <RegistarSaidaContent />
    </Suspense>
  );
}
