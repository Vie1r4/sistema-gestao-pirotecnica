"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import DocLink from "../_components/FuncionarioDocLink";
import LicencaOperadorDetalheBlock from "../_components/LicencaOperadorDetalheBlock";
import CartaoCidadaoDetalheBlock from "../_components/CartaoCidadaoDetalheBlock";
import type { Funcionario } from "../../lib/funcionarios";
import { getToken } from "../../lib/auth";
import { useUser } from "@/app/context/UserContext";
import { fadeInUp, transitionSmooth } from "../../lib/animations";
import { fetchFuncionarioPorId } from "@/app/lib/funcionariosApi";
import { cardClass, labelClass, btnPrimary, btnSecondary, btnDanger } from "@/app/components/ui/tokens";

export default function FuncionarioDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useUser();
  const canGerirFuncionarios = (user?.permissions ?? []).includes("funcionarios.gerir");
  const currentUserId = user?.id ?? user?.email ?? null;

  const {
    data: funcionario,
    isLoading: loading,
    isRefetching,
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
    staleTime: 30 * 1000,
    retry: 2,
    enabled: !!id && !!getToken(),
  });

  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (error || !funcionario) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main  className="p-8 pt-content-offset">
          {error && (
            <p className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </p>
          )}
          {!error && <p className="text-gray-600 dark:text-gray-400">Funcionário não encontrado.</p>}
          <Link href="/funcionarios" data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">← Voltar à lista</Link>
        </main>
      </div>
    );
  }

  const docs = funcionario.documentos ?? { extras: [] };
  const isOwnAccount =
    funcionario.associadoAoUtilizadorAtual === true ||
    (funcionario.contaAssociada &&
      currentUserId &&
      (funcionario.userId === currentUserId ||
        funcionario.userId === `u-${currentUserId}` ||
        funcionario.email === currentUserId));

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                {funcionario.nomeCompleto}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                Ficha do funcionário · Registo em {new Date(funcionario.dataRegisto).toLocaleDateString("pt-PT")}
                {isRefetching && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]" />
                    A atualizar
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/funcionarios" className={btnSecondary}>← Lista</Link>
              {canGerirFuncionarios && (
                <>
                  <Link href={`/funcionarios/${id}/editar`} className={btnPrimary}>Editar</Link>
                  <Link href={`/funcionarios/${id}/eliminar`} className={btnDanger}>Eliminar</Link>
                  {funcionario.contaAssociada && !isOwnAccount && (
                    <Link href={`/funcionarios/${id}/desassociar`} className={btnSecondary}>Desassociar conta</Link>
                  )}
                </>
              )}
            </div>
          </motion.div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className={`mt-10 ${cardClass}`}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dados pessoais</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className={labelClass}>Nome completo</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{funcionario.nomeCompleto}</dd>
              </div>
              <div>
                <dt className={labelClass}>Email</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-400">{funcionario.email ?? "—"}</dd>
              </div>
              <div>
                <dt className={labelClass}>Telefone</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-400">{funcionario.telefone ?? "—"}</dd>
              </div>
              <div>
                <dt className={labelClass}>N.º Segurança Social</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-400">{funcionario.nss ?? "—"}</dd>
              </div>
              <div>
                <dt className={labelClass}>IBAN</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-400">{funcionario.iban ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className={labelClass}>Cargo</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{funcionario.cargo}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className={labelClass}>Notas</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-400">{funcionario.notas?.trim() || "—"}</dd>
              </div>
            </dl>

            <CartaoCidadaoDetalheBlock
              funcionarioId={id}
              funcionario={funcionario}
              canGerir={canGerirFuncionarios}
            />

            <LicencaOperadorDetalheBlock
              funcionarioId={id}
              funcionario={funcionario}
              canGerir={canGerirFuncionarios}
            />

            {canGerirFuncionarios && (
              <div className="mt-8 border-t border-gray-200 pt-6 dark:border-[#222]">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Documentos</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Ficheiros guardados na ficha — abrir ou transferir.
                </p>
                <div className="mt-4 space-y-2">
                  {docs.adr && (
                    <DocLink funcionarioId={id} label="Documento ADR" tipo="addr" fileName={docs.adr} />
                  )}
                  {docs.outros && (
                    <DocLink funcionarioId={id} label="Outros" tipo="outros" fileName={docs.outros} />
                  )}
                  {docs.extras.map((ex) => (
                    <DocLink key={ex.id} funcionarioId={id} label={ex.nome} tipo="extra" extraId={ex.id} fileName={ex.nome} />
                  ))}
                  {!docs.adr && !docs.outros && docs.extras.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum documento guardado.</p>
                  )}
                </div>
              </div>
            )}
          </motion.section>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.08 }}
            className={`mt-8 ${cardClass}`}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conta de acesso ao sistema</h2>
            {funcionario.contaAssociada ? (
              <>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {funcionario.emailConfirmado !== false ? (
                    <span className="font-medium text-green-600 dark:text-green-400">Conta associada. O email está confirmado.</span>
                  ) : (
                    <span className="font-medium text-amber-600 dark:text-amber-400">Pendente.</span>
                  )}
                </p>
                <p className="mt-2 font-medium text-gray-900 dark:text-white">Email da conta associada: {funcionario.email ?? "—"}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Os dados editados em «O meu perfil» por este utilizador ficam guardados na ficha do funcionário.</p>
              </>
            ) : (
              <p className="mt-2 text-gray-600 dark:text-gray-400">Este funcionário não tem conta de acesso associada (UserId vazio). É apenas uma ficha e não pode entrar na aplicação. Para associar uma conta, use Editar e crie a conta na secção «Conta de acesso ao sistema».</p>
            )}
          </motion.section>

        </div>
      </main>
    </div>
  );
}
