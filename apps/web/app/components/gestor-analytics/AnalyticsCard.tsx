"use client";

import type { ReactNode } from "react";
import { dashboardPanelClass } from "./dashboardPanelStyles";

export default function AnalyticsCard({
  title,
  subtitle,
  children,
  className = "",
  action,
  compact = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  /** Menos padding — útil em colunas estreitas do dashboard. */
  compact?: boolean;
}) {
  return (
    <div
      className={`${dashboardPanelClass} ${compact ? "p-4" : "p-6"} ${className}`}
    >
      <div
        className={`flex flex-wrap items-start justify-between gap-2 ${compact ? "mb-3" : "mb-4"}`}
      >
        <div className="min-w-0">
          <h3
            className={`font-semibold text-[#1c1917] dark:text-white ${compact ? "text-sm" : ""}`}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[#78716c] dark:text-[#666]">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function AnalyticsSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded-xl bg-[#f5f5f4] dark:bg-[#1a1a1a]"
      style={{ height }}
    />
  );
}
