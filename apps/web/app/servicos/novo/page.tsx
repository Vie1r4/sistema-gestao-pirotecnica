"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import ZonasLancamentoEditor from "@/app/servicos/_components/ZonasLancamentoEditor";
import ServicoFuncionariosFields from "@/app/servicos/_components/ServicoFuncionariosFields";
import { getToken } from "@/app/lib/auth";
import {
  servicosApi,
  PUBLICO_PRIVADO,
  type PublicoPrivado,
} from "@/app/lib/servicos";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { labelClass, btnPrimary, btnSecondary, inputClassCompact as inputClass } from "@/app/components/ui/tokens";
import {
  mapFuncionariosServico,
  membrosEquipaParaZonas,
  validarCoordenadorNaEquipa,
} from "@/app/lib/servicosFuncionariosForm";
import {
  createDefaultZonasFromItens,
  parseItensEncomenda,
  validarZonasForm,
  zonasToApiInput,
  type ZonaForm,
} from "@/app/lib/zonasLancamento";

type EncomendaOpt = { id: string | number; texto?: string; clienteId?: string; cliente?: { nome: string }; dataConclusao?: string };

function NovoServicoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encomendaIdParam = searchParams.get("encomendaId") ?? undefined;

  const [mounted, setMounted] = useState(false);
  const [encomendaId, setEncomendaId] = useState(encomendaIdParam ?? "");
  const [nomeEvento, setNomeEvento] = useState("");
  const [dataServico, setDataServico] = useState("");
  const [local, setLocal] = useState("");
  const [distrito, setDistrito] = useState("");
  const [cidade, setCidade] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [publicoPrivado, setPublicoPrivado] = useState<PublicoPrivado | "">("");
  const [coordenadorPirotecnicoId, setCoordenadorPirotecnicoId] = useState("");
  const [equipaIds, setEquipaIds] = useState<Set<string>>(new Set());
  const [observacoes, setObservacoes] = useState("");
  const [zonas, setZonas] = useState<ZonaForm[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const prevEncomendaRef = useRef("");
  const token = getToken();
  const encomendaPreselect = encomendaIdParam ? parseInt(encomendaIdParam, 10) : undefined;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const encomendaIdNum = encomendaId ? parseInt(encomendaId, 10) : undefined;

  const { data: createData, isLoading: loadingForm } = useQuery({
    queryKey: ["servicos", "create", encomendaIdNum ?? encomendaPreselect ?? "none"],
    queryFn: async () => {
      const t = getToken();
      if (!t) throw new Error("no-token");
      const encId = encomendaIdNum && !Number.isNaN(encomendaIdNum) ? encomendaIdNum : encomendaPreselect;
      return servicosApi.fetchServicosCreate(t, encId);
    },
    enabled: mounted && !!token,
    retry: false,
  });

  const itensEncomenda = useMemo(
    () => parseItensEncomenda((createData?.itensEncomenda ?? []) as Array<Record<string, unknown>>),
    [createData?.itensEncomenda]
  );

  const encomendasDisponiveis = useMemo<EncomendaOpt[]>(() => {
    if (!createData) return [];
    return (createData.encomendas ?? []).map((e) => ({ id: e.id, texto: e.texto ?? "" }));
  }, [createData]);

  const funcionarios = useMemo(
    () =>
      mapFuncionariosServico(createData?.funcionarios ?? []),
    [createData]
  );

  const membrosEquipa = useMemo(
    () => membrosEquipaParaZonas(funcionarios, equipaIds),
    [funcionarios, equipaIds]
  );

  useEffect(() => {
    setZonas((prev) =>
      prev.map((z) =>
        z.responsavelPirotecnicoId && !equipaIds.has(z.responsavelPirotecnicoId)
          ? { ...z, responsavelPirotecnicoId: "" }
          : z
      )
    );
    if (coordenadorPirotecnicoId && !equipaIds.has(coordenadorPirotecnicoId)) {
      setCoordenadorPirotecnicoId("");
    }
  }, [equipaIds, coordenadorPirotecnicoId]);

  useEffect(() => {
    const sug = createData?.servico?.nomeEventoSugerido;
    if (sug) setNomeEvento(String(sug).slice(0, 200));
  }, [createData?.servico?.nomeEventoSugerido, encomendaId]);

  useEffect(() => {
    if (!createData?.servico?.dataServico && !dataServico) {
      setDataServico(new Date().toISOString().slice(0, 10));
    } else if (createData?.servico?.dataServico && !dataServico) {
      setDataServico(String(createData.servico.dataServico).slice(0, 10));
    }
  }, [createData, dataServico]);

  useEffect(() => {
    if (!encomendaId || itensEncomenda.length === 0) {
      if (!encomendaId) setZonas([]);
      return;
    }
    if (prevEncomendaRef.current === encomendaId) return;
    prevEncomendaRef.current = encomendaId;
    const ds = dataServico || new Date().toISOString().slice(0, 10);
    setZonas(createDefaultZonasFromItens(itensEncomenda, ds));
  }, [encomendaId, itensEncomenda, dataServico]);

  const createMutation = useMutation({
    mutationFn: async (body: servicosApi.ServicoSaveRequest) => {
      const t = getToken();
      if (!t) throw new Error("Sessão inválida. Faça login.");
      return servicosApi.postServico(t, body);
    },
    onSuccess: (res) => {
      const servico = res.servico as { id?: number; Id?: number };
      const newId = servico?.id ?? servico?.Id;
      if (newId != null) router.push(`/servicos/${String(newId)}`);
      else setErro("Resposta inválida do servidor.");
    },
    onError: (err: Error) => {
      setErro(err.message || "Erro ao criar serviço.");
    },
  });

  useEffect(() => {
    if (!encomendaIdParam || encomendaId) return;
    const t = setTimeout(() => setEncomendaId(encomendaIdParam), 0);
    return () => clearTimeout(t);
  }, [encomendaIdParam, encomendaId]);

  const handleEquipaCoordenadorChange = ({
    equipaIds: nextEquipa,
    coordenadorPirotecnicoId: nextCoord,
  }: {
    equipaIds: Set<string>;
    coordenadorPirotecnicoId: string;
  }) => {
    setEquipaIds(nextEquipa);
    setCoordenadorPirotecnicoId(nextCoord);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createMutation.isPending) return;
    setErro(null);
    if (!encomendaId || !dataServico || !publicoPrivado) {
      setErro("Preencha Encomenda, Data do serviço e Público/Privado.");
      return;
    }
    const enc = encomendasDisponiveis.find((en) => String(en.id) === encomendaId);
    if (!enc) {
      setErro("Encomenda inválida ou já utilizada noutro serviço.");
      return;
    }
    if (itensEncomenda.length === 0) {
      setErro("A encomenda não tem itens. Volte a selecionar a encomenda.");
      return;
    }
    const erroZonas = validarZonasForm(zonas, itensEncomenda);
    if (erroZonas) {
      setErro(erroZonas);
      return;
    }
    const erroCoordenador = validarCoordenadorNaEquipa(coordenadorPirotecnicoId, equipaIds);
    if (erroCoordenador) {
      setErro(erroCoordenador);
      return;
    }
    const body: servicosApi.ServicoSaveRequest = {
      encomendaId: parseInt(encomendaId, 10),
      nomeEvento: nomeEvento.trim() || undefined,
      dataServico,
      publicoPrivado,
      local: local.trim() || undefined,
      distrito: distrito.trim() || undefined,
      cidade: cidade.trim() || undefined,
      municipio: municipio.trim() || undefined,
      coordenadorPirotecnicoId: coordenadorPirotecnicoId ? parseInt(coordenadorPirotecnicoId, 10) : undefined,
      observacoes: observacoes.trim() || undefined,
      equipaIds: Array.from(equipaIds).map((x) => parseInt(x, 10)).filter((n) => !Number.isNaN(n)),
      zonas: zonasToApiInput(zonas),
    };
    await createMutation.mutateAsync(body);
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
      <main className="px-6 pt-14 pb-10 sm:px-8 pt-content-offset">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Novo serviço</h1>
            <p className="mt-1 text-sm text-[#57534e] dark:text-gray-400">
              Associe uma encomenda concluída, reparta o material por zonas de lançamento e preencha os dados do evento.
            </p>
          </motion.div>

          <motion.form
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ ...transitionSmooth, delay: 0.05 }}
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            {erro && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
                {erro}
              </div>
            )}

            <section className="rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]">
              <h2 className="mb-4 text-lg font-semibold">Dados gerais</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="encomendaId" className={labelClass}>
                    Encomenda *
                  </label>
                  <select
                    id="encomendaId"
                    required
                    value={encomendaId}
                    onChange={(e) => {
                      prevEncomendaRef.current = "";
                      setEncomendaId(e.target.value);
                    }}
                    className={inputClass + " w-full"}
                  >
                    <option value="">— Selecione —</option>
                    {encomendasDisponiveis.map((e) => (
                      <option key={String(e.id)} value={String(e.id)}>
                        {"texto" in e && e.texto ? e.texto : `#${e.id}`}
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
                  <label htmlFor="nomeEvento" className={labelClass}>
                    Nome do evento
                  </label>
                  <input
                    id="nomeEvento"
                    type="text"
                    maxLength={200}
                    value={nomeEvento}
                    onChange={(e) => setNomeEvento(e.target.value.slice(0, 200))}
                    className={inputClass + " w-full"}
                    placeholder="Ex.: Festas do Concelho 2026"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>

                <ServicoFuncionariosFields
                  inputClass={inputClass}
                  funcionarios={funcionarios}
                  state={{ equipaIds, coordenadorPirotecnicoId }}
                  onStateChange={handleEquipaCoordenadorChange}
                />

                <div>
                  <label htmlFor="local" className={labelClass}>
                    Local geral do evento
                  </label>
                  <input id="local" type="text" value={local} onChange={(e) => setLocal(e.target.value)} className={inputClass + " w-full"} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="distrito" className={labelClass}>Distrito</label>
                    <input id="distrito" type="text" value={distrito} onChange={(e) => setDistrito(e.target.value)} className={inputClass + " w-full"} />
                  </div>
                  <div>
                    <label htmlFor="cidade" className={labelClass}>Cidade</label>
                    <input id="cidade" type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputClass + " w-full"} />
                  </div>
                  <div>
                    <label htmlFor="municipio" className={labelClass}>Concelho</label>
                    <input id="municipio" type="text" value={municipio} onChange={(e) => setMunicipio(e.target.value)} className={inputClass + " w-full"} />
                  </div>
                </div>

                <div>
                  <label htmlFor="observacoes" className={labelClass}>Observações</label>
                  <textarea id="observacoes" rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className={inputClass + " w-full"} />
                </div>
              </div>
            </section>

            {encomendaId && (
              <section className="rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]">
                <ZonasLancamentoEditor
                  zonas={zonas}
                  onChange={setZonas}
                  itensEncomenda={itensEncomenda}
                  dataServico={dataServico}
                  membrosEquipa={membrosEquipa}
                  disabled={createMutation.isPending}
                />
              </section>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={createMutation.isPending || encomendasDisponiveis.length === 0} className={btnPrimary}>
                {createMutation.isPending ? "A guardar…" : "Criar serviço"}
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
