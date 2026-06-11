"use client";

import { Suspense } from "react";
import MapaZonaPageContent from "./MapaZonaPageContent";

export default function MapaZonaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafaf9] dark:bg-[#0a0a0a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
        </div>
      }
    >
      <MapaZonaPageContent />
    </Suspense>
  );
}
