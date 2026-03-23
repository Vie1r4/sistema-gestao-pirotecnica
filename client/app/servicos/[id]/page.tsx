"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import MapaCoordenadas from "@/app/components/MapaCoordenadas";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";
import { fetchServicoDetalheFromApi } from "@/app/lib/servicos";
import type { ServicoDetalhe } from "@/app/lib/servicos";
import { textoClassificacao, textoCalibre, textoGrupo } from "@/app/lib/produtos";
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

          {/* Dados do serviço */}
          <motion.section
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            className="mt-8 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]"
          >
            <h2 className="mb-4 text-lg font-semibold">Dados do serviço</h2>
            <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
              <dt className="text-[#57534e] dark:text-gray-400">Cliente</dt>
              <dd>{servico.cliente?.nome ?? servico.clienteId}</dd>
              <dt className="text-[#57534e] dark:text-gray-400">Data</dt>
              <dd>{new Date(servico.dataServico).toLocaleDateString("pt-PT")}</dd>
              <dt className="text-[#57534e] dark:text-gray-400">Público / Privado</dt>
              <dd>{servico.publicoPrivado ?? "—"}</dd>
              {servico.raioPublico != null && (
                <>
                  <dt className="text-[#57534e] dark:text-gray-400">Raio público</dt>
                  <dd>{servico.raioPublico} m</dd>
                </>
              )}
              {servico.local && (
                <>
                  <dt className="text-[#57534e] dark:text-gray-400">Local</dt>
                  <dd>{servico.local}</dd>
                </>
              )}
              {localizacaoPartes.length > 0 && (
                <>
                  <dt className="text-[#57534e] dark:text-gray-400">Localização</dt>
                  <dd>{localizacaoPartes.join(" · ")}</dd>
                </>
              )}
              {servico.coordenadasLat != null && servico.coordenadasLng != null && (
                <>
                  <dt className="text-[#57534e] dark:text-gray-400">Coordenadas</dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    <span>
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
                  <dt className="text-[#57534e] dark:text-gray-400">Observações</dt>
                  <dd className="whitespace-pre-wrap">{servico.observacoes}</dd>
                </>
              )}
            </dl>
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
              <h2 className="mb-4 text-lg font-semibold">Licenças do evento</h2>
              {servico.licencasObrigatoriasTotal > 0 && (
                <p className="mb-2 text-sm text-[#57534e] dark:text-gray-400">
                  {servico.licencasObrigatoriasEntregues} de {servico.licencasObrigatoriasTotal} licenças obrigatórias entregues
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
              <ul className="space-y-2">
                {servico.licencasEvento.map((linha) => {
                  const icon = linha.estado === 2 ? "✅" : linha.estado === 1 ? "⚠️" : "❌";
                  const validadeExpirada =
                    linha.licenca?.dataValidade && new Date(linha.licenca.dataValidade) < new Date();
                  return (
                    <li key={linha.tipo + (linha.licenca?.id ?? "")} className="flex flex-wrap items-center gap-2 border-b border-[#f5f5f4] pb-2 dark:border-[#1a1a1a]">
                      <span className="w-6">{icon}</span>
                      <span className="flex-1">
                        {linha.nomeExibicao}
                        {linha.obrigatorio && (
                          <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-[#333]">obrigatório</span>
                        )}
                      </span>
                      {linha.licenca && (
                        <>
                          {linha.licenca.numeroDocumento && (
                            <span className="text-sm text-[#57534e] dark:text-gray-400">{linha.licenca.numeroDocumento}</span>
                          )}
                          {linha.licenca.dataValidade && (
                            <span className={validadeExpirada ? "text-sm text-red-600 dark:text-red-400" : "text-sm text-[#57534e] dark:text-gray-400"}>
                              Val. {new Date(linha.licenca.dataValidade).toLocaleDateString("pt-PT")}
                            </span>
                          )}
                        </>
                      )}
                      {canGerirServicos && (
                        <Link
                          href={`/servicos/${servico.id}/licenca?tipo=${linha.tipo}${linha.licenca?.id ? `&licencaId=${linha.licenca.id}` : ""}`}
                          className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#333]"
                        >
                          {linha.licenca ? "Editar" : "Upload"}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.section>
          )}

          {/* Equipa */}
          {servico.equipa.length > 0 && (
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.14 }}
              className="mt-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]"
            >
              <h2 className="mb-4 text-lg font-semibold">Equipa</h2>
              <ul className="space-y-2">
                {servico.equipa
                  .slice()
                  .sort((a, b) => (a.funcionario?.nomeCompleto ?? "").localeCompare(b.funcionario?.nomeCompleto ?? ""))
                  .map((m) => (
                    <li key={m.funcionarioId}>
                      <Link
                        href={`/funcionarios/${m.funcionarioId}`}
                        className="text-[#1c1917] hover:underline dark:text-white"
                      >
                        {m.funcionario?.nomeCompleto ?? m.funcionarioId}
                      </Link>
                      {servico.responsavelTecnicoId === m.funcionarioId && (
                        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs dark:bg-amber-900/30">
                          Responsável técnico
                        </span>
                      )}
                    </li>
                  ))}
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
