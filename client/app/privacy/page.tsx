"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "../components/Navbar";
import { getToken } from "../lib/auth";
import { getPrivacy } from "../lib/home";
import { fadeInUp, transitionSmooth } from "../lib/animations";

export default function PrivacyPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setMessage("Política de privacidade.");
      setLoading(false);
      return;
    }
    getPrivacy(token)
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Política de privacidade."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] selection:bg-[#f97316]/20 selection:text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
          >
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#1c1917] dark:text-white sm:text-3xl">
              Privacidade
            </h1>
            <p className="mt-2 text-[#57534e] dark:text-gray-400">
              Política de privacidade e proteção de dados.
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
            ) : (
              <p className="text-[#444] dark:text-gray-300">{message ?? "Política de privacidade."}</p>
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
