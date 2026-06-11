"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { buildGoogleMapsPinUrl } from "@/app/lib/googleMaps";

const MapaLeaflet = dynamic(() => import("@/app/components/MapaLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="mapa-leaflet-canvas mapa-leaflet-canvas--fullscreen animate-pulse bg-gray-100 dark:bg-[#1a1a1a]" />
  ),
});

function parseCoord(raw: string | null): number | null {
  if (!raw?.trim()) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export default function MapaZonaPageContent() {
  const searchParams = useSearchParams();
  const lat = parseCoord(searchParams.get("lat"));
  const lng = parseCoord(searchParams.get("lng"));
  const raio = parseCoord(searchParams.get("raio"));
  const nome = searchParams.get("nome")?.trim() || "Local de lançamento";

  const googlePinUrl = useMemo(() => {
    if (lat == null || lng == null) return null;
    return buildGoogleMapsPinUrl(lat, lng, raio ?? undefined);
  }, [lat, lng, raio]);

  if (lat == null || lng == null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafaf9] p-8 dark:bg-[#0a0a0a]">
        <p className="text-[#57534e] dark:text-gray-400">Coordenadas em falta ou inválidas.</p>
        <Link href="/" className="mt-4 text-[#f97316] hover:underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const temRaio = raio != null && raio > 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf9] dark:bg-[#0a0a0a]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e5e4] bg-white px-4 py-3 dark:border-[#222] dark:bg-[#111] sm:px-6">
        <div>
          <h1 className="text-lg font-semibold text-[#1c1917] dark:text-white">{nome}</h1>
          <p className="text-sm text-[#57534e] dark:text-gray-400">
            {lat.toFixed(5)}°, {lng.toFixed(5)}°
            {temRaio ? ` · Raio ao público: ${raio} m` : ""}
          </p>
        </div>
        {googlePinUrl && (
          <a
            href={googlePinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ea580c]"
          >
            Abrir pin no Google Maps
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </header>
      <div className="relative min-h-0 flex-1">
        <MapaLeaflet
          center={[lat, lng]}
          zoom={15}
          height="100%"
          lat={lat}
          lng={lng}
          raioMetros={temRaio ? raio : undefined}
          fitToRadius={temRaio}
          mapId="mapa-zona-fullscreen"
          className="h-[calc(100vh-4.5rem)]"
        />
      </div>
    </div>
  );
}
