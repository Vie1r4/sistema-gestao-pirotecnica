"use client";

import type { Dispatch, SetStateAction } from "react";
import MapaCoordenadas from "@/app/components/MapaCoordenadas";
import {
  calcularAllocacao,
  calcularRaioPublicoZona,
  createEmptyLinha,
  createEmptyZona,
  formatQuantidadeDisplay,
  sanitizeQuantidadeInput,
  type ItemEncomendaForm,
  type ZonaForm,
  type ZonaLinhaForm,
} from "@/app/lib/zonasLancamento";

const inputClass =
  "rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";
const labelClass = "block text-xs font-medium text-gray-600 dark:text-gray-400";
const btnSmall =
  "rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";
const btnDangerSmall =
  "rounded-lg border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400";

type ResponsavelOpt = { id: number | string; nomeCompleto?: string };

type ZonasLancamentoEditorProps = {
  zonas: ZonaForm[];
  onChange: Dispatch<SetStateAction<ZonaForm[]>>;
  itensEncomenda: ItemEncomendaForm[];
  dataServico: string;
  membrosEquipa: ResponsavelOpt[];
  disabled?: boolean;
};

function updateZona(zonas: ZonaForm[], key: string, patch: Partial<ZonaForm>): ZonaForm[] {
  return zonas.map((z) => (z.key === key ? { ...z, ...patch } : z));
}

function updateLinha(
  zonas: ZonaForm[],
  zonaKey: string,
  linhaKey: string,
  patch: Partial<ZonaLinhaForm>
): ZonaForm[] {
  return zonas.map((z) =>
    z.key !== zonaKey
      ? z
      : {
          ...z,
          linhas: z.linhas.map((l) => (l.key === linhaKey ? { ...l, ...patch } : l)),
        }
  );
}

