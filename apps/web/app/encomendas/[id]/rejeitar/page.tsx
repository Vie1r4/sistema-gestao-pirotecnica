"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { fetchRejeitar, postRejeitar } from "@/app/lib/encomendasApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { labelClass, btnSecondary, btnDangerSolid as btnDanger, inputClassCompact as inputClass } from "@/app/components/ui/tokens";

export default function RejeitarEncomendaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [mounted, setMounted] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [apiEncomenda, setApiEncomenda] = useState<{ estado?: string; clienteId?: string; cliente?: { nome?: string } } | null | undefined>(undefined);
  const [loadingApi, setLoadingApi] = useState(true);

  const idNum = parseInt(id, 10);
  const isApiId = !Number.isNaN(idNum);
  const encomenda = apiEncomenda ? { estado: apiEncomenda.estado, clienteId: apiEncomenda.clienteId ?? "", cliente: apiEncomenda.cliente } : null;

  useEffect(() => {
    setMounted(true);
  }, [id]);

  useEffect(() => {
    if (!mounted || !isApiId) {
      setApiEncomenda(null);
      setLoadingApi(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setLoadingApi(false);
      return;
    }
    fetchRejeitar(token, idNum)
      .then((data) => setApiEncomenda(data as { estado?: string; clienteId?: string; cliente?: { nome?: string } }))
      .catch(() => setApiEncomenda(null))
      .finally(() => setLoadingApi(false));
  }, [mounted, id, idNum, isApiId]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (loadingApi && isApiId && getToken()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (!encomenda) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          <p className="text-gray-600 dark:text-gray-400">Encomenda não encontrada.</p>
          <Link href="/encomendas" className="mt-4 inline-block text-[#f97316] hover:underline">
            ← Voltar às Encomendas
          </Link>
        </main>
      </div>
    );
  }

  if (encomenda.estado !== "Pendente" && encomenda.estado !== "Aceite") {
    router.replace(`/encomendas/${id}?erro=1`);
    return null;
  }

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    const token = getToken();
    if (!isApiId || !token) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await postRejeitar(token, idNum, { motivoRejeicao: motivo.trim() || undefined });
      router.push(`/encomendas/${id}?rejeitada=1`);
    } catch {
      router.push(`/encomendas/${id}?erro=1`);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const clienteNome = encomenda.cliente?.nome ?? encomenda.clienteId;

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
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
            <h1 className="font-heading text-2xl tracking-tight sm:text-3xl">
              Rejeitar encomenda
            </h1>
            <p className="mt-1 text-[#57534e] dark:text-gray-400">
              Encomenda #{id} · Cliente: {clienteNome} · Estado atual: {encomenda.estado}
            </p>
          </motion.div>

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-6 dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8"
          >
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              Ao confirmar, o stock reservado para esta encomenda será libertado e a encomenda passará ao estado Rejeitada.
            </p>

            <form onSubmit={handleConfirmar} className="mt-6 space-y-6">
              <div>
                <label htmlFor="motivo" className={labelClass}>
                  Motivo de rejeição (opcional, máx. 500 caracteres)
                </label>
                <textarea
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value.slice(0, 500))}
                  maxLength={500}
                  rows={4}
                  className={`${inputClass} mt-2 w-full`}
                  placeholder="Ex.: stock insuficiente, pedido cancelado pelo cliente..."
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className={btnDanger} disabled={submitting}>
                  {submitting ? "A processar…" : "Confirmar rejeição"}
                </button>
                <Link href={`/encomendas/${id}`} className={btnSecondary}>
                  Cancelar
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
