import {
  classeBadgeEstadoLicenca,
  rotuloEstadoLicenca,
  type EstadoLicencaOperador,
} from "@/app/lib/licencaOperadorConformidade";

type Props = {
  estado?: string | null;
  className?: string;
};

export default function LicencaEstadoBadge({ estado, className = "" }: Props) {
  if (!estado || estado === "Ausente") {
    return <span className={`text-[#78716c] dark:text-gray-400 ${className}`.trim()}>—</span>;
  }
  const e = estado as EstadoLicencaOperador;
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${classeBadgeEstadoLicenca(e)} ${className}`.trim()}
    >
      {rotuloEstadoLicenca(e)}
    </span>
  );
}
