"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format, subDays } from "date-fns";
import { adminTheme } from "@/app/admin/_components";
import {
  LOG_ENTIDADE_OPTIONS,
  LOG_TIPO_OPTIONS,
  logEntidadeLabel,
  logTipoLabel,
  matchLogTipoId,
  type LogEntidadeFilter,
  type LogTipoFilterId,
} from "@/app/admin/lib/logEntityFilter";

export type LogsFilterState = {
  acao: string;
  userName: string;
  entidade: LogEntidadeFilter;
  dataInicio: string;
  dataFim: string;
};

export const EMPTY_LOGS_FILTERS: LogsFilterState = {
  acao: "",
  userName: "",
  entidade: "",
  dataInicio: "",
  dataFim: "",
};

type Props = {
  value: LogsFilterState;
  onChange: (next: LogsFilterState) => void;
  onResetPage: () => void;
};

function todayIso() {
  return format(new Date(), "yyyy-MM-dd");
}

function pillClass(active: boolean) {
  return active
    ? "border-[#f97316] bg-[#fff7ed] text-[#ea580c] dark:border-[#f97316]/50 dark:bg-[#431407]/40 dark:text-[#fb923c]"
    : "border-[#e7e5e4] text-[#57534e] hover:bg-[#fafaf9] dark:border-[#333] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a]";
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#f97316]/40 bg-[#fff7ed] px-2.5 py-0.5 text-xs font-medium text-[#ea580c] dark:border-[#f97316]/30 dark:bg-[#431407]/30 dark:text-[#fb923c]">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-full hover:bg-[#f97316]/20"
        aria-label={`Remover filtro ${label}`}
      >
        ✕
      </button>
    </span>
  );
}

const CARD =
  "min-w-0 max-w-full overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6 dark:border-[#222] dark:bg-[#111]";
const FIELD = "min-w-0 max-w-full";
const INPUT = `${adminTheme.input} min-w-0 max-w-full box-border`;
const PILL =
  "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap";
const BTN_PERIOD =
  "inline-flex shrink-0 items-center justify-center rounded-lg border border-[#e7e5e4] bg-white px-3 py-1.5 text-xs font-medium text-[#57534e] transition-colors hover:bg-[#fafaf9] dark:border-[#333] dark:bg-[#111] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a]";

