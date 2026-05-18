import { corEstado } from "@/app/lib/encomendas";

type StatusBadgeProps = {
  label: string;
  className?: string;
};

/** Badge de estado reutilizável (encomendas, serviços). */
export default function StatusBadge({ label, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${corEstado(label)} ${className}`.trim()}
    >
      {label}
    </span>
  );
}
