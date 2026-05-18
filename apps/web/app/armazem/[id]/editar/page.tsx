"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import MapaCoordenadas from "@/app/components/MapaCoordenadas";
import {
  PERFIS_RISCO,
  ESTADOS_PAIOL,
  CARGOS_ACESSO_PAIOL,
  labelPerfilRisco,
  validarLimiteMLE,
  type Paiol,
  type PaiolDocumentoExtra,
  type CargoAcessoPaiol,
  type PerfilRiscoPaiol,
  type EstadoPaiol,
} from "@/app/lib/armazem";
import { getToken } from "@/app/lib/auth";
import { useToastStore } from "@/app/stores/useToastStore";
import { fetchEdit, putEdit } from "@/app/lib/paiolApi";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const cardClass =
  "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

const FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png";

function mapApiToPaiol(data: Record<string, unknown>, id: string): Paiol {
  const p = (data.paiol ?? data.Paiol ?? data) as Record<string, unknown>;
  const get = (key: string) => p[key] ?? p[key.charAt(0).toUpperCase() + key.slice(1)];
  const docExtras = (get("documentosExtras") ?? get("DocumentosExtras") ?? []) as Array<Record<string, unknown>>;
  const cargos = (get("cargosAcesso") ?? data.cargosAcesso ?? data.CargosAcesso ?? []) as string[];
  return {
    id: String(get("id") ?? get("Id") ?? id),
    nome: String(get("nome") ?? get("Nome") ?? ""),
    localizacao: (get("localizacao") ?? get("Localizacao")) as string | undefined,
    coordenadasLat: (get("coordenadasLat") ?? get("CoordenadasLat")) as number | undefined,
    coordenadasLng: (get("coordenadasLng") ?? get("CoordenadasLng")) as number | undefined,
    limiteMLE: Number(get("limiteMLE") ?? get("LimiteMLE") ?? 0),
    perfilRisco: String(get("perfilRisco") ?? get("PerfilRisco") ?? "1.1") as PerfilRiscoPaiol,
    estado: String(get("estado") ?? get("Estado") ?? "Ativo") as EstadoPaiol,
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
}

export default function EditarPaiolPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const numId = parseInt(id, 10);
  const validId = !Number.isNaN(numId);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    nome: "",
    localizacao: "",
    coordenadasLat: "" as string | number,
    coordenadasLng: "" as string | number,
    limiteMLE: "" as string | number,
    perfilRisco: "1.3" as PerfilRiscoPaiol,
    estado: "Ativo" as EstadoPaiol,
    numeroLicenca: "",
    dataValidadeLicenca: "",
  });
  const [cargosAcesso, setCargosAcesso] = useState<CargoAcessoPaiol[]>([]);
  const [removerDocIds, setRemoverDocIds] = useState<Set<string>>(new Set());
  const [novosExtras, setNovosExtras] = useState<PaiolDocumentoExtra[]>([]);
  const submittingRef = useRef(false);

  const {
    data: editData,
    isLoading: loadingApi,
    error: queryError,
  } = useQuery({
    queryKey: ["armazem", "paiol", id, "edit"],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      return fetchEdit(token, numId);
    },
    staleTime: 30 * 1000,
    retry: 2,
    enabled: validId && !!getToken(),
  });

  const paiol = editData ? mapApiToPaiol({ paiol: editData.paiol, cargosAcesso: editData.cargosSelecionados }, id) : null;

  useEffect(() => {
    if (!editData) return;
    const mapped = mapApiToPaiol({ paiol: editData.paiol, cargosAcesso: editData.cargosSelecionados }, id);
    setForm({
      nome: mapped.nome,
      localizacao: mapped.localizacao ?? "",
      coordenadasLat: mapped.coordenadasLat ?? "",
      coordenadasLng: mapped.coordenadasLng ?? "",
      limiteMLE: mapped.limiteMLE,
      perfilRisco: mapped.perfilRisco,
      estado: mapped.estado,
      numeroLicenca: mapped.numeroLicenca ?? "",
      dataValidadeLicenca: mapped.dataValidadeLicenca ? mapped.dataValidadeLicenca.slice(0, 10) : "",
    });
    setCargosAcesso((editData.cargosSelecionados ?? []) as CargoAcessoPaiol[]);
  }, [editData, id]);

  const mutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada.");
      await putEdit(token, numId, fd);
    },
    onSuccess: () => {
      useToastStore.getState().show("Paiol atualizado com sucesso.", "success");
      queryClient.invalidateQueries({ queryKey: ["armazem"] });
      queryClient.invalidateQueries({ queryKey: ["armazem", "paiol", id] });
      router.push(`/armazem/${id}?editado=1`);
    },
    onError: (err: Error) => {
      setMessage({ type: "error", text: err.message || "Erro ao guardar." });
    },
    onSettled: () => {
      submittingRef.current = false;
    },
  });

  const toggleCargo = (c: CargoAcessoPaiol) => {
    setCargosAcesso((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const addNovoDoc = () => {
    setNovosExtras((e) => [...e, { id: `ex-${Date.now()}`, nome: "" }]);
  };

  const removeNovoDoc = (docId: string) => {
    setNovosExtras((e) => e.filter((x) => x.id !== docId));
  };

  const setNovoDocNome = (docId: string, nome: string) => {
    setNovosExtras((e) =>
      e.map((x) => (x.id === docId ? { ...x, nome: nome.slice(0, 100) } : x))
    );
  };

  const toggleRemoverDoc = (docId: string) => {
    setRemoverDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paiol) return;
    setMessage(null);
    if (!form.nome.trim()) {
      setMessage({ type: "error", text: "O nome do paiol é obrigatório." });
      return;
    }
    if (form.nome.length > 200) {
      setMessage({ type: "error", text: "O nome não pode exceder 200 caracteres." });
      return;
    }
    const limite = Number(form.limiteMLE);
    if (!validarLimiteMLE(limite)) {
      setMessage({ type: "error", text: "O limite MLE deve ser um valor positivo." });
      return;
    }
    const lat = form.coordenadasLat === "" ? undefined : Number(form.coordenadasLat);
    const lng = form.coordenadasLng === "" ? undefined : Number(form.coordenadasLng);
    const token = getToken();
    if (!validId || !token) {
      setMessage({ type: "error", text: "Sessão inválida. Faça login." });
      return;
    }
    const fd = new FormData();
    fd.append("Paiol.Id", String(numId));
    fd.append("Paiol.Nome", form.nome.trim());
    fd.append("Paiol.Localizacao", form.localizacao.trim() || "");
    fd.append("Paiol.LimiteMLE", String(limite));
    fd.append("Paiol.PerfilRisco", form.perfilRisco);
    fd.append("Paiol.Estado", form.estado);
    if (form.numeroLicenca?.trim()) fd.append("Paiol.NumeroLicenca", form.numeroLicenca.trim());
    if (form.dataValidadeLicenca?.trim()) fd.append("Paiol.DataValidadeLicenca", form.dataValidadeLicenca.trim());
    if (lat != null && !Number.isNaN(lat)) fd.append("Paiol.CoordenadasLat", String(lat));
    if (lng != null && !Number.isNaN(lng)) fd.append("Paiol.CoordenadasLng", String(lng));
    (cargosAcesso.length > 0 ? cargosAcesso : ["Admin"]).forEach((c) => fd.append("CargosAcesso", c));
    Array.from(removerDocIds).forEach((docId) => {
      const n = parseInt(docId, 10);
      if (!Number.isNaN(n)) fd.append("RemoverDocumentoExtraIds", String(n));
    });
    submittingRef.current = true;
    mutation.mutate(fd);
  };

  const saving = mutation.isPending;

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
              {queryError instanceof Error ? queryError.message : "Erro ao carregar."}
            </p>
          )}
          {!queryError && <p className="text-gray-600 dark:text-gray-400">Paiol não encontrado.</p>}
          <Link href="/armazem" className="mt-5 inline-block text-[#f97316] hover:underline">
            ← Voltar
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8 pt-content-offset"
        
      >
        <div className="mx-auto max-w-3xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={transitionSmooth}>
            <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Editar paiol
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Altere os dados do paiol. Pode remover ou adicionar documentos e alterar cargos com acesso.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.05 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Identificação</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="nome" className={labelClass}>Nome *</label>
                  <input
                    id="nome"
                    type="text"
                    required
                    maxLength={200}
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="localizacao" className={labelClass}>Localização (texto / morada)</label>
                  <input
                    id="localizacao"
                    type="text"
                    maxLength={500}
                    value={form.localizacao}
                    onChange={(e) => setForm((f) => ({ ...f, localizacao: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.07 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Localização e mapa</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                O mapa será integrado acima; ao seleccionar um ponto, a latitude e a longitude serão preenchidas automaticamente nos campos abaixo.
              </p>
              <div className="mt-4">
                <MapaCoordenadas
                  lat={form.coordenadasLat}
                  lng={form.coordenadasLng}
                  onLatChange={(v) => setForm((f) => ({ ...f, coordenadasLat: v }))}
                  onLngChange={(v) => setForm((f) => ({ ...f, coordenadasLng: v }))}
                  mapContainerId="mapa-paiol-editar"
                />
              </div>
            </motion.section>

            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.08 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Capacidade e licença</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="limiteMLE" className={labelClass}>Teto de segurança NEM (kg) *</label>
                  <input
                    id="limiteMLE"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={form.limiteMLE}
                    onChange={(e) => setForm((f) => ({ ...f, limiteMLE: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="perfilRisco" className={labelClass}>Perfil de risco *</label>
                    <select
                      id="perfilRisco"
                      value={form.perfilRisco}
                      onChange={(e) => setForm((f) => ({ ...f, perfilRisco: e.target.value as PerfilRiscoPaiol }))}
                      className={inputClass}
                    >
                      {PERFIS_RISCO.map((v) => (
                        <option key={v} value={v}>{labelPerfilRisco(v)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="estado" className={labelClass}>Estado *</label>
                    <select
                      id="estado"
                      value={form.estado}
                      onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoPaiol }))}
                      className={inputClass}
                    >
                      {ESTADOS_PAIOL.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="numeroLicenca" className={labelClass}>N.º licença</label>
                  <input
                    id="numeroLicenca"
                    type="text"
                    maxLength={50}
                    value={form.numeroLicenca}
                    onChange={(e) => setForm((f) => ({ ...f, numeroLicenca: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="dataValidadeLicenca" className={labelClass}>Validade da licença</label>
                  <input
                    id="dataValidadeLicenca"
                    type="date"
                    value={form.dataValidadeLicenca}
                    onChange={(e) => setForm((f) => ({ ...f, dataValidadeLicenca: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.1 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cargos com acesso</h2>
              <div className="mt-4 flex flex-wrap gap-4">
                {CARGOS_ACESSO_PAIOL.map((c) => (
                  <label key={c} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cargosAcesso.includes(c)}
                      onChange={() => toggleCargo(c)}
                      className="h-4 w-4 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{c}</span>
                  </label>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.12 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documentação</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Documentos existentes: marque Remover para apagar. Adicione novos abaixo.
              </p>
              {(paiol.documentosExtras ?? []).length > 0 && (
                <div className="mt-4 space-y-2">
                  {(paiol.documentosExtras ?? []).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-[#222]"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">{doc.nome || "Documento"}</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => alert("Em modo demonstração os ficheiros não estão disponíveis.")}
                          className="text-sm text-[#f97316] hover:underline"
                        >
                          Ver
                        </button>
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <input
                            type="checkbox"
                            checked={removerDocIds.has(doc.id)}
                            onChange={() => toggleRemoverDoc(doc.id)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          Remover
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={addNovoDoc}
                  data-button
                  className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-[border-color,background-color,color] duration-200 hover:border-[#f97316] hover:bg-[#f97316]/5 hover:text-[#f97316] dark:border-[#444] dark:text-gray-400 dark:hover:border-[#f97316] dark:hover:text-[#f97316]"
                >
                  <span className="text-lg leading-none">+</span>
                  Adicionar documento
                </button>
                {novosExtras.map((ex) => (
                  <div
                    key={ex.id}
                    className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-3 dark:border-[#222]"
                  >
                    <div className="min-w-[200px] flex-1">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome (máx. 100)</label>
                      <input
                        type="text"
                        maxLength={100}
                        value={ex.nome}
                        onChange={(e) => setNovoDocNome(ex.id, e.target.value)}
                        className={inputClass}
                        placeholder="Nome do documento"
                      />
                    </div>
                    <div className="min-w-[140px] flex-1">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Ficheiro</label>
                      <input type="file" accept={FILE_ACCEPT} className={inputClass} readOnly tabIndex={-1} aria-hidden />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNovoDoc(ex.id)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>

            {message && (
              <p className={`text-sm ${message.type === "error" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                {message.text}
              </p>
            )}
            <div className="flex gap-3">
              <button type="submit" className={btnPrimary} disabled={saving}>
                {saving ? "A guardar…" : "Guardar alterações"}
              </button>
              <Link href={`/armazem/${id}`} className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
