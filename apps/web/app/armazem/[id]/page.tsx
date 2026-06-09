"use client";

import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import MapaCoordenadas from "@/app/components/MapaCoordenadas";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { type Paiol, type PaiolDocumentoExtra, labelPerfilRisco } from "@/app/lib/armazem";
import { fetchPaiolDetalheJson, openDocumento } from "@/app/lib/paiolApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

type CargaItem = { produtoId: string; produtoNome: string; quantidade: number; nemPorUnidade: number; divisao: string };

type PaiolDetalheData = {
  paiol: Paiol;
  carga: CargaItem[];
  mleAtual: number;
  percentagem: number;
};

function mapApiToPaiolDetalhe(data: Record<string, unknown> | null, id: string): PaiolDetalheData | null {
  if (!data) return null;
  const p = (data.paiol ?? data.Paiol) as Record<string, unknown> | undefined;
  if (!p) return null;
  const get = (key: string) => p[key] ?? p[key.charAt(0).toUpperCase() + key.slice(1)];
  const docExtras = (get("documentosExtras") ?? get("DocumentosExtras") ?? []) as Array<Record<string, unknown>>;
  const cargos = (get("cargosAcesso") ?? data.cargosAcesso ?? data.CargosAcesso ?? []) as string[];
  const paiol: Paiol = {
    id: String(get("id") ?? get("Id") ?? id),
    nome: String(get("nome") ?? get("Nome") ?? ""),
    localizacao: (get("localizacao") ?? get("Localizacao")) as string | undefined,
    coordenadasLat: (get("coordenadasLat") ?? get("CoordenadasLat")) as number | undefined,
    coordenadasLng: (get("coordenadasLng") ?? get("CoordenadasLng")) as number | undefined,
    limiteMLE: Number(get("limiteMLE") ?? get("LimiteMLE") ?? 0),
    perfilRisco: String(get("perfilRisco") ?? get("PerfilRisco") ?? "1.1") as Paiol["perfilRisco"],
    estado: String(get("estado") ?? get("Estado") ?? "Ativo") as Paiol["estado"],
    dataValidadeLicenca: (get("dataValidadeLicenca") ?? get("DataValidadeLicenca")) as string | undefined,
    numeroLicenca: (get("numeroLicenca") ?? get("NumeroLicenca")) as string | undefined,
    divisaoDominante: (get("divisaoDominante") ?? get("DivisaoDominante")) as string | undefined,
    cargosAcesso: Array.isArray(cargos) ? (cargos as Paiol["cargosAcesso"]) : [],
    documentosExtras: docExtras.map((d) => ({
      id: String(d.id ?? d.Id ?? ""),
      nome: String(d.nome ?? d.Nome ?? ""),
      caminho: (d.caminho ?? d.Caminho) as string | undefined,
    })) as PaiolDocumentoExtra[],
    dataRegisto: (get("dataRegisto") ?? get("DataRegisto") ?? new Date().toISOString()) as string,
  };
  const cargaRaw = (data.carga ?? data.Carga) as Array<Record<string, unknown>> | undefined;
  const carga = Array.isArray(cargaRaw)
    ? cargaRaw.map((x) => ({
        produtoId: String(x.produtoId ?? x.ProdutoId ?? ""),
        produtoNome: String(x.produtoNome ?? x.ProdutoNome ?? ""),
        quantidade: Number(x.quantidade ?? x.Quantidade ?? 0),
        nemPorUnidade: Number(x.nemPorUnidade ?? x.NEMPorUnidade ?? 0),
        divisao: String(x.divisao ?? x.Divisao ?? ""),
      }))
    : [];
  const mleAtual = Number(data.nemAtual ?? data.NemAtual ?? 0);
  const limite = Number(get("limiteMLE") ?? get("LimiteMLE") ?? 1);
  const percentagem = limite > 0 ? (mleAtual / limite) * 100 : 0;
  return { paiol, carga, mleAtual, percentagem };
}

const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

const sectionTitleClass = "text-lg font-semibold text-gray-900 dark:text-white";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

