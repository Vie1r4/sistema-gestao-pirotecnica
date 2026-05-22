"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { useCountUp } from "@/app/hooks/useCountUp";
import { adminTheme, STAT_ACCENT_BG, STAT_ACCENT_TEXT, type StatAccent } from "./adminTheme";

export function AdminCard({
  children,
  className = "",
  padding = true,
  variant = "default",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  variant?: "default" | "danger";
} & React.HTMLAttributes<HTMLDivElement>) {
  const base = variant === "danger" ? adminTheme.cardDanger : adminTheme.card;
  return (
    <div
      className={`${base} ${padding ? "p-5 sm:p-6" : ""} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

export const adminCardClass = adminTheme.card;

/** Card de estatística com ícone, count-up animado e rótulo. */
export function StatCard({
  icon,
  value,
  label,
  accent = "orange",
  className = "",
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  accent?: StatAccent;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const display = useCountUp(value, inView);

  return (
    <div
      ref={ref}
      className={`${adminTheme.card} flex flex-col gap-3 p-4 sm:p-5 ${className}`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${STAT_ACCENT_BG[accent]}`}
      >
        <span className={`h-4 w-4 ${STAT_ACCENT_TEXT[accent]}`}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-[#1c1917] dark:text-white">
          {display.toLocaleString("pt-PT")}
        </p>
        <p className="mt-0.5 text-sm text-[#57534e] dark:text-[#888]">{label}</p>
      </div>
    </div>
  );
}

/** Skeleton de carregamento para StatCard. */
export function StatCardSkeleton() {
  return (
    <div className={`${adminTheme.card} flex flex-col gap-3 p-4 sm:p-5`}>
      <div className="h-9 w-9 animate-pulse rounded-xl bg-[#e7e5e4] dark:bg-[#222]" />
      <div>
        <div className="h-7 w-14 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
        <div className="mt-1.5 h-4 w-20 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]" />
      </div>
    </div>
  );
}
