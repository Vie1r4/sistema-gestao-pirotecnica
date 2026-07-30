"use client";

import Link from "next/link";
import { useMemo } from "react";

type Conformidade = {
  aExpirar: number;
  expiradas: number;
  incompletas: number;
};

export default function AlertBanner({ conformidade }: { conformidade?: Conformidade }) {
  const status = useMemo(() => {
    if (!conformidade) return null;
    const { aExpirar, expiradas, incompletas } = conformidade;
    if (aExpirar === 0 && expiradas === 0 && incompletas === 0) return null;

    const temExpiradas = expiradas > 0;
    const list: string[] = [];

    if (expiradas > 0) {
      list.push(`${expiradas} ${expiradas === 1 ? "credencial expirada" : "credenciais expiradas"}`);
    }
    if (aExpirar > 0) {
      list.push(`${aExpirar} ${aExpirar === 1 ? "credencial a expirar" : "credenciais a expirar"}`);
    }
    if (incompletas > 0) {
      list.push(`${incompletas} ${incompletas === 1 ? "credencial incompleta" : "credenciais incompletas"}`);
    }

    return {
      isDanger: temExpiradas,
      message: `Atenção: Detetámos ${list.join(", ")} no catálogo de funcionários.`,
      filtro: temExpiradas ? "expirada" : aExpirar > 0 ? "a_expirar" : "incompleta"
    };
  }, [conformidade]);

  if (!status) return null;

  const bgClass = status.isDanger
    ? "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-300"
    : "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-300";

  const iconClass = status.isDanger
    ? "text-red-600 dark:text-red-400"
    : "text-amber-600 dark:text-amber-400";

  const buttonClass = status.isDanger
    ? "bg-red-600 hover:bg-red-700 text-white dark:bg-red-900 dark:hover:bg-red-800"
    : "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-800";

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 shadow-sm ${bgClass}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${iconClass}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {status.isDanger ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            )}
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold">{status.message}</p>
          <p className="mt-0.5 text-xs opacity-80">
            {status.isDanger 
              ? "Operadores com credenciais expiradas não devem ser escalados para espetáculos por motivos legais da PSP."
              : "Verifique o estado de conformidade dos operadores para evitar que as credenciais expirem brevemente."}
          </p>
        </div>
      </div>
      <Link
        href={`/funcionarios?filtroLicenca=${status.filtro}`}
        className={`inline-flex shrink-0 items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-colors ${buttonClass}`}
      >
        Regularizar Funcionários
      </Link>
    </div>
  );
}