export default function ZonasLancamentoEditor({
  zonas,
  onChange,
  itensEncomenda,
  dataServico,
  membrosEquipa,
  disabled = false,
}: ZonasLancamentoEditorProps) {
  const { alocadoPorProduto, restantePorProduto, excede } = calcularAllocacao(zonas, itensEncomenda);

  const addZona = () => {
    onChange((prev) => [...prev, createEmptyZona(dataServico)]);
  };

  const removeZona = (key: string) => {
    onChange((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((z) => z.key !== key);
    });
  };

  const addLinha = (zonaKey: string) => {
    onChange((prev) =>
      prev.map((z) =>
        z.key === zonaKey ? { ...z, linhas: [...z.linhas, createEmptyLinha(dataServico)] } : z
      )
    );
  };

  const removeLinha = (zonaKey: string, linhaKey: string) => {
    onChange((prev) =>
      prev.map((z) => {
        if (z.key !== zonaKey) return z;
        const next = z.linhas.filter((l) => l.key !== linhaKey);
        return { ...z, linhas: next.length > 0 ? next : [createEmptyLinha(dataServico)] };
      })
    );
  };

  if (itensEncomenda.length === 0) {
    return (
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        Selecione uma encomenda com itens para configurar as zonas de lançamento.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Material da encomenda</h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Reparta as quantidades pelas zonas. A soma por produto não pode exceder o pedido.
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-[#e7e5e4] dark:border-[#333]">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e7e5e4] bg-[#fafaf9] dark:border-[#333] dark:bg-[#141414]">
                <th className="px-3 py-2 font-semibold">Produto</th>
                <th className="px-3 py-2 text-right font-semibold">Dist. público</th>
                <th className="px-3 py-2 text-right font-semibold">Pedido</th>
                <th className="px-3 py-2 text-right font-semibold">Alocado</th>
                <th className="px-3 py-2 text-right font-semibold">Restante</th>
              </tr>
            </thead>
            <tbody>
              {itensEncomenda.map((item) => {
                const alocado = alocadoPorProduto.get(item.produtoId) ?? 0;
                const restante = restantePorProduto.get(item.produtoId) ?? item.quantidadePedida;
                const linhaExcede = alocado > item.quantidadePedida;
                return (
                  <tr key={item.produtoId} className="border-b border-[#f5f5f4] dark:border-[#1a1a1a]">
                    <td className="px-3 py-2">{item.produtoNome}</td>
                    <td className="px-3 py-2 text-right text-[#57534e] dark:text-gray-400">
                      {item.distanciaSegurancaPublico_m != null ? `${item.distanciaSegurancaPublico_m} m` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">{formatQuantidadeDisplay(item.quantidadePedida)}</td>
                    <td
                      className={`px-3 py-2 text-right ${linhaExcede ? "font-semibold text-red-600 dark:text-red-400" : ""}`}
                    >
                      {formatQuantidadeDisplay(alocado)}
                    </td>
                    <td className="px-3 py-2 text-right text-[#57534e] dark:text-gray-400">
                      {formatQuantidadeDisplay(restante)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {excede && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            A alocação excede o pedido em pelo menos um produto. Ajuste as quantidades antes de guardar.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Zonas de lançamento</h3>
          <button type="button" disabled={disabled} onClick={addZona} className={btnSmall}>
            + Adicionar zona
          </button>
        </div>

        {zonas.map((zona, zonaIndex) => {
          const raioCalculado = calcularRaioPublicoZona(zona, itensEncomenda);
          return (
          <div
            key={zona.key}
            className="rounded-xl border border-[#e7e5e4] bg-[#fafaf9]/50 p-4 dark:border-[#333] dark:bg-[#0a0a0a]/50"
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Zona {zonaIndex + 1}
                {zona.designacao.trim() ? ` — ${zona.designacao.trim()}` : ""}
              </p>
              {zonas.length > 1 && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeZona(zona.key)}
                  className={btnDangerSmall}
                >
                  Remover zona
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Designação</label>
                <input
                  type="text"
                  maxLength={200}
                  disabled={disabled}
                  value={zona.designacao}
                  onChange={(e) => onChange((prev) => updateZona(prev, zona.key, { designacao: e.target.value }))}
                  className={inputClass + " mt-1 w-full"}
                  placeholder="Ex.: Campo, Igreja"
                />
              </div>
              <div>
                <label className={labelClass}>Responsável pirotécnico (opcional)</label>
                {membrosEquipa.length === 0 ? (
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    Selecione membros na equipa acima para designar o responsável por zona.
                  </p>
                ) : (
                  <select
                    disabled={disabled}
                    value={zona.responsavelPirotecnicoId}
                    onChange={(e) =>
                      onChange((prev) => updateZona(prev, zona.key, { responsavelPirotecnicoId: e.target.value }))
                    }
                    className={inputClass + " mt-1 w-full"}
                  >
                    <option value="">— Selecione —</option>
                    {membrosEquipa.map((f) => (
                      <option key={String(f.id)} value={String(f.id)}>
                        {f.nomeCompleto}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="mt-4">
              <MapaCoordenadas
                key={`mapa-zona-${zona.key}`}
                readOnly={disabled}
                lat={zona.coordenadasLat}
                lng={zona.coordenadasLng}
                raioMetros={raioCalculado ?? ""}
                onLatChange={(v) => onChange((prev) => updateZona(prev, zona.key, { coordenadasLat: v }))}
                onLngChange={(v) => onChange((prev) => updateZona(prev, zona.key, { coordenadasLng: v }))}
                mapContainerId={`mapa-zona-${zona.key}`}
              />
              {raioCalculado != null ? (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Área de segurança ao público:{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">{raioCalculado} m</span> — calculada
                  automaticamente (máximo entre os produtos desta zona).
                </p>
              ) : (
                <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                  Defina produtos com distância de segurança no catálogo para ver o raio no mapa.
                </p>
              )}
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className={labelClass}>Linhas de lançamento (horário e material)</span>
                <button type="button" disabled={disabled} onClick={() => addLinha(zona.key)} className={btnSmall}>
                  + Linha
                </button>
              </div>
              <div className="space-y-3">
                {zona.linhas.map((linha) => (
                  <div
                    key={linha.key}
                    className="grid gap-2 rounded-lg border border-[#e7e5e4] bg-white p-3 dark:border-[#333] dark:bg-[#111] sm:grid-cols-12"
                  >
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Data</label>
                      <input
                        type="date"
                        disabled={disabled}
                        value={linha.data}
                        onChange={(e) =>
                          onChange((prev) => updateLinha(prev, zona.key, linha.key, { data: e.target.value }))
                        }
                        className={inputClass + " mt-1 w-full"}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Hora início</label>
                      <input
                        type="time"
                        disabled={disabled}
                        value={linha.horaInicio}
                        onChange={(e) =>
                          onChange((prev) => updateLinha(prev, zona.key, linha.key, { horaInicio: e.target.value }))
                        }
                        className={inputClass + " mt-1 w-full"}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Hora fim</label>
                      <input
                        type="time"
                        disabled={disabled}
                        value={linha.horaFim}
                        onChange={(e) =>
                          onChange((prev) => updateLinha(prev, zona.key, linha.key, { horaFim: e.target.value }))
                        }
                        className={inputClass + " mt-1 w-full"}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className={labelClass}>Produto</label>
                      <select
                        disabled={disabled}
                        value={linha.produtoId}
                        onChange={(e) =>
                          onChange((prev) => updateLinha(prev, zona.key, linha.key, { produtoId: e.target.value }))
                        }
                        className={inputClass + " mt-1 w-full"}
                      >
                        <option value="">— Selecione —</option>
                        {itensEncomenda.map((item) => (
                          <option key={item.produtoId} value={String(item.produtoId)}>
                            {item.produtoNome}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        disabled={disabled}
                        value={linha.quantidade}
                        onChange={(e) =>
                          onChange((prev) =>
                            updateLinha(prev, zona.key, linha.key, {
                              quantidade: sanitizeQuantidadeInput(e.target.value),
                            })
                          )
                        }
                        className={
                          inputClass +
                          " mt-1 w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        }
                      />
                    </div>
                    <div className="flex items-end sm:col-span-1">
                      <button
                        type="button"
                        disabled={disabled || zona.linhas.length <= 1}
                        onClick={() => removeLinha(zona.key, linha.key)}
                        className={btnDangerSmall + " w-full"}
                        title="Remover linha"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <label className={labelClass}>Observações da zona</label>
              <textarea
                rows={2}
                maxLength={500}
                disabled={disabled}
                value={zona.observacoes}
                onChange={(e) => onChange((prev) => updateZona(prev, zona.key, { observacoes: e.target.value }))}
                className={inputClass + " mt-1 w-full"}
              />
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
