"use client";

import { motion } from "framer-motion";
import { getToken } from "@/app/lib/auth";
import { getLimparDados } from "@/app/lib/home";
import { clearAllDataAndRedirect, homeLimparDadosAndRedirect } from "@/app/lib/clearData";
import {
  AdminPageHeader,
  AdminCard,
  AdminSection,
  buildBreadcrumbs,
} from "@/app/admin/_components";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

export default function AdminDefinicoesPage() {
  const token = getToken();

  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={transitionSmooth}
      className="space-y-8"
    >
      <AdminPageHeader
        title="Definições"
        description="Ações sensíveis do painel. Use apenas em ambiente de testes ou quando tiver certeza."
        breadcrumb={buildBreadcrumbs("/admin/definicoes")}
      />

      <AdminSection
        title="Limpeza de dados"
        description="Apaga dados da aplicação e contas. O sistema volta ao estado inicial. Utilize apenas para testes ou reinício completo."
      >
        <AdminCard>
          <div className="space-y-6">
            <p className="text-sm text-[#57534e] dark:text-[#888]">
              Escolha uma das opções abaixo conforme o que pretende fazer. Ambas as ações
              requerem confirmação e podem redirecionar para a página inicial.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Tem a certeza? Todos os dados e contas (servidor e browser) serão apagados e será redirecionado para a página inicial."
                    )
                  )
                    return;
                  await clearAllDataAndRedirect();
                }}
                className="rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-[#111] dark:text-red-400 dark:hover:bg-red-950"
              >
                Limpar dados (Admin API)
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (typeof window === "undefined") return;
                  if (token) {
                    try {
                      const { message } = await getLimparDados(token);
                      if (
                        !window.confirm(
                          `${message}\n\nConfirmar limpeza? Será redirecionado para a página inicial.`
                        )
                      )
                        return;
                    } catch {
                      if (
                        !window.confirm(
                          "Confirmar limpeza? Será redirecionado. A sessão será terminada."
                        )
                      )
                        return;
                    }
                  } else {
                    if (
                      !window.confirm(
                        "Reiniciar dados (apaga utilizadores e dados, recria roles). Será redirecionado. Confirmar?"
                      )
                    )
                      return;
                  }
                  await homeLimparDadosAndRedirect();
                }}
                className="rounded-xl border border-amber-300 bg-white px-5 py-2.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-50 dark:border-amber-700 dark:bg-[#111] dark:text-amber-400 dark:hover:bg-amber-950"
              >
                Reiniciar dados (Home API)
              </button>
            </div>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection
        title="Sobre o painel"
        description="Informação sobre esta área de administração."
      >
        <AdminCard>
          <ul className="space-y-2 text-sm text-[#57534e] dark:text-[#888]">
            <li>• <strong className="text-[#1c1917] dark:text-white">Dashboard:</strong> estatísticas agrupadas e atividade recente.</li>
            <li>• <strong className="text-[#1c1917] dark:text-white">Utilizadores:</strong> listar, editar roles e associação a funcionários.</li>
            <li>• <strong className="text-[#1c1917] dark:text-white">Logs:</strong> auditoria de ações com filtros e paginação.</li>
            <li>• <strong className="text-[#1c1917] dark:text-white">Definições:</strong> limpeza de dados (apenas para testes).</li>
          </ul>
        </AdminCard>
      </AdminSection>
    </motion.div>
  );
}
