"use client";

type Props = {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
};

export default function AdminFilterChip({ label, active, onClick, count }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-[#f97316] bg-[#fff7ed] text-[#ea580c] dark:border-[#f97316] dark:bg-[#431407]/40 dark:text-[#fb923c]"
          : "border-[#e7e5e4] bg-white text-[#57534e] hover:border-[#d4d0cc] dark:border-[#333] dark:bg-[#111] dark:text-[#a3a3a3] dark:hover:border-[#444]"
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
            active ? "bg-[#f97316]/20" : "bg-[#f1f5f9] dark:bg-[#1e293b]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
