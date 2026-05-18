"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchUtilizadorParaEditar, updateUtilizador, type EditarUtilizadorModel } from "@/app/lib/admin";
import { getToken } from "@/app/lib/auth";
import { AdminPageHeader, buildBreadcrumbs } from "@/app/admin/_components";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";

const cardClass =
  "rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#222] dark:bg-[#111] sm:p-8";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";

const btnPrimary =
  "data-button rounded-xl bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";

const btnSecondary =
  "data-button rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";

export default function EditarUtilizadorPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [mounted, setMounted] = useState(false);
  const [model, setModel] = useState<EditarUtilizadorModel | null>(null);
  const [funcionariosDisponiveis, setFuncionariosDisponiveis] = useState<{ id: number; nomeCompleto: string }[]>([]);
  const submittingRef = useRef(false);
  const [message, setMessage] = useState<{ type: "error"; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: editData, isLoading: loading } = useQuery({
    queryKey: ["admin", "utilizador", id],
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        throw new Error("no-token");
      }
      return fetchUtilizadorParaEditar(token, id);
    },
    enabled: mounted && !!id,
    retry: 1,
  });

  useEffect(() => {
    if (loading) return;
    if (editData) {
      setModel(editData.model);
      setFuncionariosDisponiveis(editData.funcionariosDisponiveis);
    } else {
      setModel(null);
      setFuncionariosDisponiveis([]);
    }
  }, [editData, loading]);

  const saveMutation = useMutation({
    mutationFn: async (m: EditarUtilizadorModel) => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        throw new Error("Sessão expirada.");
      }
      await updateUtilizador(token, id, m);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "utilizadores"] });
      router.push("/admin/utilizadores");
    },
    onError: (e: Error) => {
      setMessage({ type: "error", text: e.message || "Erro ao guardar." });
    },
  });

  const toggleRole = (nome: string) => {
    if (!model) return;
    setModel({
      ...model,
      roles: model.roles.map((r) =>
        r.nome === nome ? { ...r, atribuido: !r.atribuido } : r
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || saveMutation.isPending) return;
    if (!model) return;
    setMessage(null);
    submittingRef.current = true;
    try {
      await saveMutation.mutateAsync(model);
    } finally {
      submittingRef.current = false;
    }
  };

  const submitting = saveMutation.isPending;

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (!model) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Utilizador não encontrado"
          breadcrumb={buildBreadcrumbs("/admin/utilizadores")}
        />
        <p className="text-[#57534e] dark:text-[#888]">O utilizador solicitado não existe ou foi removido.</p>
        <Link href="/admin/utilizadores" className="inline-block text-[#f97316] hover:underline">
          ← Voltar a Utilizadores
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Editar utilizador"
        description={`${model.userName} · ${model.email}`}
        breadcrumb={pathname ? buildBreadcrumbs(pathname) : buildBreadcrumbs("/admin/utilizadores/editar")}
      />
      <div className="mx-auto max-w-2xl">

      <form onSubmit={handleSubmit} className="space-y-6">
            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.05 }}
              className={cardClass}
            >
              <h2 className="text-lg font-semibold text-[#1c1917] dark:text-white">Roles (cargos)</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Marque os cargos a atribuir a este utilizador.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                {model.roles.map((r) => (
                  <label key={r.nome} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={r.atribuido}
                      onChange={() => toggleRole(r.nome)}
                      className="rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{r.nome}</span>
                  </label>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...transitionSmooth, delay: 0.1 }}
              className={`mt-6 ${cardClass}`}
            >
              <h2 className="text-lg font-semibold text-[#1c1917] dark:text-white">Funcionário associado</h2>
              <p className="mt-1 text-sm text-[#57534e] dark:text-[#888]">
                Opcional. Se escolher um funcionário, esta conta fica ligada à ficha do funcionário.
              </p>
              <div className="mt-4">
                <label htmlFor="funcionarioId" className={labelClass}>Funcionário</label>
                <select
                  id="funcionarioId"
                  value={model.funcionarioId ?? ""}
                  onChange={(e) =>
                    setModel({
                      ...model,
                      funcionarioId: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className={inputClass}
                >
                  <option value="">— Nenhum —</option>
                  {funcionariosDisponiveis.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nomeCompleto}
                    </option>
                  ))}
                </select>
              </div>
            </motion.section>

            {message && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{message.text}</p>
            )}

            <div className="mt-8 flex gap-3">
              <button type="submit" disabled={submitting} className={btnPrimary}>
                {submitting ? "A guardar…" : "Guardar"}
              </button>
              <Link href="/admin/utilizadores" className={btnSecondary}>
                Cancelar
              </Link>
            </div>
      </form>
      </div>
    </div>
  );
}
