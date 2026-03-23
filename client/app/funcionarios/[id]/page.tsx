"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "../../components/Navbar";
import type { Funcionario, CargoFuncionario } from "../../lib/funcionarios";
import { getToken } from "../../lib/auth";
import { useUser } from "@/app/context/UserContext";
import { safeParseJson } from "../../lib/api";
import { fadeInUp, transitionSmooth } from "../../lib/animations";

import { apiPath } from "@/app/lib/apiConfig";

const API_BASE = apiPath("api/funcionarios");

function mapApiItemToFuncionario(item: Record<string, unknown>, contaEmailConfirmada?: boolean): Funcionario {
  const nome = (item.nomeCompleto ?? item.NomeCompleto ?? item.nome ?? "") as string;
  // A API de detalhe devolve HasCartaoCidadao, HasDocumentoADR, etc. (não os caminhos); usar esses para mostrar a secção Documentos
  const hasCc = Boolean(item.hasCartaoCidadao ?? item.HasCartaoCidadao ?? item.cartaoCidadaoCaminho ?? item.CartaoCidadaoCaminho);
  const hasAdr = Boolean(item.hasDocumentoADR ?? item.HasDocumentoADR ?? item.documentoADDRCaminho ?? item.DocumentoADDRCaminho);
  const hasLic = Boolean(item.hasLicencaOperador ?? item.HasLicencaOperador ?? item.licencaOperadorCaminho ?? item.LicencaOperadorCaminho);
  const hasOutros = Boolean(item.hasOutros ?? item.HasOutros ?? item.outrosCaminho ?? item.OutrosCaminho);
  const apiExtras = (item.documentosExtras ?? item.DocumentosExtras ?? []) as Record<string, unknown>[];
  const extras = apiExtras.map((ex) => ({
    id: String(ex.id ?? ex.Id ?? ""),
    nome: String(ex.nome ?? ex.Nome ?? ""),
  }));
  const documentos: Funcionario["documentos"] =
    hasCc || hasAdr || hasLic || hasOutros || extras.length > 0
      ? {
          cartaoCidadao: hasCc ? "cc" : undefined,
          adr: hasAdr ? "adr" : undefined,
          licencaOperador: hasLic ? "licenca" : undefined,
          outros: hasOutros ? "outros" : undefined,
          extras,
        }
      : undefined;
  return {
    id: String(item.id ?? item.Id ?? ""),
    nomeCompleto: nome,
    nif: (item.nif ?? item.NIF) as string | undefined,
    email: (item.email ?? item.Email) as string | undefined,
    telefone: (item.telefone ?? item.Telefone) as string | undefined,
    morada: (item.morada ?? item.Morada) as string | undefined,
    nss: (item.nss ?? item.NSS) as string | undefined,
    iban: (item.iban ?? item.IBAN) as string | undefined,
    cargo: (item.cargo ?? item.Cargo ?? "Comercial") as CargoFuncionario,
    notas: (item.notas ?? item.Notas) as string | undefined,
    dataRegisto: String(item.dataRegisto ?? item.DataRegisto ?? new Date().toISOString()),
    contaAssociada: Boolean(item.userId ?? item.UserId),
    emailConfirmado: contaEmailConfirmada ?? (item.emailConfirmado as boolean | undefined),
    userId: (item.userId ?? item.UserId) as string | undefined,
    documentos,
  };
}

const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

const btnDanger =
  "data-button rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-[border-color,background-color,color] duration-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950";

function DocLink({ label, fileName }: { label: string; fileName: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-[#222] px-3 py-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => alert("Em modo demonstração os ficheiros não estão disponíveis para abrir.")}
          data-button
          className="text-sm text-[#f97316] transition-[color] duration-200 hover:underline"
        >
          Abrir
        </button>
        <button
          type="button"
          onClick={() => alert("Em modo demonstração os ficheiros não estão disponíveis para transferir.")}
          data-button
          className="text-sm text-[#f97316] transition-[color] duration-200 hover:underline"
        >
          Transferir
        </button>
      </div>
    </div>
  );
}

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
      const res = await fetch(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          throw new Error("Sessão expirada.");
        }
        const text = await res.text();
        throw new Error(res.status === 404 ? "Funcionário não encontrado." : text || `Erro ${res.status}`);
      }
      const value = (await safeParseJson(res)) as unknown;
      const data = value as { item?: Record<string, unknown>; contaEmailConfirmada?: boolean };
      const raw = data?.item ?? data;
      if (raw && typeof raw === "object")
        return mapApiItemToFuncionario(raw as Record<string, unknown>, data.contaEmailConfirmada);
      return null;
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
        <main style={{ paddingTop: CONTENT_OFFSET_TOP }} className="p-8">
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
    funcionario.contaAssociada &&
    currentUserId &&
    (funcionario.userId === currentUserId ||
      funcionario.userId === `u-${currentUserId}` ||
      funcionario.email === currentUserId);

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
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
              <div><dt className={labelClass}>Nome completo</dt><dd className="mt-1 text-gray-900 dark:text-white">{funcionario.nomeCompleto}</dd></div>
              <div><dt className={labelClass}>NIF</dt><dd className="mt-1 text-gray-600 dark:text-gray-400">{funcionario.nif ?? "—"}</dd></div>
              <div><dt className={labelClass}>Email</dt><dd className="mt-1 text-gray-600 dark:text-gray-400">{funcionario.email ?? "—"}</dd></div>
              <div><dt className={labelClass}>Telefone</dt><dd className="mt-1 text-gray-600 dark:text-gray-400">{funcionario.telefone ?? "—"}</dd></div>
              <div className="sm:col-span-2"><dt className={labelClass}>Morada</dt><dd className="mt-1 text-gray-600 dark:text-gray-400">{funcionario.morada ?? "—"}</dd></div>
              <div><dt className={labelClass}>N.º Segurança Social</dt><dd className="mt-1 text-gray-600 dark:text-gray-400">{funcionario.nss ?? "—"}</dd></div>
              <div><dt className={labelClass}>IBAN</dt><dd className="mt-1 text-gray-600 dark:text-gray-400">{funcionario.iban ?? "—"}</dd></div>
              <div><dt className={labelClass}>Cargo</dt><dd className="mt-1 text-gray-900 dark:text-white">{funcionario.cargo}</dd></div>
              {funcionario.notas && (
                <div className="sm:col-span-2"><dt className={labelClass}>Notas</dt><dd className="mt-1 text-gray-600 dark:text-gray-400">{funcionario.notas}</dd></div>
              )}
            </dl>
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

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.1 }}
            className={`mt-8 ${cardClass}`}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documentos</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Abrir ou transferir cada documento guardado.</p>
            <div className="mt-4 space-y-2">
              {docs.cartaoCidadao && <DocLink label="Cartão de cidadão" fileName={docs.cartaoCidadao} />}
              {docs.adr && <DocLink label="Documento ADR" fileName={docs.adr} />}
              {docs.licencaOperador && <DocLink label="Licença de operador" fileName={docs.licencaOperador} />}
              {docs.outros && <DocLink label="Outros" fileName={docs.outros} />}
              {docs.extras.map((ex) => (
                <DocLink key={ex.id} label={ex.nome} fileName={ex.id} />
              ))}
              {!docs.cartaoCidadao && !docs.adr && !docs.licencaOperador && !docs.outros && docs.extras.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum documento guardado.</p>
              )}
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
