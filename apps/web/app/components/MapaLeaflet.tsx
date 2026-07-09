"use client";

/**
 * Mapa Leaflet reutilizável.
 * Suporta: um marcador (lat/lng), vários marcadores (markers), ou modo clique para escolher coordenadas (onMapClick).
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
  /** Enquadrar o mapa ao círculo de segurança quando `raioMetros` está definido */
  fitToRadius?: boolean;
  markers?: MarcadorMapa[];
  onMapClick?: (lat: number, lng: number) => void;
  mapId?: string;
  className?: string;
};

const CENTRO_PT: [number, number] = [39.5, -8];
const ZOOM_DEFAULT = 7;

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const SATELITE_TILE_URL =
  "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const SATELITE_LABELS_URL =
  "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const ZOOM_MAX_OSM = 19;
/** Zoom máximo em satélite — acima disto os tiles Esri deixam de existir e a imagem desaparece. */
const ZOOM_MAX_SATELITE = 18;
const SATELITE_NATIVE_ZOOM = 18;

const MAP_CONTROL_BTN_CLASS =
  "absolute top-2 z-[1000] flex h-9 items-center justify-center rounded-lg border border-gray-300 bg-white/95 text-gray-700 shadow hover:bg-gray-50 dark:border-[#333] dark:bg-[#1a1a1a]/95 dark:text-gray-200 dark:hover:bg-[#222]";

const RAIO_COR = "#f97316";
/** Direção este — linha de raio horizontal (centro → borda). */
const RAIO_BEARING_GRAUS = 90;

function formatRaioLabel(metros: number): string {
  return `${Math.round(metros)} m`;
}

/** Ponto na borda do círculo a `distanciaM` metros do centro. */
function pontoNoRaio(lat: number, lng: number, distanciaM: number, bearingGraus: number): L.LatLng {
  const raioTerra = 6378137;
  const delta = distanciaM / raioTerra;
  const bearing = (bearingGraus * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(latRad) * Math.cos(delta) + Math.cos(latRad) * Math.sin(delta) * Math.cos(bearing)
  );
  const lng2 =
    lngRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(delta) * Math.cos(latRad),
      Math.cos(delta) - Math.sin(latRad) * Math.sin(lat2)
    );

  return L.latLng((lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI);
}

function createRaioLabelIcon(texto: string) {
  return L.divIcon({
    className: "leaflet-raio-label-wrap",
    html: `<span class="leaflet-raio-label">${texto}</span>`,
    iconSize: [72, 26],
    iconAnchor: [36, 13],
  });
}

function removeLayerSafe(layer: L.Layer | null) {
  if (!layer) return;
  try {
    layer.remove();
  } catch {
    /* ignore */
  }
}

function createSatelliteLayer() {
  return L.tileLayer(SATELITE_TILE_URL, {
    attribution: "Tiles &copy; Esri",
    maxZoom: ZOOM_MAX_SATELITE,
    maxNativeZoom: SATELITE_NATIVE_ZOOM,
    detectRetina: false,
    updateWhenIdle: false,
    updateWhenZooming: false,
    keepBuffer: 2,
    errorTileUrl:
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  });
}

function createSatelliteLabelsLayer() {
  return L.tileLayer(SATELITE_LABELS_URL, {
    maxZoom: ZOOM_MAX_SATELITE,
    detectRetina: false,
    updateWhenIdle: false,
    updateWhenZooming: false,
    keepBuffer: 2,
  });
}

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

function heightCanvasClass(height: string): string {
  if (height === "100%") return "mapa-leaflet-canvas mapa-leaflet-canvas--fullscreen";
  if (height === "500px") return "mapa-leaflet-canvas mapa-leaflet-canvas--h-500";
  if (height === "280px") return "mapa-leaflet-canvas mapa-leaflet-canvas--h-280";
  if (height === "220px") return "mapa-leaflet-canvas mapa-leaflet-canvas--h-220";
  if (height === "200px") return "mapa-leaflet-canvas mapa-leaflet-canvas--h-200";
  return "mapa-leaflet-canvas mapa-leaflet-canvas--h-300";
}

function limparContainerLeaflet(el: HTMLDivElement | null) {
  if (!el) return;
  delete (el as HTMLDivElement & { _leaflet_id?: number })._leaflet_id;
  el.replaceChildren();
}

function isMapAlive(map: L.Map | null): map is L.Map {
  if (!map) return false;
  try {
    const container = map.getContainer();
    return Boolean(container?.isConnected);
  } catch {
    return false;
  }
}

function destroyMap(map: L.Map | null) {
  if (!map) return;
  try {
    map.stop();
    map.off();
    map.remove();
  } catch {
    // Mapa já destruído ou DOM inconsistente durante transição de zoom.
  }
}

