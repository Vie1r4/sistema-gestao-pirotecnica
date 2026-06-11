"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { buildMapaExternoUrl, isLocalOrigin } from "@/app/lib/googleMaps";

const MapaLeaflet = dynamic(() => import("@/app/components/MapaLeaflet"), {
  ssr: false,
  loading: () => (
    <div
      className="mapa-leaflet-canvas mapa-leaflet-canvas--h-220 animate-pulse bg-gray-100 dark:bg-[#1a1a1a]"
      aria-hidden
    />
  ),
});

type Props = {
  lat: number;
  lng: number;
  raioMetros?: number;
  mapId: string;
  nome?: string;
};

/** Mapa compacto read-only para uma zona de lançamento (marcador + raio ao público). */
export default function MapaZonaPreview({ lat, lng, raioMetros, mapId, nome }: Props) {
  const temRaio = raioMetros != null && raioMetros > 0;
  const label = nome?.trim() || "Local de lançamento";

  const mapaExternoUrl = useMemo(() => {
    if (typeof window === "undefined") return "#";
    const origin = window.location.origin;
    return buildMapaExternoUrl({
      lat,
      lng,
      raioMetros: temRaio ? raioMetros : undefined,
      origin,
      nome: label,
    });
  }, [lat, lng, raioMetros, temRaio, label]);

  const abreMapaInterno =
    typeof window !== "undefined" && temRaio && isLocalOrigin(window.location.origin);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-[#e7e5e4] bg-[#fafaf9] dark:border-[#333] dark:bg-[#0d0d0d]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e7e5e4] px-3 py-2.5 dark:border-[#333]">
        <p className="text-sm font-medium text-[#57534e] dark:text-gray-400">Local de lançamento</p>
        <a
          href={mapaExternoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-[#f97316] transition-colors hover:bg-[#fff7ed] dark:hover:bg-[#f97316]/10"
          title={
            abreMapaInterno
              ? "Mapa completo com ponto e raio (em localhost o Google Maps não consegue carregar o KML)"
              : temRaio
                ? `Google Maps: pin exacto + área de segurança (~${raioMetros} m)`
                : "Abrir pin exacto no Google Maps"
          }
        >
          {abreMapaInterno ? "Ver mapa completo" : "Abrir no Google Maps"}
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <div className="w-full [&_.mapa-leaflet-wrap]:rounded-none">
        <MapaLeaflet
          center={[lat, lng]}
          zoom={15}
          height="220px"
          lat={lat}
          lng={lng}
          raioMetros={temRaio ? raioMetros : undefined}
          fitToRadius={temRaio}
          mapId={mapId}
        />
      </div>
      {temRaio && (
        <p className="border-t border-[#e7e5e4] px-3 py-2 text-xs text-[#78716c] dark:border-[#333] dark:text-gray-500">
          Círculo laranja: raio ao público de {raioMetros} m.
          {!abreMapaInterno && " No Google Maps abre o pin e a área de segurança (KML)."}
        </p>
      )}
    </div>
  );
}
