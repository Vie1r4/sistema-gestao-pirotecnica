"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "../../../components/Navbar";
import { getToken } from "../../../lib/auth";
import { useUser } from "@/app/context/UserContext";
import { safeParseJson } from "../../../lib/api";
import type { Funcionario, CargoFuncionario } from "../../../lib/funcionarios";
import { fadeInUp, transitionSmooth } from "../../../lib/animations";

import { apiPath } from "@/app/lib/apiConfig";

const API_BASE = apiPath("api/funcionarios");
const AUTH_ME = apiPath("api/auth/me");

function mapApiItemToFuncionario(item: Record<string, unknown>, contaEmailConfirmada?: boolean): Funcionario {
  const nome = (item.nomeCompleto ?? item.NomeCompleto ?? item.nome ?? "") as string;
  const cartaoCidadao = (item.cartaoCidadaoCaminho ?? item.CartaoCidadaoCaminho) as string | undefined;
  const adr = (item.documentoADDRCaminho ?? item.DocumentoADDRCaminho) as string | undefined;
  const licencaOperador = (item.licencaOperadorCaminho ?? item.LicencaOperadorCaminho) as string | undefined;
  const outros = (item.outrosCaminho ?? item.OutrosCaminho) as string | undefined;
  const apiExtras = (item.documentosExtras ?? item.DocumentosExtras ?? []) as Record<string, unknown>[];
  const extras = apiExtras.map((ex) => ({
    id: String(ex.id ?? ex.Id ?? ""),
    nome: String(ex.nome ?? ex.Nome ?? ""),
  }));
  const documentos: Funcionario["documentos"] =
    cartaoCidadao || adr || licencaOperador || outros || extras.length > 0
      ? { cartaoCidadao, adr, licencaOperador, outros, extras }
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

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

const btnDanger =
  "data-button rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-[background-color,opacity] duration-200 hover:bg-amber-700";

export default function DesassociarContaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useUser();
  const currentUserId = user?.id ?? user?.email ?? null;
  const canGerirFuncionarios = (user?.permissions ?? []).includes("funcionarios.gerir");
  const [mounted, setMounted] = useState(false);
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!id || !mounted) return;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${API_BASE}/${id}`, { headers })
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login");
          return null;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(res.status === 404 ? "Funcionário não encontrado." : text || `Erro ${res.status}`);
        }
        const data = (await safeParseJson(res)) as { item?: Record<string, unknown>; contaEmailConfirmada?: boolean };
        const raw = data?.item ?? data;
        return raw && typeof raw === "object" ? mapApiItemToFuncionario(raw as Record<string, unknown>, data.contaEmailConfirmada) : null;
      })
      .then((f) => setFuncionario(f ?? null))
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : "Erro ao carregar.");
        setFuncionario(null);
      })
      .finally(() => setLoading(false));
  }, [id, mounted, router]);

  const isOwnAccount =
    !!funcionario?.contaAssociada &&
    !!currentUserId &&
    (funcionario.userId === currentUserId || funcionario.email === currentUserId);

  const handleConfirmar = async () => {
    if (submittingRef.current) return;
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
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/${id}/desassociar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await safeParseJson(res).catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setMessage({ type: "success", text: "Conta desassociada. A ficha do funcionário mantém-se." });
        setTimeout(() => router.push(`/funcionarios/${id}`), 1200);
        return;
      }
      if (res.status === 400 && data.error) {
        setMessage({ type: "error", text: data.error });
        return;
      }
      if (res.status === 403) {
        setMessage({ type: "error", text: "Sem permissão para desassociar contas." });
        return;
      }
      setMessage({ type: "error", text: data.error || "Ocorreu um erro ao desassociar a conta." });
    } catch {
      setMessage({ type: "error", text: "Não foi possível contactar o servidor." });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (!mounted || loading) {
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
                disabled={submitting || !!message?.text || isOwnAccount}
                className={btnDanger}
              >
                {submitting ? "A processar…" : "Confirmar desassociação"}
              </button>
              <Link href={`/funcionarios/${id}`} className={btnSecondary}>Cancelar</Link>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