export default function MapaLeaflet({
  center = CENTRO_PT,
  zoom = ZOOM_DEFAULT,
  height = "300px",
  lat,
  lng,
  raioMetros,
  fitToRadius = false,
  markers = [],
  onMapClick,
  mapId = "mapa-leaflet",
  className = "",
}: MapaLeafletProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);
  const radiusLineRef = useRef<L.Polyline | null>(null);
  const radiusLabelRef = useRef<L.Marker | null>(null);
  const osmLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLabelsLayerRef = useRef<L.TileLayer | null>(null);
  const modoSateliteRef = useRef(false);
  const switchingLayerRef = useRef(false);
  const onMapClickRef = useRef(onMapClick);
  const timeoutIdsRef = useRef<number[]>([]);
  const [modoSatelite, setModoSatelite] = useState(false);
  const [aTrocarCamada, setATrocarCamada] = useState(false);

  onMapClickRef.current = onMapClick;

  const scheduleMapTask = useCallback((fn: () => void, delayMs: number) => {
    const id = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter((x) => x !== id);
      fn();
    }, delayMs);
    timeoutIdsRef.current.push(id);
    return id;
  }, []);

  const clearScheduledTasks = useCallback(() => {
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutIdsRef.current = [];
  }, []);

  const removeSatelliteLayers = useCallback((map: L.Map) => {
    const satellite = satelliteLayerRef.current;
    const labels = satelliteLabelsLayerRef.current;
    if (satellite && map.hasLayer(satellite)) map.removeLayer(satellite);
    if (labels && map.hasLayer(labels)) map.removeLayer(labels);
    removeLayerSafe(satellite);
    removeLayerSafe(labels);
    satelliteLayerRef.current = null;
    satelliteLabelsLayerRef.current = null;
  }, []);

  const addSatelliteLayers = useCallback((map: L.Map) => {
    const satellite = createSatelliteLayer();
    const labels = createSatelliteLabelsLayer();
    satelliteLayerRef.current = satellite;
    satelliteLabelsLayerRef.current = labels;
    satellite.addTo(map);
    labels.addTo(map);
  }, []);

  const applyBaseLayer = useCallback(
    (map: L.Map, recreateSatellite = false) => {
      const osm = osmLayerRef.current;
      if (!osm) return;

      if (modoSateliteRef.current) {
        if (map.hasLayer(osm)) map.removeLayer(osm);

        const hasSatellite =
          satelliteLayerRef.current &&
          satelliteLabelsLayerRef.current &&
          map.hasLayer(satelliteLayerRef.current) &&
          map.hasLayer(satelliteLabelsLayerRef.current);

        if (!hasSatellite || recreateSatellite) {
          removeSatelliteLayers(map);
          addSatelliteLayers(map);
        }

        map.setMaxZoom(ZOOM_MAX_SATELITE);
        if (map.getZoom() > ZOOM_MAX_SATELITE) {
          map.setZoom(ZOOM_MAX_SATELITE, { animate: false });
        }
      } else {
        removeSatelliteLayers(map);
        if (!map.hasLayer(osm)) osm.addTo(map);
        map.setMaxZoom(ZOOM_MAX_OSM);
      }
    },
    [addSatelliteLayers, removeSatelliteLayers]
  );

  const refreshMapView = useCallback(() => {
    const map = mapRef.current;
    if (!isMapAlive(map)) return;
    applyBaseLayer(map);
    map.invalidateSize({ animate: false });
    if (modoSateliteRef.current) {
      satelliteLayerRef.current?.redraw();
      satelliteLabelsLayerRef.current?.redraw();
    } else {
      osmLayerRef.current?.redraw();
    }
  }, [applyBaseLayer]);

  const toggleBaseLayer = useCallback(() => {
    if (switchingLayerRef.current) return;

    const map = mapRef.current;
    if (!isMapAlive(map) || !osmLayerRef.current) return;

    switchingLayerRef.current = true;
    setATrocarCamada(true);

    modoSateliteRef.current = !modoSateliteRef.current;
    setModoSatelite(modoSateliteRef.current);
    applyBaseLayer(map, modoSateliteRef.current);

    scheduleMapTask(() => {
      refreshMapView();
      switchingLayerRef.current = false;
      setATrocarCamada(false);
    }, 300);
  }, [applyBaseLayer, refreshMapView, scheduleMapTask]);

  const pontos = useMemo(() => {
    if (markers.length > 0) return markers;
    if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
      return [{ lat, lng, label: "Local" }];
    }
    return [];
  }, [markers, lat, lng]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const container = containerRef.current;
    limparContainerLeaflet(container);

    const map = L.map(container, {
      center,
      zoom,
      scrollWheelZoom: true,
      attributionControl: true,
      fadeAnimation: false,
      zoomAnimation: true,
    });

    const osmLayer = L.tileLayer(OSM_TILE_URL, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: ZOOM_MAX_OSM,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 1,
    });

    osmLayerRef.current = osmLayer;
    satelliteLayerRef.current = null;
    satelliteLabelsLayerRef.current = null;
    modoSateliteRef.current = false;
    osmLayer.addTo(map);

    const clickHandler = (e: L.LeafletMouseEvent) => {
      onMapClickRef.current?.(e.latlng.lat, e.latlng.lng);
    };
    const zoomEndHandler = () => {
      if (!modoSateliteRef.current || !isMapAlive(map)) return;
      if (map.getZoom() > ZOOM_MAX_SATELITE) {
        map.setZoom(ZOOM_MAX_SATELITE, { animate: false });
      }
    };
    map.on("click", clickHandler);
    map.on("zoomend", zoomEndHandler);

    mapRef.current = map;

    scheduleMapTask(() => {
      if (isMapAlive(map)) map.invalidateSize();
    }, 0);
    scheduleMapTask(() => {
      if (isMapAlive(map)) map.invalidateSize();
    }, 250);

    return () => {
      clearScheduledTasks();
      map.off("click", clickHandler);
      map.off("zoomend", zoomEndHandler);
      markersRef.current.forEach((m) => {
        try {
          m.remove();
        } catch {
          /* ignore */
        }
      });
      markersRef.current = [];
      if (circleRef.current) {
        removeLayerSafe(circleRef.current);
        circleRef.current = null;
      }
      removeLayerSafe(radiusLineRef.current);
      removeLayerSafe(radiusLabelRef.current);
      radiusLineRef.current = null;
      radiusLabelRef.current = null;
      destroyMap(map);
      mapRef.current = null;
      osmLayerRef.current = null;
      satelliteLayerRef.current = null;
      satelliteLabelsLayerRef.current = null;
      modoSateliteRef.current = false;
      switchingLayerRef.current = false;
      setATrocarCamada(false);
      setModoSatelite(false);
      limparContainerLeaflet(container);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mapa criado uma vez por instância
  }, [clearScheduledTasks, scheduleMapTask]);

  useEffect(() => {
    const map = mapRef.current;
    if (!isMapAlive(map)) return;
    markersRef.current.forEach((m) => {
      try {
        m.remove();
      } catch {
        /* ignore */
      }
    });
    markersRef.current = [];
    pontos.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], { icon: createIcon(p.type) }).addTo(map);
      if (p.label) marker.bindPopup(p.label);
      markersRef.current.push(marker);
    });
  }, [pontos]);

  useEffect(() => {
    const map = mapRef.current;
    if (!isMapAlive(map)) return;
    removeLayerSafe(circleRef.current);
    removeLayerSafe(radiusLineRef.current);
    removeLayerSafe(radiusLabelRef.current);
    circleRef.current = null;
    radiusLineRef.current = null;
    radiusLabelRef.current = null;

    const hasCenter = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
    const hasRaio = raioMetros != null && Number.isFinite(raioMetros) && raioMetros > 0;
    if (hasCenter && hasRaio) {
      const centro = L.latLng(lat, lng);
      const borda = pontoNoRaio(lat, lng, raioMetros, RAIO_BEARING_GRAUS);

      circleRef.current = L.circle(centro, {
        radius: raioMetros,
        color: RAIO_COR,
        fillColor: RAIO_COR,
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(map);

      radiusLineRef.current = L.polyline([centro, borda], {
        color: RAIO_COR,
        weight: 2,
        dashArray: "7 5",
      }).addTo(map);

      const meio = L.latLng((centro.lat + borda.lat) / 2, (centro.lng + borda.lng) / 2);
      radiusLabelRef.current = L.marker(meio, {
        icon: createRaioLabelIcon(formatRaioLabel(raioMetros)),
        interactive: false,
      }).addTo(map);

      if (fitToRadius && circleRef.current) {
        map.fitBounds(circleRef.current.getBounds(), {
          padding: [28, 28],
          maxZoom: 17,
          animate: false,
        });
      }
    }
  }, [lat, lng, raioMetros, fitToRadius]);

  useEffect(() => {
    const map = mapRef.current;
    if (!isMapAlive(map)) return;
    if (fitToRadius && raioMetros != null && raioMetros > 0) return;
    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const targetZoom = Math.max(map.getZoom(), 15);
    map.setView([lat, lng], targetZoom, { animate: false });
  }, [lat, lng, fitToRadius, raioMetros]);

  return (
    <div className={`mapa-leaflet-wrap relative ${className}`}>
      <div
        id={mapId}
        ref={containerRef}
        className={heightCanvasClass(height)}
        aria-label="Mapa"
      />
      <button
        type="button"
        onClick={toggleBaseLayer}
        disabled={aTrocarCamada}
        className={`${MAP_CONTROL_BTN_CLASS} right-2 min-w-9 px-2 text-xs font-medium disabled:cursor-wait disabled:opacity-70`}
        title={aTrocarCamada ? "A carregar…" : modoSatelite ? "Vista mapa" : "Vista satélite"}
        aria-label={aTrocarCamada ? "A carregar camada" : modoSatelite ? "Vista mapa" : "Vista satélite"}
        aria-pressed={modoSatelite}
        aria-busy={aTrocarCamada}
      >
        {aTrocarCamada ? "…" : modoSatelite ? "Mapa" : "Satélite"}
      </button>
    </div>
  );
}
