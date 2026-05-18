"use client";

/**
 * Mapa Leaflet reutilizável.
 * Suporta: um marcador (lat/lng), vários marcadores (markers), ou modo clique para escolher coordenadas (onMapClick).
 * Sem atribuição no canto; botão de ecrã inteiro no canto.
 */
import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MarcadorMapa = {
  lat: number;
  lng: number;
  label: string;
  type?: "paiol" | "servico";
};

type MapaLeafletProps = {
  center?: [number, number];
  zoom?: number;
  height?: string;
  lat?: number;
  lng?: number;
  /** Raio em metros para desenhar um círculo à volta do ponto (ex.: distância ao público) */
  raioMetros?: number;
  markers?: MarcadorMapa[];
  onMapClick?: (lat: number, lng: number) => void;
  mapId?: string;
  className?: string;
};

const CENTRO_PT: [number, number] = [39.5, -8];
const ZOOM_DEFAULT = 7;

function markerDotClass(type?: "paiol" | "servico") {
  if (type === "paiol") return "leaflet-marker-dot leaflet-marker-paiol";
  if (type === "servico") return "leaflet-marker-dot leaflet-marker-servico";
  return "leaflet-marker-dot leaflet-marker-default";
}

function createIcon(type?: "paiol" | "servico") {
  return L.divIcon({
    className: "custom-marker",
    html: `<span class="${markerDotClass(type)}"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function heightCanvasClass(height: string, isFullscreen: boolean): string {
  if (isFullscreen) return "mapa-leaflet-canvas mapa-leaflet-canvas--fullscreen";
  if (height === "500px") return "mapa-leaflet-canvas mapa-leaflet-canvas--h-500";
  if (height === "280px") return "mapa-leaflet-canvas mapa-leaflet-canvas--h-280";
  return "mapa-leaflet-canvas mapa-leaflet-canvas--h-300";
}

export default function MapaLeaflet({
  center = CENTRO_PT,
  zoom = ZOOM_DEFAULT,
  height = "300px",
  lat,
  lng,
  raioMetros,
  markers = [],
  onMapClick,
  mapId = "mapa-leaflet",
  className = "",
}: MapaLeafletProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const map = mapRef.current;
    if (!document.fullscreenElement) {
      wrapper.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
        setTimeout(() => map?.invalidateSize(), 100);
      });
    } else {
      document.exitFullscreen?.().then(() => {
        setIsFullscreen(false);
        setTimeout(() => map?.invalidateSize(), 100);
      });
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const full = Boolean(document.fullscreenElement);
      setIsFullscreen(full);
      if (!full) setTimeout(() => mapRef.current?.invalidateSize(), 100);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const pontos = useMemo(() => {
    if (markers.length > 0) return markers;
    if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
      return [{ lat, lng, label: "Local" }];
    }
    return [];
  }, [markers, lat, lng]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      scrollWheelZoom: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map);

    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
    // Mapa Leaflet: criar uma vez; recentrar/atualizar marcadores noutros efeitos.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- center/zoom/onMapClick aplicados noutros efeitos
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    pontos.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], { icon: createIcon(p.type) }).addTo(map);
      if (p.label) marker.bindPopup(p.label);
      markersRef.current.push(marker);
    });
  }, [pontos]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }
    const hasCenter = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
    const hasRaio = raioMetros != null && Number.isFinite(raioMetros) && raioMetros > 0;
    if (hasCenter && hasRaio) {
      circleRef.current = L.circle([lat, lng], {
        radius: raioMetros,
        color: "#f97316",
        fillColor: "#f97316",
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(mapRef.current);
    }
  }, [lat, lng, raioMetros]);

  const wrapClass = isFullscreen
    ? `mapa-leaflet-wrap mapa-leaflet-wrap--fullscreen relative ${className}`
    : `mapa-leaflet-wrap relative ${className}`;

  return (
    <div ref={wrapperRef} className={wrapClass}>
      <div
        id={mapId}
        ref={containerRef}
        className={heightCanvasClass(height, isFullscreen)}
        aria-label="Mapa"
      />
      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute right-2 top-2 z-[1000] flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white/95 text-gray-700 shadow hover:bg-gray-50 dark:border-[#333] dark:bg-[#1a1a1a]/95 dark:text-gray-200 dark:hover:bg-[#222]"
        title={isFullscreen ? "Sair de ecrã inteiro" : "Ecrã inteiro"}
        aria-label={isFullscreen ? "Sair de ecrã inteiro" : "Ecrã inteiro"}
      >
        {isFullscreen ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </button>
    </div>
  );
}
