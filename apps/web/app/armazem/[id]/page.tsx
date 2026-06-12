"use client";

import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import MapaCoordenadas from "@/app/components/MapaCoordenadas";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { type Paiol, mapPaiolFromApi } from "@/app/lib/armazem";
import { fetchPaiolDetalheJson } from "@/app/lib/paiolApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import {
  btnPrimary,
  btnSecondary,
  btnDanger,
  cardClass,
  sectionTitleClass,
} from "@/app/armazem/_components/armazemUi";
import PaiolIdentificacaoCard from "@/app/armazem/_components/PaiolIdentificacaoCard";
import PaiolLicencaCapacidadeCard from "@/app/armazem/_components/PaiolLicencaCapacidadeCard";
import PaiolDocumentosCard from "@/app/armazem/_components/PaiolDocumentosCard";

type PaiolDetalheData = {
  paiol: Paiol;
  mleAtual: number;
  percentagem: number;
};

function mapApiToPaiolDetalhe(data: Record<string, unknown> | null, id: string): PaiolDetalheData | null {
  if (!data) return null;
  const p = (data.paiol ?? data.Paiol) as Record<string, unknown> | undefined;
  if (!p) return null;
  const paiol = mapPaiolFromApi(data, id);
  const mleAtual = Number(data.nemAtual ?? data.NemAtual ?? 0);
  const percentagem = paiol.limiteMLE > 0 ? (mleAtual / paiol.limiteMLE) * 100 : 0;
  return { paiol, mleAtual, percentagem };
}

export default function PaiolDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const canGerirArmazem = (user?.permissions ?? []).includes("armazem.gerir");
  const id = params.id as string;
  const criado = searchParams.get("criado") === "1";
  const editado = searchParams.get("editado") === "1";

  const numId = parseInt(id, 10);
  const validId = !Number.isNaN(numId);

  const {
    data: detalheData,
    isLoading: loadingApi,
    isRefetching,
    error: queryError,
  } = useQuery({
    queryKey: ["armazem", "paiol", id],
    queryFn: async (): Promise<PaiolDetalheData | null> => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        throw new Error("Sessão expirada.");
      }
      try {
        const data = await fetchPaiolDetalheJson(token, numId);
        if (!data) return null;
        return mapApiToPaiolDetalhe(data, id);
      } catch (e) {
        if (e instanceof Error && e.message === "UNAUTHORIZED") {
          router.replace("/login");
          throw new Error("Sessão expirada.");
        }
        throw e;
      }
    },
    staleTime: 30 * 1000,
    retry: 2,
    enabled: validId && !!getToken(),
  });

  const paiol = detalheData?.paiol ?? null;
  const mleAtual = detalheData?.mleAtual ?? 0;
  const percentagem = detalheData?.percentagem ?? 0;
  const errorApi = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;

  if (loadingApi) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (queryError || !paiol) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Navbar />
        <main className="p-8 pt-content-offset">
          {queryError && (
            <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {errorApi ?? "Erro ao carregar detalhes."}
            </p>
          )}
          {!queryError && <p className="text-gray-600 dark:text-gray-400">{errorApi ?? "Paiol não encontrado."}</p>}
          <Link href="/armazem" data-button className="mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline">
            ← Voltar ao Armazém
          </Link>
        </main>
      </div>
    );
  }

  const docs = paiol.documentosExtras ?? [];

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset">
        <div className="mx-auto max-w-5xl">
          {(criado || editado) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={transitionSmooth}
              className="mb-6 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              {criado ? "Paiol criado com sucesso." : "Alterações guardadas."}
            </motion.p>
          )}

          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                {paiol.nome}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                {canGerirArmazem ? "Detalhes do paiol" : "Informação do paiol"}
                {canGerirArmazem && paiol.dataRegisto
                  ? ` · Registo em ${new Date(paiol.dataRegisto).toLocaleDateString("pt-PT")}`
                  : ""}
                {isRefetching && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]" />
                    A atualizar
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/armazem/${id}/conteudo`} className={btnPrimary}>
                Ver conteúdo do paiol
              </Link>
              {canGerirArmazem && (
                <>
                  <Link href={`/armazem/${id}/editar`} className={btnSecondary}>
                    Editar
                  </Link>
                  <Link href={`/armazem/${id}/eliminar`} className={btnDanger}>
                    Eliminar
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          <div className={`mt-10 grid gap-6 ${canGerirArmazem ? "lg:grid-cols-2" : ""}`}>
            <PaiolIdentificacaoCard paiol={paiol} />
            {canGerirArmazem && (
              <PaiolLicencaCapacidadeCard paiol={paiol} mleAtual={mleAtual} percentagem={percentagem} />
            )}
          </div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: canGerirArmazem ? 0.07 : 0.06 }}
            className={`mt-6 ${cardClass}`}
          >
            <h2 className={sectionTitleClass}>Localização e mapa</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Coordenadas do paiol. Ao integrar a API do mapa, poderá seleccionar o ponto no mapa para preencher automaticamente.
            </p>
            <div className="mt-4">
              <MapaCoordenadas
                readOnly
                lat={paiol.coordenadasLat}
                lng={paiol.coordenadasLng}
                mapContainerId="mapa-paiol-detalhe"
              />
            </div>
          </motion.section>

          {canGerirArmazem && <PaiolDocumentosCard paiolId={id} docs={docs} />}

          <p className="mt-10">
            <Link
              href="/armazem"
              data-button
              className="text-[#f97316] transition-[color] duration-200 hover:underline"
            >
              ← Voltar ao Armazém
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
