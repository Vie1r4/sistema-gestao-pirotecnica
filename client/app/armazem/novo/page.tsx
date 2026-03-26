"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import MapaCoordenadas from "@/app/components/MapaCoordenadas";
import { getToken } from "@/app/lib/auth";
import {
  PERFIS_RISCO,
  ESTADOS_PAIOL,
  CARGOS_ACESSO_PAIOL,
  labelPerfilRisco,
  validarLimiteMLE,
  type PaiolDocumentoExtra,
  type CargoAcessoPaiol,
  type PerfilRiscoPaiol,
  type EstadoPaiol,
} from "@/app/lib/armazem";
import { parseApiErrorBody } from "@/app/lib/apiErrors";
import { useToastStore } from "@/app/stores/useToastStore";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

import { apiPath } from "@/app/lib/apiConfig";

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


export default function NovoPaiolPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
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
  const [extras, setExtras] = useState<PaiolDocumentoExtra[]>([]);
  const submittingRef = useRef(false);

  const queryClient = useQueryClient();
  const token = getToken();

  const createMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const t = getToken();
      if (!t) throw new Error("Sessão expirada.");
      const res = await fetch(apiPath("api/paiol"), {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
        body: fd,
      });
      if (res.status === 401) throw new Error("Não autenticado");
      if (res.status === 403) throw new Error("Sem permissão para criar paiol (requer perfil Admin).");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const parsed = parseApiErrorBody(err);
        throw new Error(parsed.message);
      }
      return res.json() as Promise<{ paiol?: { Id?: number; id?: number } }>;
    },
    onSuccess: (data) => {
      useToastStore.getState().show("Paiol criado com sucesso.", "success");
      queryClient.invalidateQueries({ queryKey: ["armazem", "gestao"] });
      queryClient.invalidateQueries({ queryKey: ["armazem", "paiol"] });
      const newId = data.paiol?.Id ?? data.paiol?.id;
      if (newId != null) router.push(`/armazem/${String(newId)}?criado=1`);
      else router.push("/armazem/gestao?criado=1");
    },
    onSettled: () => {
      submittingRef.current = false;
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleCargo = (c: CargoAcessoPaiol) => {
    setCargosAcesso((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const addDocExtra = () => {
    setExtras((e) => [...e, { id: `ex-${Date.now()}`, nome: "" }]);
  };

  const removeDocExtra = (id: string) => {
    setExtras((e) => e.filter((x) => x.id !== id));
  };

  const setExtraNome = (id: string, nome: string) => {
    setExtras((e) =>
      e.map((x) => (x.id === id ? { ...x, nome: nome.slice(0, 100) } : x))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || createMutation.isPending) return;
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
      setMessage({ type: "error", text: "O limite MLE deve ser um valor positivo (ex.: 0.01 ou mais)." });
      return;
    }
    const latRaw = form.coordenadasLat === "" ? undefined : Number(form.coordenadasLat);
    const lngRaw = form.coordenadasLng === "" ? undefined : Number(form.coordenadasLng);
    const roundCoord = (n: number) => Math.round(n * 1e9) / 1e9;
    const lat = latRaw != null && !Number.isNaN(latRaw) ? roundCoord(latRaw) : undefined;
    const lng = lngRaw != null && !Number.isNaN(lngRaw) ? roundCoord(lngRaw) : undefined;
    if (!token) {
      router.replace("/login");
      return;
    }
    const fd = new FormData();
    fd.append("Paiol.Nome", form.nome.trim());
    fd.append("Paiol.Localizacao", form.localizacao.trim() || "");
    fd.append("Paiol.LimiteMLE", String(limite));
    fd.append("Paiol.PerfilRisco", form.perfilRisco);
    fd.append("Paiol.Estado", form.estado);
    if (form.dataValidadeLicenca?.trim()) fd.append("Paiol.DataValidadeLicenca", form.dataValidadeLicenca.trim());
    if (form.numeroLicenca?.trim()) fd.append("Paiol.NumeroLicenca", form.numeroLicenca.trim());
    if (lat != null) fd.append("Paiol.CoordenadasLat", String(lat));
    if (lng != null) fd.append("Paiol.CoordenadasLng", String(lng));
    const cargosParaEnviar = cargosAcesso.length > 0 ? cargosAcesso : ["Admin"];
    cargosParaEnviar.forEach((c) => fd.append("CargosAcesso", c));

    submittingRef.current = true;
    createMutation.mutate(fd, {
      onError: (err) => {
        setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro de rede. Tente novamente." });
      },
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />

      <main
        className="relative px-6 pt-14 pb-10 sm:px-8"
        style={{ paddingTop: CONTENT_OFFSET_TOP }}
      >
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={transitionSmooth}
          >
            <h1 className="font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Criar novo paiol
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Nome, localização, teto de segurança NEM (kg), perfil de risco, estado, licença PSP e cargos com acesso.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.05 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Identificação
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="nome" className={labelClass}>
                    Nome *
                  </label>
                  <input
                    id="nome"
                    type="text"
                    required
                    maxLength={200}
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                    className={inputClass}
                    placeholder="Nome do paiol"
                  />
                </div>
                <div>
                  <label htmlFor="localizacao" className={labelClass}>
                    Localização (texto / morada)
                  </label>
                  <input
                    id="localizacao"
                    type="text"
                    maxLength={500}
                    value={form.localizacao}
                    onChange={(e) => setForm((f) => ({ ...f, localizacao: e.target.value }))}
                    className={inputClass}
                    placeholder="Localização ou morada"
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Localização e mapa
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                O mapa será integrado acima; ao seleccionar um ponto, a latitude e a longitude serão preenchidas automaticamente nos campos abaixo.
              </p>
              <div className="mt-4">
                <MapaCoordenadas
                  lat={form.coordenadasLat}
                  lng={form.coordenadasLng}
                  onLatChange={(v) => setForm((f) => ({ ...f, coordenadasLat: v }))}
                  onLngChange={(v) => setForm((f) => ({ ...f, coordenadasLng: v }))}
                  mapContainerId="mapa-paiol-novo"
                />
              </div>
            </motion.section>

            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.08 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Capacidade e licença
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="limiteMLE" className={labelClass}>
                    Teto de segurança NEM (kg) *
                  </label>
                  <input
                    id="limiteMLE"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={form.limiteMLE}
                    onChange={(e) => setForm((f) => ({ ...f, limiteMLE: e.target.value }))}
                    className={inputClass}
                    placeholder="Ex.: 100"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="perfilRisco" className={labelClass}>
                      Perfil de risco *
                    </label>
                    <select
                      id="perfilRisco"
                      value={form.perfilRisco}
                      onChange={(e) => setForm((f) => ({ ...f, perfilRisco: e.target.value as PerfilRiscoPaiol }))}
                      className={inputClass}
                    >
                      {PERFIS_RISCO.map((v) => (
                        <option key={v} value={v}>
                          {labelPerfilRisco(v)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="estado" className={labelClass}>
                      Estado *
                    </label>
                    <select
                      id="estado"
                      value={form.estado}
                      onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoPaiol }))}
                      className={inputClass}
                    >
                      {ESTADOS_PAIOL.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="numeroLicenca" className={labelClass}>
                    N.º licença
                  </label>
                  <input
                    id="numeroLicenca"
                    type="text"
                    maxLength={50}
                    value={form.numeroLicenca}
                    onChange={(e) => setForm((f) => ({ ...f, numeroLicenca: e.target.value }))}
                    className={inputClass}
                    placeholder="Número da licença PSP"
                  />
                </div>
                <div>
                  <label htmlFor="dataValidadeLicenca" className={labelClass}>
                    Validade da licença
                  </label>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cargos com acesso
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Seleccione os cargos (roles) que podem aceder a este paiol.
              </p>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Documentação
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Documentos extras (licenças, plantas) com nome à escolha. Aceites: .pdf, .jpg, .jpeg, .png
              </p>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={addDocExtra}
                  data-button
                  className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-[border-color,background-color,color] duration-200 hover:border-[#f97316] hover:bg-[#f97316]/5 hover:text-[#f97316] dark:border-[#444] dark:text-gray-400 dark:hover:border-[#f97316] dark:hover:text-[#f97316]"
                >
                  <span className="text-lg leading-none">+</span>
                  Adicionar documento
                </button>
                {extras.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-3 dark:border-[#222]"
                  >
                    <div className="min-w-[200px] flex-1">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Nome (máx. 100 caracteres)
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={ex.nome}
                        onChange={(e) => setExtraNome(ex.id, e.target.value)}
                        className={inputClass}
                        placeholder="Nome do documento"
                      />
                    </div>
                    <div className="min-w-[140px] flex-1">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Ficheiro
                      </label>
                      <input
                        type="file"
                        accept={FILE_ACCEPT}
                        className={inputClass}
                        readOnly
                        tabIndex={-1}
                        aria-label="Ficheiro (em demonstração não é guardado)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocExtra(ex.id)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>

            {message && (
              <p
                className={`text-sm ${
                  message.type === "error" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                }`}
              >
                {message.text}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" className={btnPrimary} disabled={createMutation.isPending}>
                {createMutation.isPending ? "A guardar…" : "Guardar paiol"}
              </button>
              <Link href="/armazem/gestao" className={btnSecondary}>
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
