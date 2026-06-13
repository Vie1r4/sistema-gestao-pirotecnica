"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import ZonasLancamentoEditor from "@/app/servicos/_components/ZonasLancamentoEditor";
import ServicoFuncionariosFields from "@/app/servicos/_components/ServicoFuncionariosFields";
import { getToken } from "@/app/lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import {
  servicosApi,
  PUBLICO_PRIVADO,
  type PublicoPrivado,
  type ServicoDetalhe,
} from "@/app/lib/servicos";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import {
  createDefaultZonasFromItens,
  parseItensEncomenda,
  validarZonasForm,
  zonasFromApi,
  zonasToApiInput,
  type ZonaForm,
} from "@/app/lib/zonasLancamento";
import {
  mapFuncionariosServico,
  membrosEquipaParaZonas,
  ensureCoordenadorNaEquipa,
  validarCoordenadorNaEquipa,
} from "@/app/lib/servicosFuncionariosForm";
import { labelClass, btnPrimary, btnSecondary, inputClassCompact as inputClass } from "@/app/components/ui/tokens";

type EncomendaOpt = { id: string | number; texto?: string; cliente?: { nome: string }; clienteId?: string };

export default function EditarServicoPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [listaEncomendas, setListaEncomendas] = useState<EncomendaOpt[]>([]);
  const [encomendaId, setEncomendaId] = useState("");
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
  const submittingRef = useRef(false);
  const zonasLoadedRef = useRef(false);

  const {
    data: editData,
    isLoading: loadingApi,
    error: queryError,
  } = useQuery({
    queryKey: ["servicos", id, "edit"],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      return servicosApi.fetchServicosEdit(token, id);
    },
    staleTime: 30 * 1000,
    retry: 2,
    enabled: !!id && !!getToken(),
  });

  const itensEncomenda = useMemo(
    () => parseItensEncomenda((editData?.itensEncomenda ?? []) as Array<Record<string, unknown>>),
    [editData?.itensEncomenda]
  );

  const funcionarios = useMemo(
    () =>
      mapFuncionariosServico(editData?.funcionarios ?? []),
    [editData]
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

  const servico: ServicoDetalhe | null | undefined = editData
    ? (() => {
        const s = editData.servico as Record<string, unknown>;
        return {
          id: String(s.id ?? s.Id ?? id),
          encomendaId: String(s.encomendaId ?? s.EncomendaId ?? ""),
          clienteId: String(s.clienteId ?? s.ClienteId ?? ""),
          dataServico: String(s.dataServico ?? s.DataServico ?? ""),
          local: (s.local ?? s.Local) as string | undefined,
          distrito: (s.distrito ?? s.Distrito) as string | undefined,
          cidade: (s.cidade ?? s.Cidade) as string | undefined,
          municipio: (s.municipio ?? s.Municipio) as string | undefined,
          publicoPrivado: (s.publicoPrivado ?? s.PublicoPrivado) as PublicoPrivado | undefined,
          observacoes: (s.observacoes ?? s.Observacoes) as string | undefined,
          cliente: null,
          encomenda: null,
          responsavelTecnico: null,
          coordenadorPirotecnico: null,
          equipa: (editData.equipaIds ?? []).map((fid: number) => ({
            servicoId: id,
            funcionarioId: String(fid),
            funcionario: null,
          })),
          documentosExtras: [],
          licencas: [],
          distanciasSeguranca: [],
          resumoMaterial: null,
          itensEncomenda: [],
          licencasEvento: [],
          licencasObrigatoriasTotal: 0,
          licencasObrigatoriasEntregues: 0,
          zonasLancamento: [],
        } as ServicoDetalhe;
      })()
    : editData === undefined
      ? undefined
      : null;

  useEffect(() => {
    if (!editData) return;
    const s = editData.servico as Record<string, unknown>;
    setListaEncomendas((editData.encomendas ?? []).map((e: { id: number; texto: string }) => ({ id: e.id, texto: e.texto ?? "" })));
    setEncomendaId(String(s.encomendaId ?? s.EncomendaId ?? ""));
    setNomeEvento(String(s.nomeEvento ?? s.NomeEvento ?? ""));
    const ds = (s.dataServico ?? s.DataServico) ? String(s.dataServico ?? s.DataServico).slice(0, 10) : "";
    setDataServico(ds);
    setLocal(String(s.local ?? s.Local ?? ""));
    setDistrito(String(s.distrito ?? s.Distrito ?? ""));
    setCidade(String(s.cidade ?? s.Cidade ?? ""));
    setMunicipio(String(s.municipio ?? s.Municipio ?? ""));
    setPublicoPrivado((s.publicoPrivado ?? s.PublicoPrivado) as PublicoPrivado ?? "");
    const coordId =
      (s.coordenadorPirotecnicoId ?? s.CoordenadorPirotecnicoId) != null
        ? String(s.coordenadorPirotecnicoId ?? s.CoordenadorPirotecnicoId)
        : "";
    const equipaInicial = new Set((editData.equipaIds ?? []).map(String));
    const { equipaIds: equipaComCoord, coordenadorPirotecnicoId: coordFinal } = ensureCoordenadorNaEquipa({
      equipaIds: equipaInicial,
      coordenadorPirotecnicoId: coordId,
    });
    setCoordenadorPirotecnicoId(coordFinal);
    setEquipaIds(equipaComCoord);
    setObservacoes(String(s.observacoes ?? s.Observacoes ?? ""));

    if (!zonasLoadedRef.current) {
      const raw = (s.zonasLancamento ?? s.ZonasLancamento) as Array<Record<string, unknown>> | undefined;
      const itens = parseItensEncomenda((editData.itensEncomenda ?? []) as Array<Record<string, unknown>>);
      if (raw?.length) {
        setZonas(zonasFromApi(raw, ds));
      } else {
        setZonas(createDefaultZonasFromItens(itens, ds || new Date().toISOString().slice(0, 10)));
      }
      zonasLoadedRef.current = true;
    }
  }, [editData]);

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

  const mutation = useMutation({
    mutationFn: async (body: servicosApi.ServicoSaveRequest) => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      await servicosApi.putServico(token, id, body);
    },
    onSuccess: () => {
      useToastStore.getState().show("Serviço atualizado com sucesso.", "success");
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      queryClient.invalidateQueries({ queryKey: ["servicos", id] });
      router.push(`/servicos/${id}`);
    },
    onError: (err: Error) => setErro(err.message || "Erro ao guardar."),
    onSettled: () => {
      submittingRef.current = false;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!servico || !encomendaId || !dataServico || !publicoPrivado) {
      setErro("Preencha Encomenda, Data do serviço e Público/Privado.");
      return;
    }
    if (itensEncomenda.length === 0) {
      setErro("A encomenda não tem itens associados.");
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
      id: parseInt(id, 10),
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
    submittingRef.current = true;
    mutation.mutate(body);
  };

  const submitting = mutation.isPending;

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
        <main className="px-6 pt-14 pb-10 pt-content-offset">
          <div className="mx-auto max-w-md rounded-xl border border-[#e7e5e4] bg-white p-6 dark:border-[#1f1f1f] dark:bg-[#111]">
            {queryError && (
              <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {queryError instanceof Error ? queryError.message : "Erro ao carregar."}
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

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main className="px-6 pt-14 pb-10 sm:px-8 pt-content-offset">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Editar serviço #{servico.id}</h1>
            <p className="mt-1 text-sm text-[#57534e] dark:text-gray-400">
              Ajuste os dados do evento e reparta o material pelas zonas de lançamento.
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
                    onChange={(e) => setEncomendaId(e.target.value)}
                    className={inputClass + " w-full"}
                  >
                    {listaEncomendas.map((e) => (
                      <option key={String(e.id)} value={String(e.id)}>
                        {"texto" in e && e.texto ? e.texto : `#${e.id}`}
                      </option>
                    ))}
                  </select>
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

            <section className="rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]">
              <ZonasLancamentoEditor
                zonas={zonas}
                onChange={setZonas}
                itensEncomenda={itensEncomenda}
                dataServico={dataServico}
                membrosEquipa={membrosEquipa}
                disabled={submitting}
              />
            </section>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submitting} className={btnPrimary}>
                {submitting ? "A guardar…" : "Guardar"}
              </button>
              <Link href={`/servicos/${servico.id}`} className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </motion.form>
        </div>
      </main>
    </div>
  );
}