export default function AdminLogsFilters({
  value,
  onChange,
  onResetPage,
}: Props) {
  const [open, setOpen] = useState(true);
  const [acaoDraft, setAcaoDraft] = useState(value.acao);
  const [userDraft, setUserDraft] = useState(value.userName);
  const valueRef = useRef(value);
  valueRef.current = value;

  const quickTipoId = matchLogTipoId(value.acao);

  useEffect(() => {
    setAcaoDraft(value.acao);
  }, [value.acao]);

  useEffect(() => {
    setUserDraft(value.userName);
  }, [value.userName]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const trimmed = acaoDraft.trim();
      if (trimmed === valueRef.current.acao) return;
      onChange({ ...valueRef.current, acao: trimmed });
      onResetPage();
    }, 400);
    return () => window.clearTimeout(t);
  }, [acaoDraft, onChange, onResetPage]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const trimmed = userDraft.trim();
      if (trimmed === valueRef.current.userName) return;
      onChange({ ...valueRef.current, userName: trimmed });
      onResetPage();
    }, 400);
    return () => window.clearTimeout(t);
  }, [userDraft, onChange, onResetPage]);

  const patch = (partial: Partial<LogsFilterState>) => {
    onChange({ ...value, ...partial });
    onResetPage();
  };

  const toggleEntidade = (id: LogEntidadeFilter) => {
    patch({ entidade: value.entidade === id ? "" : id });
  };

  const toggleTipo = (id: LogTipoFilterId) => {
    const opt = LOG_TIPO_OPTIONS.find((o) => o.id === id);
    if (!opt) return;
    const isOff = quickTipoId === id;
    const nextAcao = isOff ? "" : opt.keyword;
    setAcaoDraft(nextAcao);
    onChange({ ...value, acao: nextAcao });
    onResetPage();
  };

  const clearAll = () => {
    setAcaoDraft("");
    setUserDraft("");
    onChange(EMPTY_LOGS_FILTERS);
    onResetPage();
  };

  const applyPeriodPreset = (preset: "today" | "7d" | "30d") => {
    const end = todayIso();
    const start =
      preset === "today"
        ? end
        : format(subDays(new Date(), preset === "7d" ? 6 : 29), "yyyy-MM-dd");
    patch({ dataInicio: start, dataFim: end });
  };

  const periodPresetActive = useMemo(() => {
    const { dataFim: end, dataInicio: start } = value;
    if (!start || !end) return null;
    const today = todayIso();
    if (start === today && end === today) return "today" as const;
    const d7 = format(subDays(new Date(), 6), "yyyy-MM-dd");
    if (start === d7 && end === today) return "7d" as const;
    const d30 = format(subDays(new Date(), 29), "yyyy-MM-dd");
    if (start === d30 && end === today) return "30d" as const;
    return null;
  }, [value.dataInicio, value.dataFim]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (value.acao) n++;
    if (value.userName) n++;
    if (value.entidade) n++;
    if (value.dataInicio || value.dataFim) n++;
    return n;
  }, [value]);

  return (
    <div className={CARD}>
      <button
        type="button"
        className="flex w-full min-w-0 items-center justify-between gap-3 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-semibold text-[#1c1917] dark:text-white">
            Filtros
          </span>
          {activeCount > 0 && (
            <span className="shrink-0 rounded-full bg-[#f97316] px-2 py-0.5 text-xs font-semibold text-black">
              {activeCount}
            </span>
          )}
        </div>
        <span className="shrink-0 text-xs text-[#a8a29e]">
          {open ? "Ocultar" : "Mostrar"}
        </span>
      </button>

      {open && (
        <div className="mt-5 min-w-0 space-y-6 border-t border-[#f0eeec] pt-5 dark:border-[#1a1a1a]">
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            <div className={FIELD}>
              <label htmlFor="log-filtro-user" className={adminTheme.label}>
                Utilizador
              </label>
              <input
                id="log-filtro-user"
                type="search"
                placeholder="Nome ou email"
                value={userDraft}
                onChange={(e) => setUserDraft(e.target.value)}
                className={INPUT}
                autoComplete="off"
              />
            </div>
            <div className={`${FIELD} md:col-span-1`}>
              <label htmlFor="log-filtro-acao" className={adminTheme.label}>
                Ação (contém)
              </label>
              <input
                id="log-filtro-acao"
                type="search"
                placeholder="ex: ENCOMENDA_CRIADA"
                value={acaoDraft}
                onChange={(e) => setAcaoDraft(e.target.value)}
                className={INPUT}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="min-w-0">
            <p className="mb-2.5 text-xs font-semibold text-[#78716c] dark:text-[#888]">Área</p>
            <div className="flex min-w-0 flex-wrap gap-2">
              {LOG_ENTIDADE_OPTIONS.map((opt) => (
                <button
                  key={opt.id || "todas"}
                  type="button"
                  onClick={() => toggleEntidade(opt.id)}
                  className={`${PILL} ${pillClass(value.entidade === opt.id)}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <p className="mb-2.5 text-xs font-semibold text-[#78716c] dark:text-[#888]">
              Tipo de operação
            </p>
            <div className="flex min-w-0 flex-wrap gap-2">
              {LOG_TIPO_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleTipo(opt.id)}
                  className={`${PILL} ${pillClass(quickTipoId === opt.id)}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <p className="text-xs font-semibold text-[#78716c] dark:text-[#888]">Período</p>
            <div className="grid max-w-full grid-cols-1 gap-3 sm:max-w-sm sm:grid-cols-2">
              <div className={FIELD}>
                <label htmlFor="log-filtro-inicio" className={adminTheme.label}>
                  Desde
                </label>
                <input
                  id="log-filtro-inicio"
                  type="date"
                  value={value.dataInicio}
                  max={value.dataFim || undefined}
                  onChange={(e) => patch({ dataInicio: e.target.value })}
                  className={INPUT}
                />
              </div>
              <div className={FIELD}>
                <label htmlFor="log-filtro-fim" className={adminTheme.label}>
                  Até
                </label>
                <input
                  id="log-filtro-fim"
                  type="date"
                  value={value.dataFim}
                  min={value.dataInicio || undefined}
                  onChange={(e) => patch({ dataFim: e.target.value })}
                  className={INPUT}
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {(
                [
                  ["today", "Hoje"],
                  ["7d", "7 dias"],
                  ["30d", "30 dias"],
                ] as const
              ).map(([preset, label]) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyPeriodPreset(preset)}
                  className={`${BTN_PERIOD} ${
                    periodPresetActive === preset ? "ring-2 ring-[#f97316]/40" : ""
                  }`}
                >
                  {label}
                </button>
              ))}
              {(value.dataInicio || value.dataFim) && (
                <button
                  type="button"
                  onClick={() => patch({ dataInicio: "", dataFim: "" })}
                  className="shrink-0 text-xs text-[#78716c] underline underline-offset-2 hover:text-[#1c1917] dark:text-[#666] dark:hover:text-white"
                >
                  Limpar datas
                </button>
              )}
            </div>
          </div>

          {activeCount > 0 && (
            <div className="flex min-w-0 flex-wrap items-center gap-2 border-t border-[#f0eeec] pt-4 dark:border-[#1a1a1a]">
              <span className="w-full shrink-0 text-xs text-[#a8a29e] sm:w-auto">Ativos:</span>
              {value.entidade && (
                <ActiveChip
                  label={logEntidadeLabel(value.entidade)}
                  onRemove={() => patch({ entidade: "" })}
                />
              )}
              {value.userName && (
                <ActiveChip
                  label={`Utilizador: ${value.userName}`}
                  onRemove={() => {
                    setUserDraft("");
                    patch({ userName: "" });
                  }}
                />
              )}
              {value.acao && (
                <ActiveChip
                  label={
                    quickTipoId ? `Tipo: ${logTipoLabel(quickTipoId)}` : `Ação: ${value.acao}`
                  }
                  onRemove={() => {
                    setAcaoDraft("");
                    patch({ acao: "" });
                  }}
                />
              )}
              {(value.dataInicio || value.dataFim) && (
                <ActiveChip
                  label={`${value.dataInicio || "…"} → ${value.dataFim || "…"}`}
                  onRemove={() => patch({ dataInicio: "", dataFim: "" })}
                />
              )}
              <button
                type="button"
                onClick={clearAll}
                className="w-full shrink-0 pt-1 text-xs font-medium text-[#ea580c] hover:underline sm:ml-auto sm:w-auto sm:pt-0 dark:text-[#fb923c]"
              >
                Limpar tudo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
