"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import {
  servicosApi,
  PUBLICO_PRIVADO,
  type PublicoPrivado,
  type ServicoDetalhe,
} from "@/app/lib/servicos";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import MapaCoordenadas from "@/app/components/MapaCoordenadas";

type EncomendaOpt = { id: string | number; texto?: string; cliente?: { nome: string }; clienteId?: string };
type FuncionarioOpt = { id: number | string; nomeCompleto?: string };

const inputClass =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";
const btnSecondary =
  "rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-[#333] dark:text-gray-300";

export default function EditarServicoPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [listaEncomendas, setListaEncomendas] = useState<EncomendaOpt[]>([]);
  const [responsaveis, setResponsaveis] = useState<FuncionarioOpt[]>([]);
  const [funcionariosEquipa, setFuncionariosEquipa] = useState<FuncionarioOpt[]>([]);
  const [encomendaId, setEncomendaId] = useState("");
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
  const [erro, setErro] = useState<string | null>(null);
  const submittingRef = useRef(false);

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
          coordenadasLat: (s.coordenadasLat ?? s.CoordenadasLat) != null ? Number(s.coordenadasLat ?? s.CoordenadasLat) : undefined,
          coordenadasLng: (s.coordenadasLng ?? s.CoordenadasLng) != null ? Number(s.coordenadasLng ?? s.CoordenadasLng) : undefined,
          raioPublico: (s.raioPublico ?? s.RaioPublico) != null ? Number(s.raioPublico ?? s.RaioPublico) : undefined,
          publicoPrivado: (s.publicoPrivado ?? s.PublicoPrivado) as PublicoPrivado | undefined,
          responsavelTecnicoId: (s.responsavelTecnicoId ?? s.ResponsavelTecnicoId) != null ? String(s.responsavelTecnicoId ?? s.ResponsavelTecnicoId) : undefined,
          observacoes: (s.observacoes ?? s.Observacoes) as string | undefined,
          cliente: null,
          encomenda: null,
          responsavelTecnico: null,
          equipa: (editData.equipaIds ?? []).map((fid: number) => ({ servicoId: id, funcionarioId: String(fid), funcionario: null })),
          documentosExtras: [],
          licencas: [],
          distanciasSeguranca: [],
          resumoMaterial: null,
          itensEncomenda: [],
          licencasEvento: [],
          licencasObrigatoriasTotal: 0,
          licencasObrigatoriasEntregues: 0,
        } as ServicoDetalhe;
      })()
    : editData === undefined
      ? undefined
      : null;

  useEffect(() => {
    if (!editData) return;
    const s = editData.servico as Record<string, unknown>;
    setListaEncomendas((editData.encomendas ?? []).map((e: { id: number; texto: string }) => ({ id: e.id, texto: e.texto ?? "" })));
    setResponsaveis(
      (editData.responsaveisTecnicos as Record<string, unknown>[]).map((f) => ({
        id: (f.id ?? f.Id) as number,
        nomeCompleto: String(f.nomeCompleto ?? f.NomeCompleto ?? ""),
      }))
    );
    setFuncionariosEquipa(
      (editData.funcionariosEquipa as Record<string, unknown>[]).map((f) => ({
        id: (f.id ?? f.Id) as number,
        nomeCompleto: String(f.nomeCompleto ?? f.NomeCompleto ?? ""),
      }))
    );
    setEncomendaId(String(s.encomendaId ?? s.EncomendaId ?? ""));
    setDataServico((s.dataServico ?? s.DataServico) ? String(s.dataServico ?? s.DataServico).slice(0, 10) : "");
    setLocal(String(s.local ?? s.Local ?? ""));
    setDistrito(String(s.distrito ?? s.Distrito ?? ""));
    setCidade(String(s.cidade ?? s.Cidade ?? ""));
    setMunicipio(String(s.municipio ?? s.Municipio ?? ""));
    setCoordenadasLat((s.coordenadasLat ?? s.CoordenadasLat) != null ? String(s.coordenadasLat ?? s.CoordenadasLat) : "");
    setCoordenadasLng((s.coordenadasLng ?? s.CoordenadasLng) != null ? String(s.coordenadasLng ?? s.CoordenadasLng) : "");
    setRaioPublico((s.raioPublico ?? s.RaioPublico) != null ? String(s.raioPublico ?? s.RaioPublico) : "");
    setPublicoPrivado((s.publicoPrivado ?? s.PublicoPrivado) as PublicoPrivado ?? "");
    setResponsavelTecnicoId((s.responsavelTecnicoId ?? s.ResponsavelTecnicoId) != null ? String(s.responsavelTecnicoId ?? s.ResponsavelTecnicoId) : "");
    setEquipaIds(new Set((editData.equipaIds ?? []).map(String)));
    setObservacoes(String(s.observacoes ?? s.Observacoes ?? ""));
  }, [editData]);

  const toggleEquipa = (fid: string) => {
    setEquipaIds((prev) => {
      const next = new Set(prev);
      if (next.has(fid)) next.delete(fid);
      else next.add(fid);
      return next;
    });
  };

  const mutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      await servicosApi.putServico(token, id, fd);
    },
    onSuccess: () => {
      useToastStore.getState().show("Serviço atualizado com sucesso.", "success");
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      queryClient.invalidateQueries({ queryKey: ["servicos", id] });
      router.push(`/servicos/${id}`);
    },
    onError: (err: Error) => setErro(err.message || "Erro ao guardar."),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!servico || !encomendaId || !dataServico || !publicoPrivado) {
      setErro("Preencha Encomenda, Data do serviço e Público/Privado.");
      return;
    }
    const token = getToken();
    if (!token) {
      setErro("Sessão inválida. Faça login.");
      return;
    }
    const fd = new FormData();
    fd.append("Servico.Id", id);
    fd.append("Servico.EncomendaId", encomendaId);
    fd.append("Servico.ClienteId", servico.clienteId);
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
    submittingRef.current = true;
    mutation.mutate(fd);
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
        <main className="px-6 pt-14 pb-10" style={{ paddingTop: CONTENT_OFFSET_TOP }}>
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
      <main className="px-6 pt-14 pb-10 sm:px-8" style={{ paddingTop: CONTENT_OFFSET_TOP }}>
        <div className="mx-auto max-w-2xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Editar serviço #{servico.id}</h1>
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
                  {listaEncomendas.map((e) => (
                    <option key={String(e.id)} value={String(e.id)}>
                      {"texto" in e && e.texto ? e.texto : `#${e.id} — ${e.cliente?.nome ?? e.clienteId ?? ""}`}
                    </option>
                  ))}
                </select>
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
                    const vid = e.target.value;
                    setResponsavelTecnicoId(vid);
                    if (vid) setEquipaIds((prev) => new Set(prev).add(vid));
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
                  mapContainerId="mapa-servico-editar"
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
