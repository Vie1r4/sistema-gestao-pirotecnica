import Link from "next/link";
import DocLink from "./FuncionarioDocLink";
import LicencaEstadoBadge from "./LicencaEstadoBadge";
import { labelClass } from "@/app/components/ui/tokens";
import type { Funcionario } from "@/app/lib/funcionarios";

type Props = {
  funcionarioId: string;
  funcionario: Funcionario;
  canGerir: boolean;
};

export default function LicencaOperadorDetalheBlock({ funcionarioId, funcionario, canGerir }: Props) {
  const temLicenca =
    Boolean(funcionario.documentos?.licencaOperador) ||
    Boolean(funcionario.numeroCredencial?.trim()) ||
    Boolean(funcionario.dataValidadeLicencaOperador);

  if (!temLicenca) return null;

  const estado = funcionario.estadoLicencaOperador;
  const validadeFormatada = funcionario.dataValidadeLicencaOperador
    ? new Date(funcionario.dataValidadeLicencaOperador).toLocaleDateString("pt-PT")
    : "—";

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-[#222] dark:bg-[#0a0a0a]/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Credencial</h3>
        <LicencaEstadoBadge estado={estado} />
      </div>

      {(estado === "AExpirar" || estado === "Expirada" || estado === "Incompleta") && (
        <p
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            estado === "Expirada"
              ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
              : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
          }`}
        >
          {estado === "Expirada" && "Credencial expirada — renovação necessária para coordenador pirotécnico."}
          {estado === "AExpirar" && "Credencial prestes a expirar (≤ 60 dias) — planear renovação."}
          {estado === "Incompleta" && "Dados da credencial incompletos (CRED, validade ou documento em falta)."}
          {canGerir && (
            <>
              {" "}
              <Link href={`/funcionarios/${funcionarioId}/editar`} className="font-medium text-[#f97316] hover:underline">
                Editar ficha
              </Link>
            </>
          )}
        </p>
      )}

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className={labelClass}>N.º credencial (CRED)</dt>
          <dd className="mt-1 text-gray-600 dark:text-gray-400">
            {funcionario.numeroCredencial?.trim() || "—"}
          </dd>
        </div>
        <div>
          <dt className={labelClass}>Validade</dt>
          <dd className="mt-1 text-gray-600 dark:text-gray-400">{validadeFormatada}</dd>
        </div>
      </dl>

      {canGerir && funcionario.documentos?.licencaOperador && (
        <div className="mt-4">
          <DocLink
            funcionarioId={funcionarioId}
            label="Documento da credencial"
            tipo="licenca"
            fileName={funcionario.documentos.licencaOperador}
          />
        </div>
      )}
    </div>
  );
}
