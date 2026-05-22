"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "@/app/lib/auth";
import { fetchList, mapApiToProduto } from "@/app/lib/produtosApi";
import type { Compilado } from "@/app/lib/compiladosApi";
import {
  btnPrimary,
  btnSecondary,
  cardClass,
  inputClass,
  inputClassInline,
  labelClass,
} from "./compiladosUi";

export type LinhaCompilado = { produtoId: string; quantidadePorUnidade: string };

type Props = {
  initialNome?: string;
  initialItens?: LinhaCompilado[];
  onSubmit: (data: { nome: string; itens: Array<{ produtoId: number; quantidadePorUnidade: number }> }) => void;
  submitLabel: string;
  cancelHref?: string;
  pending?: boolean;
  errorMessage?: string | null;
};

export default function CompiladoForm({
  initialNome = "",
  initialItens,
  onSubmit,
  submitLabel,
  cancelHref = "/produtos/compilados",
  pending = false,
  errorMessage = null,
}: Props) {
  const [nome, setNome] = useState(initialNome);
  const [linhas, setLinhas] = useState<LinhaCompilado[]>(
    initialItens?.length ? initialItens : [{ produtoId: "", quantidadePorUnidade: "" }]
  );
  const [erro, setErro] = useState<string | null>(null);

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos", "compilado-form"],
    queryFn: async () => {
      const t = getToken();
      if (!t) return [];
      const r = await fetchList(t, {});
      return (r.items ?? []).map((it) => mapApiToProduto(it as Record<string, unknown>));
    },
    staleTime: 60_000,
    enabled: !!getToken(),
  });

  const addLinha = () => setLinhas((l) => [...l, { produtoId: "", quantidadePorUnidade: "" }]);

  const removeLinha = (idx: number) => {
    if (linhas.length <= 1) return;
    setLinhas((l) => l.filter((_, i) => i !== idx));
  };

  const updateLinha = (idx: number, field: keyof LinhaCompilado, value: string) => {
    setLinhas((l) => l.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!nome.trim()) {
      setErro("O nome do compilado é obrigatório.");
      return;
    }
    const itens: Array<{ produtoId: number; quantidadePorUnidade: number }> = [];
    const vistos = new Set<number>();
    for (const linha of linhas) {
      const pid = parseInt(linha.produtoId, 10);
      const q = parseFloat(linha.quantidadePorUnidade.replace(",", "."));
      if (!linha.produtoId || Number.isNaN(pid)) {
        setErro("Selecione um produto em todas as linhas.");
        return;
      }
      if (Number.isNaN(q) || q < 0.0001) {
        setErro("Todas as quantidades por unidade devem ser positivas.");
        return;
      }
      if (vistos.has(pid)) {
        setErro("Não pode repetir o mesmo produto.");
        return;
      }
      vistos.add(pid);
      itens.push({ produtoId: pid, quantidadePorUnidade: q });
    }
    if (itens.length === 0) {
      setErro("Adicione pelo menos um produto.");
      return;
    }
    onSubmit({ nome: nome.trim(), itens });
  };

  const displayError = erro ?? errorMessage;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dados do compilado</h2>
        <div className="mt-4">
          <label htmlFor="compilado-nome" className={labelClass}>
            Nome *
          </label>
          <input
            id="compilado-nome"
            type="text"
            maxLength={200}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
            placeholder="Ex.: Dúzia especial"
            required
          />
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conteúdo por unidade</h2>
          <button type="button" onClick={addLinha} className={btnSecondary}>
            Adicionar produto
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Quantidade de cada artigo incluída em <strong>uma</strong> unidade deste atalho (ex.: 2 bombas e 10 foguetes por dúzia).
        </p>
        <ul className="mt-4 space-y-4">
          {linhas.map((linha, idx) => (
            <li
              key={idx}
              className="rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-4 dark:border-[#333] dark:bg-[#0a0a0a]"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Produto *</label>
                  <select
                    value={linha.produtoId}
                    onChange={(e) => updateLinha(idx, "produtoId", e.target.value)}
                    className={`${inputClassInline} mt-1 w-full`}
                    required
                  >
                    <option value="">— Selecionar —</option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Quantidade por unidade *</label>
                  <input
                    type="number"
                    min={0.0001}
                    step="any"
                    value={linha.quantidadePorUnidade}
                    onChange={(e) => updateLinha(idx, "quantidadePorUnidade", e.target.value)}
                    className={`${inputClassInline} mt-1 w-full`}
                    placeholder="Ex.: 2"
                    required
                  />
                </div>
              </div>
              {linhas.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLinha(idx)}
                  className="mt-3 text-sm text-red-600 hover:underline dark:text-red-400"
                >
                  Remover linha
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {displayError && (
        <p className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
          {displayError}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? "A guardar…" : submitLabel}
        </button>
        <Link href={cancelHref} className={btnSecondary}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}

export function compiladoToLinhas(c: Compilado): LinhaCompilado[] {
  return c.itens.map((i) => ({
    produtoId: String(i.produtoId),
    quantidadePorUnidade: String(i.quantidadePorUnidade),
  }));
}
