"use client";

import { dashboardPanelClass } from "@/app/components/gestor-analytics/dashboardPanelStyles";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 4 Cartões KPI Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${dashboardPanelClass} p-6 flex flex-col justify-between h-[130px]`}>
            <div className="flex justify-between items-start">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="space-y-2 mt-2">
              <div className="h-7 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>

      {/* Barra de Tabs Skeleton */}
      <div className="mt-8 border-b border-[#e7e5e4] dark:border-[#222] pb-px">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-28 animate-pulse rounded-t-lg bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>

      {/* 2 Gráficos Skeleton (Lado a Lado) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className={`${dashboardPanelClass} p-6 flex flex-col justify-between h-[360px]`}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3.5 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="flex-1 flex items-end justify-between gap-2 pt-6 px-2">
              {/* Barras/Linhas simuladas do gráfico */}
              {Array.from({ length: 12 }).map((_, idx) => {
                const heights = ["h-16", "h-24", "h-32", "h-40", "h-28", "h-36", "h-48", "h-20", "h-32", "h-44", "h-16", "h-28"];
                return (
                  <div
                    key={idx}
                    className={`flex-1 animate-pulse rounded-t bg-slate-200 dark:bg-slate-800 ${heights[idx % heights.length]}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