const btnDanger =
  "data-button rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-[border-color,background-color,color] duration-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950";

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
  const carga = detalheData?.carga ?? [];
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
        <main  className="p-8 pt-content-offset">
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

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
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
                Detalhes do paiol
                {paiol.dataRegisto ? ` · Registo em ${new Date(paiol.dataRegisto).toLocaleDateString("pt-PT")}` : ""}
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

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.05 }}
              className={cardClass}
            >
              <h2 className={sectionTitleClass}>Identificação</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-1">
                <div>
                  <dt className={labelClass}>Nome</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{paiol.nome}</dd>
                </div>
                <div>
                  <dt className={labelClass}>Localização (texto)</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">{paiol.localizacao ?? "—"}</dd>
                </div>
                <div>
                  <dt className={labelClass}>Estado</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">{paiol.estado}</dd>
                </div>
                <div>
                  <dt className={labelClass}>Cargos com acesso</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">
                    {paiol.cargosAcesso?.length ? paiol.cargosAcesso.join(", ") : "—"}
                  </dd>
                </div>
              </dl>
            </motion.section>

            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.06 }}
              className={cardClass}
            >
              <h2 className={sectionTitleClass}>Licença e capacidade</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-1">
                <div>
                  <dt className={labelClass}>N.º licença</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">{paiol.numeroLicenca ?? "—"}</dd>
                </div>
                <div>
                  <dt className={labelClass}>Validade da licença</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">
                    {paiol.dataValidadeLicenca ? new Date(paiol.dataValidadeLicenca).toLocaleDateString("pt-PT") : "—"}
                  </dd>
                </div>
                <div>
                  <dt className={labelClass}>Perfil de risco</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">{labelPerfilRisco(paiol.perfilRisco)}</dd>
                </div>
                <div>
                  <dt className={labelClass}>Limite MLE (kg)</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">{paiol.limiteMLE}</dd>
                </div>
                <div>
                  <dt className={labelClass}>NEM atual / capacidade</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-400">
                    {mleAtual.toFixed(1)} kg / {paiol.limiteMLE} kg ({percentagem.toFixed(0)}%)
                  </dd>
                </div>
              </dl>
            </motion.section>
          </div>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.07 }}
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

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.1 }}
            className={`mt-6 ${cardClass}`}
          >
            <h2 className={sectionTitleClass}>Carga no paiol</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Produtos em stock (quantidade × NEM por unidade = NEM total). Ocupação baseada em NEM (legislação portuguesa).
            </p>
            <div className="mt-4 overflow-x-auto">
              {carga.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhum produto em stock. Use &quot;Adicionar material&quot; no conteúdo do paiol para registar entradas.
                </p>
              ) : (
                <table className="w-full min-w-[400px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#222]">
                      <th className="pb-2 font-semibold text-gray-700 dark:text-gray-300">Produto</th>
                      <th className="pb-2 font-semibold text-gray-700 dark:text-gray-300">Divisão de risco</th>
                      <th className="pb-2 font-semibold text-gray-700 dark:text-gray-300">Quantidade</th>
                      <th className="pb-2 font-semibold text-gray-700 dark:text-gray-300">NEM (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carga.map((item) => (
                      <tr key={item.produtoId} className="border-b border-gray-100 dark:border-[#1a1a1a]">
                        <td className="py-2 text-gray-900 dark:text-white">{item.produtoNome}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">{item.divisao}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">{item.quantidade}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">
                          {(item.quantidade * item.nemPorUnidade).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.12 }}
            className={`mt-6 ${cardClass}`}
          >
            <h2 className={sectionTitleClass}>Documentação</h2>
            <div className="mt-4 space-y-2">
              {docs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhum documento guardado.
                </p>
              ) : (
                docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-[#222]"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {doc.nome || "Documento"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const token = getToken();
                        const numId = parseInt(id, 10);
                        const extraId = parseInt(doc.id, 10);
                        if (token && !Number.isNaN(numId) && !Number.isNaN(extraId)) {
                          openDocumento(token, numId, extraId).catch(() => alert("Não foi possível abrir o documento."));
                        }
                      }}
                      className="text-sm text-[#f97316] transition-[color] duration-200 hover:underline"
                    >
                      Ver documento
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.section>

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
