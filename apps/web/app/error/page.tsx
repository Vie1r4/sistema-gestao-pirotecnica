"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { getError } from "../lib/home";
import { fadeInUp, transitionSmooth } from "../lib/animations";

export default function ErrorPage() {
  const [data, setData] = useState<{ requestId?: string; isDevelopment?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getError()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] selection:bg-[#f97316]/20 selection:text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
          >
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#1c1917] dark:text-white sm:text-3xl">
              Erro
            </h1>
            <p className="mt-2 text-[#57534e] dark:text-gray-400">
              Ocorreu um problema. Pode usar os dados abaixo para diagnóstico.
            </p>
          </motion.div>
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#1f1f1f] dark:bg-[#111] dark:shadow-none sm:p-8"
          >
            {loading ? (
              <p className="text-[#57534e] dark:text-gray-400">A carregar…</p>
            ) : data ? (
              <dl className="space-y-3 text-sm">
                {data.requestId != null && (
                  <div>
                    <dt className="font-medium text-[#57534e] dark:text-gray-400">ID do pedido</dt>
                    <dd className="mt-1 font-mono text-[#1c1917] dark:text-white">{data.requestId}</dd>
                  </div>
                )}
                {data.isDevelopment != null && (
                  <div>
                    <dt className="font-medium text-[#57534e] dark:text-gray-400">Ambiente</dt>
                    <dd className="mt-1 text-[#1c1917] dark:text-white">
                      {data.isDevelopment ? "Desenvolvimento" : "Produção"}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-[#57534e] dark:text-gray-400">Não foi possível obter dados do servidor.</p>
            )}
          </motion.div>
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.1 }}
            className="mt-8"
          >
            <Link
              href="/"
              className="text-sm font-medium text-[#ea580c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:text-[#f97316]"
            >
              ← Voltar à página inicial
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
