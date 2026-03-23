"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import {
  servicosApi,
  PUBLICO_PRIVADO,
  type PublicoPrivado,
} from "@/app/lib/servicos";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import MapaCoordenadas from "@/app/components/MapaCoordenadas";

type EncomendaOpt = { id: string | number; texto?: string; clienteId?: string; cliente?: { nome: string }; dataConclusao?: string };
type FuncionarioOpt = { id: number | string; nomeCompleto?: string };

const inputClass =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";
const btnSecondary =
  "rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-[#333] dark:text-gray-300";

function NovoServicoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encomendaIdParam = searchParams.get("encomendaId") ?? undefined;

  const [mounted, setMounted] = useState(false);
  const [encomendaId, setEncomendaId] = useState(encomendaIdParam ?? "");
  const [dataServico, setDataServico] = useState("");
  const [local, setLocal] = useState("");
  const [distrito, setDistrito] = useState("");
  const [cidade, setCidade] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [coordenadasLat, setCoordenadasLat] = useState("");
  const [coordenadasLng, setCoordenadasLng] = useState("");
  const [raioPublico, setRaioPublico] = useState("");
  const [publicoPrivado, setPublicoPrivado] = useState<PublicoPrivado | "">("");
  const [responsavelTecnicoId, setResponsavelTecnicoId] = useState("");
  const [equipaIds, setEquipaIds] = useState<Set<string>>(new Set());
  const [observacoes, setObservacoes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [encomendasDisponiveis, setEncomendasDisponiveis] = useState<EncomendaOpt[]>([]);
  const [responsaveis, setResponsaveis] = useState<FuncionarioOpt[]>([]);
  const [funcionariosEquipa, setFuncionariosEquipa] = useState<FuncionarioOpt[]>([]);
  const [loadingForm, setLoadingForm] = useState(true);
  const submittingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = getToken();
    if (!token) {
      setEncomendasDisponiveis([]);
      setResponsaveis([]);
      setFuncionariosEquipa([]);
      setLoadingForm(false);
      return;
    }
    setLoadingForm(true);
    servicosApi
      .fetchServicosCreate(token, encomendaIdParam ? parseInt(encomendaIdParam, 10) : undefined)
      .then((res) => {
        setEncomendasDisponiveis((res.encomendas ?? []).map((e) => ({ id: e.id, texto: e.texto ?? "" })));
        setResponsaveis(
          (res.responsaveisTecnicos as Record<string, unknown>[] ?? []).map((f) => ({
            id: (f.id ?? f.Id) as number,
            nomeCompleto: String(f.nomeCompleto ?? f.NomeCompleto ?? ""),
          }))
        );
        setFuncionariosEquipa(
          (res.funcionariosEquipa as Record<string, unknown>[] ?? []).map((f) => ({
            id: (f.id ?? f.Id) as number,
            nomeCompleto: String(f.nomeCompleto ?? f.NomeCompleto ?? ""),
          }))
        );
      })
      .catch(() => {
        setEncomendasDisponiveis([]);
        setResponsaveis([]);
        setFuncionariosEquipa([]);
      })
      .finally(() => setLoadingForm(false));
  }, [mounted, encomendaIdParam]);

  useEffect(() => {
    if (encomendaIdParam && !encomendaId) setEncomendaId(encomendaIdParam);
  }, [encomendaIdParam, encomendaId]);

  const toggleEquipa = (id: string) => {
    setEquipaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setErro(null);
    if (!encomendaId || !dataServico || !publicoPrivado) {
      setErro("Preencha Encomenda, Data do serviço e Público/Privado.");
      return;
    }
    const enc = encomendasDisponiveis.find((e) => String(e.id) === encomendaId);
    if (!enc) {
      setErro("Encomenda inválida ou já utilizada noutro serviço.");
      return;
    }
    const token = getToken();
    if (!token) {
      setErro("Sessão inválida. Faça login.");
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("Servico.EncomendaId", encomendaId);
      fd.append("Servico.DataServico", dataServico);
      fd.append("Servico.PublicoPrivado", publicoPrivado);
      if (local.trim()) fd.append("Servico.Local", local.trim());
      if (distrito.trim()) fd.append("Servico.Distrito", distrito.trim());
      if (cidade.trim()) fd.append("Servico.Cidade", cidade.trim());
      if (municipio.trim()) fd.append("Servico.Municipio", municipio.trim());
      if (coordenadasLat) fd.append("Servico.CoordenadasLat", coordenadasLat);
      if (coordenadasLng) fd.append("Servico.CoordenadasLng", coordenadasLng);
      if (raioPublico) fd.append("Servico.RaioPublico", raioPublico);
      if (responsavelTecnicoId) fd.append("Servico.ResponsavelTecnicoId", responsavelTecnicoId);
      if (observacoes.trim()) fd.append("Servico.Observacoes", observacoes.trim());
      Array.from(equipaIds).forEach((fid) => fd.append("EquipaIds", fid));
      const res = await servicosApi.postServico(token, fd);
      const servico = res.servico as { id?: number; Id?: number };
      const newId = servico?.id ?? servico?.Id;
      if (newId != null) {
        router.push(`/servicos/${String(newId)}`);
        return;
      }
      setErro("Resposta inválida do servidor.");
    } catch (err) {
      setErro((err as Error).message || "Erro ao criar serviço.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (!mounted || loadingForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main className="px-6 pt-14 pb-10 sm:px-8" style={{ paddingTop: CONTENT_OFFSET_TOP }}>
        <div className="mx-auto max-w-2xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Novo serviço</h1>
            <p className="mt-1 text-sm text-[#57534e] dark:text-gray-400">
              Associe uma encomenda concluída e preencha os dados do evento.
            </p>
          </motion.div>

          <motion.form
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]"
          >
            {erro && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
                {erro}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="encomendaId" className={labelClass}>
                  Encomenda *
                </label>
                <select
                  id="encomendaId"
                  required
                  value={encomendaId}
                  onChange={(e) => setEncomendaId(e.target.value)}
                  className={inputClass + " w-full"}
                >
                  <option value="">— Selecione —</option>
                  {encomendasDisponiveis.map((e) => (
                    <option key={String(e.id)} value={String(e.id)}>
                      {"texto" in e && e.texto ? e.texto : `#${e.id} — ${e.cliente?.nome ?? e.clienteId ?? ""} (${e.dataConclusao ? new Date(e.dataConclusao).toLocaleDateString("pt-PT") : ""})`}
                    </option>
                  ))}
                </select>
                {encomendasDisponiveis.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                    Não há encomendas concluídas disponíveis. Conclua uma encomenda primeiro.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="dataServico" className={labelClass}>
                  Data do serviço *
                </label>
                <input
                  id="dataServico"
                  type="date"
                  required
                  value={dataServico}
                  onChange={(e) => setDataServico(e.target.value)}
                  className={inputClass + " w-full"}
                />
              </div>

              <div>
                <label htmlFor="publicoPrivado" className={labelClass}>
                  Público / Privado *
                </label>
                <select
                  id="publicoPrivado"
                  required
                  value={publicoPrivado}
                  onChange={(e) => setPublicoPrivado(e.target.value as PublicoPrivado)}
                  className={inputClass + " w-full"}
                >
                  <option value="">— Selecione —</option>
                  {PUBLICO_PRIVADO.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="responsavelTecnicoId" className={labelClass}>
                  Responsável técnico
                </label>
                <select
                  id="responsavelTecnicoId"
                  value={responsavelTecnicoId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setResponsavelTecnicoId(id);
                    if (id) setEquipaIds((prev) => new Set(prev).add(id));
                  }}
                  className={inputClass + " w-full"}
                >
                  <option value="">— Selecione —</option>
                  {responsaveis.map((f) => (
                    <option key={String(f.id)} value={String(f.id)}>
                      {f.nomeCompleto}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className={labelClass}>Equipa</span>
                <p className="mt-1 text-xs text-[#57534e] dark:text-gray-400">
                  Funcionários com licença de operador. O responsável técnico fica sempre na equipa.
                </p>
                <ul className="mt-2 space-y-1">
                  {funcionariosEquipa.map((f) => (
                    <li key={String(f.id)}>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={equipaIds.has(String(f.id)) || responsavelTecnicoId === String(f.id)}
                          onChange={() => responsavelTecnicoId !== String(f.id) && toggleEquipa(String(f.id))}
                          disabled={responsavelTecnicoId === String(f.id)}
                          className="rounded border-gray-300"
                        />
                        <span>{f.nomeCompleto}</span>
                        {responsavelTecnicoId === String(f.id) && (
                          <span className="text-xs text-[#57534e] dark:text-gray-400">(responsável)</span>
                        )}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label htmlFor="local" className={labelClass}>
                  Local
                </label>
                <input id="local" type="text" value={local} onChange={(e) => setLocal(e.target.value)} className={inputClass + " w-full"} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="distrito" className={labelClass}>
                    Distrito
                  </label>
                  <input id="distrito" type="text" value={distrito} onChange={(e) => setDistrito(e.target.value)} className={inputClass + " w-full"} />
                </div>
                <div>
                  <label htmlFor="cidade" className={labelClass}>
                    Cidade
                  </label>
                  <input id="cidade" type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputClass + " w-full"} />
                </div>
                <div>
                  <label htmlFor="municipio" className={labelClass}>
                    Concelho
                  </label>
                  <input id="municipio" type="text" value={municipio} onChange={(e) => setMunicipio(e.target.value)} className={inputClass + " w-full"} />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">Localização no mapa</h3>
                <MapaCoordenadas
                  readOnly={false}
                  lat={coordenadasLat}
                  lng={coordenadasLng}
                  raioMetros={raioPublico}
                  onLatChange={setCoordenadasLat}
                  onLngChange={setCoordenadasLng}
                  onRaioChange={setRaioPublico}
                  onAddressFromCoords={(addr) => {
                    if (addr.local != null) setLocal(addr.local);
                    if (addr.distrito != null) setDistrito(addr.distrito);
                    if (addr.cidade != null) setCidade(addr.cidade);
                    if (addr.municipio != null) setMunicipio(addr.municipio);
                  }}
                  mapContainerId="mapa-servico-novo"
                />
              </div>

              <div>
                <label htmlFor="observacoes" className={labelClass}>
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className={inputClass + " w-full"}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="submit" disabled={submitting || encomendasDisponiveis.length === 0} className={btnPrimary}>
                {submitting ? "A guardar…" : "Criar serviço"}
              </button>
              <Link href="/servicos" className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </motion.form>
        </div>
      </main>
    </div>
  );
}

export default function NovoServicoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <NovoServicoContent />
    </Suspense>
  );
}
