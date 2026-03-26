"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import MapaCoordenadas from "@/app/components/MapaCoordenadas";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { fetchServicoDetalheFromApi } from "@/app/lib/servicos";
import type { ServicoDetalhe, ServicoLicenca } from "@/app/lib/servicos";
import { textoCalibre, textoGrupo } from "@/app/lib/produtos";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";
const btnDanger =
  "data-button rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950";

export default function ServicoDetalhePage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useUser();
  const permissions = user?.permissions ?? [];
  const canGerirServicos = permissions.includes("servicos.gerir");
  const canApagarServicos = permissions.includes("servicos.apagar");
  const [coordsCopied, setCoordsCopied] = useState(false);

  const {
    data: servico,
    isLoading: loadingApi,
    isRefetching,
    error: queryError,
  } = useQuery({
    queryKey: ["servicos", id],
    queryFn: async (): Promise<ServicoDetalhe | null> => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      return fetchServicoDetalheFromApi(token, id);
    },
    staleTime: 30 * 1000,
    retry: 2,
    enabled: !!id && !!getToken(),
  });

  const equipaOrdenada = useMemo(() => {
    const eq = servico?.equipa;
    if (!eq?.length) return [];
    return [...eq].sort((a, b) =>
      (a.funcionario?.nomeCompleto ?? "").localeCompare(b.funcionario?.nomeCompleto ?? "", "pt", { sensitivity: "base" })
    );
  }, [servico?.equipa]);

  const copyCoords = () => {
    if (servico?.coordenadasLat != null && servico?.coordenadasLng != null && typeof window !== "undefined") {
      const s = `${servico.coordenadasLat}, ${servico.coordenadasLng}`;
      window.navigator.clipboard.writeText(s);
      setCoordsCopied(true);
      setTimeout(() => setCoordsCopied(false), 2000);
    }
  };

  if (loadingApi) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (queryError || !servico) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]">
        <Navbar />
        <main className="px-6 pt-14 pb-10" style={{ paddingTop: CONTENT_OFFSET_TOP }}>
          <div className="mx-auto max-w-2xl rounded-xl border border-[#e7e5e4] bg-white p-8 dark:border-[#1f1f1f] dark:bg-[#111]">
            {queryError && (
              <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {queryError instanceof Error ? queryError.message : "Erro ao carregar serviço."}
              </p>
            )}
            {!queryError && <p className="text-[#57534e] dark:text-gray-400">Serviço não encontrado.</p>}
            <Link href="/servicos" className="mt-4 inline-block text-[#f97316] hover:underline">
              ← Voltar à lista
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const localizacaoPartes = [servico.distrito, servico.cidade, servico.municipio].filter(Boolean);
  const googleMapsUrl =
    servico.coordenadasLat != null && servico.coordenadasLng != null
      ? `https://www.google.com/maps?q=${servico.coordenadasLat},${servico.coordenadasLng}&z=17`
      : null;

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main className="relative px-6 pt-14 pb-10 sm:px-8" style={{ paddingTop: CONTENT_OFFSET_TOP }}>
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
            className="flex flex-wrap items-start justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Serviço #{servico.id}</h1>
              <p className="mt-1 flex items-center gap-2 text-[#57534e] dark:text-gray-400">
                {new Date(servico.dataServico).toLocaleDateString("pt-PT")} · {servico.cliente?.nome ?? servico.clienteId}
                {isRefetching && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]" />
                    A atualizar
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {servico.encomendaId && (
                <Link
                  href={`/encomendas/${servico.encomendaId}`}
                  className="rounded-xl border border-[#e7e5e4] bg-white px-4 py-2 text-sm font-medium dark:border-[#333] dark:bg-[#111]"
                >
                  Ver encomenda #{servico.encomendaId}
                </Link>
              )}
              {canGerirServicos && (
                <Link href={`/servicos/${servico.id}/editar`} className={btnSecondary}>
                  Editar
                </Link>
              )}
              {canApagarServicos && (
                <Link href={`/servicos/${servico.id}/eliminar`} className={btnDanger}>
                  Eliminar
                </Link>
              )}
              <Link href="/servicos" className={btnSecondary}>
                Voltar à lista
              </Link>
            </div>
          </motion.div>

          {/* Dados do serviço + Equipa (mesmo cartão) */}
          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="mt-8 overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]"
          >
            <div className="border-b border-[#e7e5e4] bg-[#fafaf9] px-5 py-4 sm:px-6 dark:border-[#222] dark:bg-[#141414]">
              <h2 className="text-lg font-semibold tracking-tight text-[#1c1917] dark:text-white">Dados do serviço</h2>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-stretch">
              <div className="min-w-0 flex-1 px-5 py-5 sm:px-6 sm:py-6">
                <dl className="grid gap-x-6 gap-y-3.5 text-sm sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:gap-y-3">
                  <dt className="text-[#57534e] dark:text-gray-400 sm:pt-0.5">Cliente</dt>
                  <dd className="text-[#1c1917] dark:text-gray-100">{servico.cliente?.nome ?? servico.clienteId}</dd>
                  <dt className="text-[#57534e] dark:text-gray-400 sm:pt-0.5">Data</dt>
                  <dd className="text-[#1c1917] dark:text-gray-100">
                    {new Date(servico.dataServico).toLocaleDateString("pt-PT")}
                  </dd>
                  <dt className="text-[#57534e] dark:text-gray-400 sm:pt-0.5">Público / Privado</dt>
                  <dd className="text-[#1c1917] dark:text-gray-100">{servico.publicoPrivado ?? "—"}</dd>
                  {servico.raioPublico != null && (
                    <>
                      <dt className="text-[#57534e] dark:text-gray-400 sm:pt-0.5">Raio público</dt>
                      <dd className="text-[#1c1917] dark:text-gray-100">{servico.raioPublico} m</dd>
                    </>
                  )}
                  {servico.local && (
                    <>
                      <dt className="text-[#57534e] dark:text-gray-400 sm:pt-0.5">Local</dt>
                      <dd className="text-[#1c1917] dark:text-gray-100">{servico.local}</dd>
                    </>
                  )}
                  {localizacaoPartes.length > 0 && (
                    <>
                      <dt className="text-[#57534e] dark:text-gray-400 sm:pt-0.5">Localização</dt>
                      <dd className="text-[#1c1917] dark:text-gray-100">{localizacaoPartes.join(" · ")}</dd>
                    </>
                  )}
                  {servico.coordenadasLat != null && servico.coordenadasLng != null && (
                    <>
                      <dt className="text-[#57534e] dark:text-gray-400 sm:pt-0.5">Coordenadas</dt>
                      <dd className="flex flex-wrap items-center gap-2 text-[#1c1917] dark:text-gray-100">
                        <span className="font-mono text-[0.8125rem]">
                          {Number(servico.coordenadasLat).toFixed(4)}° N, {Number(servico.coordenadasLng).toFixed(4)}° W
                        </span>
                        {googleMapsUrl && (
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#f97316] hover:underline"
                          >
                            Abrir no Google Maps
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={copyCoords}
                          className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#333]"
                        >
                          {coordsCopied ? "Copiado" : "Copiar"}
                        </button>
                      </dd>
                    </>
                  )}
                  {servico.observacoes && (
                    <>
                      <dt className="self-start text-[#57534e] dark:text-gray-400 sm:pt-0.5">Observações</dt>
                      <dd className="whitespace-pre-wrap rounded-lg bg-[#fafaf9] p-3 text-[#292524] dark:bg-[#1a1a1a] dark:text-gray-200">
                        {servico.observacoes}
                      </dd>
                    </>
                  )}
                </dl>
              </div>
              <aside className="shrink-0 border-t border-[#e7e5e4] bg-[#fafaf9]/80 px-5 py-5 sm:px-6 sm:py-6 lg:w-[min(100%,18rem)] lg:border-t-0 lg:border-l lg:border-[#e7e5e4] dark:border-[#222] dark:bg-[#141414]/80">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#78716c] dark:text-gray-500">
                  Equipa
                </h3>
                {equipaOrdenada.length === 0 && !servico.responsavelTecnico ? (
                  <p className="text-sm leading-relaxed text-[#57534e] dark:text-gray-400">
                    Nenhum funcionário foi associado a este serviço.
                  </p>
                ) : equipaOrdenada.length > 0 ? (
                  <ul className="space-y-1">
                    {equipaOrdenada.map((m, equipaIndex) => (
                      <li
                        key={`equipa-${equipaIndex}-${m.funcionarioId || m.funcionario?.id || "x"}`}
                        className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-white/80 dark:hover:bg-[#1f1f1f]/80"
                      >
                        <Link
                          href={`/funcionarios/${m.funcionarioId}`}
                          className="min-w-0 flex-1 font-medium text-[#1c1917] hover:text-[#f97316] hover:underline dark:text-white dark:hover:text-[#fdba74]"
                        >
                          {m.funcionario?.nomeCompleto ?? (m.funcionarioId ? `Funcionário #${m.funcionarioId}` : "—")}
                        </Link>
                        {String(servico.responsavelTecnicoId ?? "") === String(m.funcionarioId ?? "") && (
                          <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-[0.7rem] font-medium text-[#57534e] ring-1 ring-[#e7e5e4] dark:bg-[#1a1a1a] dark:text-gray-300 dark:ring-[#333]">
                            Responsável técnico
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  servico.responsavelTecnico && (
                    <div className="rounded-lg bg-white/90 p-3 ring-1 ring-[#e7e5e4] dark:bg-[#1a1a1a] dark:ring-[#333]">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[#78716c] dark:text-gray-500">
                        Responsável técnico
                      </p>
                      <Link
                        href={`/funcionarios/${servico.responsavelTecnicoId}`}
                        className="mt-1 inline-block font-medium text-[#1c1917] hover:text-[#f97316] hover:underline dark:text-white dark:hover:text-[#fdba74]"
                      >
                        {servico.responsavelTecnico.nomeCompleto}
                      </Link>
                    </div>
                  )
                )}
              </aside>
            </div>
          </motion.section>

          {/* Pré-visualização do mapa */}
          {(servico.coordenadasLat != null && servico.coordenadasLng != null) && (
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.06 }}
              className="mt-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]"
            >
              <h2 className="mb-4 text-lg font-semibold">Localização no mapa</h2>
              <MapaCoordenadas
                readOnly
                lat={servico.coordenadasLat}
                lng={servico.coordenadasLng}
                raioMetros={servico.raioPublico}
                mapContainerId="mapa-servico-detalhe"
              />
            </motion.section>
          )}

          {/* Material utilizado */}
          {servico.itensEncomenda.length > 0 && (
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.08 }}
              className="mt-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]"
            >
              <h2 className="mb-4 text-lg font-semibold">Material utilizado — Encomenda #{servico.encomendaId}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e7e5e4] dark:border-[#222]">
                      <th className="pb-2 pr-4 font-semibold">Produto</th>
                      <th className="pb-2 pr-4 font-semibold">Calibre</th>
                      <th className="pb-2 pr-4 font-semibold">Grupo risco</th>
                      <th className="pb-2 pr-4 font-semibold">Qtd pedida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servico.itensEncomenda.map((item) => (
                      <tr key={item.id} className="border-b border-[#f5f5f4] dark:border-[#1a1a1a]">
                        <td className="py-2 pr-4">{item.produto?.nome ?? item.produtoId}</td>
                        <td className="py-2 pr-4">{textoCalibre(item.produto?.calibre)}</td>
                        <td className="py-2 pr-4">{textoGrupo(item.produto?.grupoCompatibilidade)}</td>
                        <td className="py-2 pr-4">{Number(item.quantidadePedida).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {servico.resumoMaterial && (
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-[#fafaf9] p-3 text-sm dark:bg-[#0a0a0a]">
                  <span>
                    {servico.resumoMaterial.numeroProdutos} produtos · {servico.resumoMaterial.totalUnidades.toFixed(0)} unidades · MLE total:{" "}
                    <strong>{servico.resumoMaterial.mleTotalKg.toFixed(1)} kg</strong>
                  </span>
                  {servico.resumoMaterial.divisaoDominante && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        servico.resumoMaterial.corDivisaoDominante === "danger"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : servico.resumoMaterial.corDivisaoDominante === "warning"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            : servico.resumoMaterial.corDivisaoDominante === "success"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {servico.resumoMaterial.divisaoDominante}
                    </span>
                  )}
                  {servico.resumoMaterial.categoriasPresentes && (
                    <span className="text-[#57534e] dark:text-gray-400">
                      Categorias ADR: {servico.resumoMaterial.categoriasPresentes}
                    </span>
                  )}
                </div>
              )}
              <Link
                href={`/encomendas/${servico.encomendaId}`}
                className="mt-3 inline-block text-[#f97316] hover:underline"
              >
                Ver encomenda #{servico.encomendaId}
              </Link>
            </motion.section>
          )}

          {/* Distâncias de segurança */}
          {servico.distanciasSeguranca.length > 0 && (
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.1 }}
              className="mt-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]"
            >
              <h2 className="mb-4 text-lg font-semibold">Distâncias de segurança</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e7e5e4] dark:border-[#222]">
                      <th className="pb-2 pr-4 font-semibold">Tipo</th>
                      <th className="pb-2 pr-4 text-right font-semibold">Mínimo (m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servico.distanciasSeguranca.map((d) => (
                      <tr key={d.id} className="border-b border-[#f5f5f4] dark:border-[#1a1a1a]">
                        <td className="py-2 pr-4">{d.descricaoReferencia}</td>
                        <td className="py-2 pr-4 text-right">{d.distanciaMinima_m}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          )}

          {/* Licenças do evento */}
          {servico.licencasEvento.length > 0 && (
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.12 }}
              className="mt-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]"
            >
              <h2 className="mb-1 text-lg font-semibold">Licenças do evento</h2>
              <p className="mb-4 text-sm text-[#57534e] dark:text-gray-400">
                Duas fases: <strong className="font-medium text-[#1c1917] dark:text-white">papelada gerada</strong> no sistema e, depois, o{" "}
                <strong className="font-medium text-[#1c1917] dark:text-white">registo definitivo</strong> autorizado pelas entidades reguladoras. A barra de
                progresso conta só as autorizações definitivas obrigatórias.
              </p>
              {canGerirServicos && (
                <div className="mb-4 rounded-xl border border-dashed border-[#fdba74]/60 bg-[#fffbeb] px-4 py-3 dark:border-[#78350f]/50 dark:bg-[#1c1410]/80">
                  <p className="text-sm font-medium text-[#9a3412] dark:text-[#fdba74]">Assistente de preenchimento</p>
                  <p className="mt-1 text-sm text-[#57534e] dark:text-gray-400">
                    Na coluna «Papelada gerada», abra o registo e use o assistente para o texto das observações. Na coluna «Autorização definitiva», registe o
                    documento oficial (n.º, validade, PDF).
                  </p>
                </div>
              )}
              {servico.licencasObrigatoriasTotal > 0 && (
                <p className="mb-2 text-sm text-[#57534e] dark:text-gray-400">
                  {servico.licencasObrigatoriasEntregues} de {servico.licencasObrigatoriasTotal} autorizações definitivas obrigatórias com ficheiro
                </p>
              )}
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-[#333]">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{
                    width:
                      servico.licencasObrigatoriasTotal > 0
                        ? `${(100 * servico.licencasObrigatoriasEntregues) / servico.licencasObrigatoriasTotal}%`
                        : "0%",
                  }}
                />
              </div>
              <ul className="space-y-5">
                {servico.licencasEvento.map((linha) => {
                  const iconEstado = (e: number) => (e === 2 ? "✅" : e === 1 ? "⚠️" : "❌");
                  const hrefLic = (origem: 0 | 1, lic?: ServicoLicenca) => {
                    const p = new URLSearchParams({ tipo: linha.tipo });
                    p.set("origem", String(origem));
                    if (lic?.id) p.set("licencaId", lic.id);
                    return `/servicos/${servico.id}/licenca?${p}`;
                  };
                  const renderCelula = (
                    titulo: string,
                    origem: 0 | 1,
                    lic: ServicoLicenca | undefined,
                    estado: number,
                    badgeObrigatorio: boolean
                  ) => {
                    const validadeExpirada = lic?.dataValidade && new Date(lic.dataValidade) < new Date();
                    return (
                      <div className="min-w-0 flex-1 rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-3 dark:border-[#333] dark:bg-[#141414]">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#78716c] dark:text-gray-500">
                          {titulo}
                          {badgeObrigatorio && (
                            <span className="ml-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-[0.65rem] font-normal normal-case dark:bg-[#333]">obrigatório</span>
                          )}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-lg leading-none">{iconEstado(estado)}</span>
                          {lic?.numeroDocumento && (
                            <span className="text-sm text-[#57534e] dark:text-gray-400">{lic.numeroDocumento}</span>
                          )}
                          {lic?.dataValidade && (
                            <span
                              className={
                                validadeExpirada ? "text-sm text-red-600 dark:text-red-400" : "text-sm text-[#57534e] dark:text-gray-400"
                              }
                            >
                              Val. {new Date(lic.dataValidade).toLocaleDateString("pt-PT")}
                            </span>
                          )}
                          {canGerirServicos && (
                            <Link href={hrefLic(origem, lic)} className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#333]">
                              {lic ? "Editar" : "Adicionar"}
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  };

                  if (linha.tipo === "OUTRO") {
                    const ped = linha.licencaPedido;
                    const def = linha.licencaDefinitiva;
                    const key = `outro-${ped?.id ?? ""}-${def?.id ?? ""}-${linha.nomeExibicao}`;
                    return (
                      <li key={key} className="border-b border-[#f5f5f4] pb-4 last:border-0 dark:border-[#1a1a1a]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg leading-none">{iconEstado(Math.max(linha.estadoPedido, linha.estadoDefinitiva))}</span>
                          <span className="font-medium">{linha.nomeExibicao}</span>
                        </div>
                        <div className="mt-2 grid gap-3 sm:grid-cols-2">
                          {renderCelula("Papelada gerada", 0, ped, linha.estadoPedido, false)}
                          {renderCelula("Autorização definitiva", 1, def, linha.estadoDefinitiva, false)}
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={linha.tipo} className="border-b border-[#f5f5f4] pb-4 last:border-0 dark:border-[#1a1a1a]">
                      <p className="font-medium text-[#1c1917] dark:text-white">{linha.nomeExibicao}</p>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        {renderCelula("1. Papelada gerada (pedido)", 0, linha.licencaPedido, linha.estadoPedido, false)}
                        {renderCelula("2. Autorização definitiva", 1, linha.licencaDefinitiva, linha.estadoDefinitiva, linha.obrigatorio)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.section>
          )}

          {/* Documentação do evento */}
          {servico.documentosExtras.length > 0 && (
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.16 }}
              className="mt-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]"
            >
              <h2 className="mb-4 text-lg font-semibold">Documentação do evento</h2>
              <ul className="flex flex-wrap gap-2">
                {servico.documentosExtras.map((doc) => (
                  <li key={doc.id}>
                    <span className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#333]">
                      {doc.nome || "Documento"}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}
        </div>
      </main>
    </div>
  );
}
