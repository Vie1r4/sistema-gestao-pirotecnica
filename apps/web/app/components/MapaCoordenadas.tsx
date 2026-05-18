"use client";

/**
 * Bloco reutilizável: mapa Leaflet + campos Latitude/Longitude.
 * Em modo edição, ao clicar no mapa as coordenadas são preenchidas e, opcionalmente, local/distrito/cidade/concelho (geocodificação inversa).
 */
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { getEnderecoFromCoords, type EnderecoFromCoords } from "@/app/lib/geocoding";

const MapaLeaflet = dynamic(() => import("@/app/components/MapaLeaflet"), { ssr: false });

type MapaCoordenadasProps = {
  readOnly?: boolean;
  lat?: number | string;
  lng?: number | string;
  /** Raio ao público em metros; quando definido, desenha um círculo no mapa (apenas em modo edição) */
  raioMetros?: number | string;
  onLatChange?: (value: string) => void;
  onLngChange?: (value: string) => void;
  onRaioChange?: (value: string) => void;
  /** Chamado quando o utilizador clica no mapa; recebe o endereço obtido por geocodificação inversa (local, distrito, cidade, municipio) */
  onAddressFromCoords?: (address: EnderecoFromCoords) => void;
  mapContainerId?: string;
  className?: string;
};

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";

export default function MapaCoordenadas({
  readOnly = false,
  lat = "",
  lng = "",
  raioMetros: raioProp,
  onLatChange,
  onLngChange,
  onRaioChange,
  onAddressFromCoords,
  mapContainerId = "mapa-paiol-container",
  className = "",
}: MapaCoordenadasProps) {
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const latStr = lat !== undefined && lat !== "" ? String(lat) : "";
  const lngStr = lng !== undefined && lng !== "" ? String(lng) : "";
  const raioStr = raioProp !== undefined && raioProp !== "" ? String(raioProp) : "";
  const latNum = latStr ? Number(latStr) : undefined;
  const lngNum = lngStr ? Number(lngStr) : undefined;
  const raioNum = raioStr ? Number(raioStr) : undefined;
  const temCoordenadas = latNum != null && lngNum != null && Number.isFinite(latNum) && Number.isFinite(lngNum);
  const mostraRaio = onRaioChange != null;

  const handleMapClick = useCallback(
    async (latVal: number, lngVal: number) => {
      if (readOnly) return;
      onLatChange?.(String(latVal));
      onLngChange?.(String(lngVal));
      if (onAddressFromCoords) {
        setGeocodeLoading(true);
        try {
          const address = await getEnderecoFromCoords(latVal, lngVal);
          onAddressFromCoords(address);
        } catch {
          // falha silenciosa; coordenadas já foram preenchidas
        } finally {
          setGeocodeLoading(false);
        }
      }
    },
    [readOnly, onLatChange, onLngChange, onAddressFromCoords]
  );

  const center = useMemo((): [number, number] => {
    if (temCoordenadas) return [latNum!, lngNum!];
    return [39.5, -8];
  }, [temCoordenadas, latNum, lngNum]);

  return (
    <div className={className}>
      <div id={mapContainerId} className="rounded-xl overflow-hidden border border-gray-200 dark:border-[#222]">
        <MapaLeaflet
          center={center}
          zoom={temCoordenadas ? 15 : 7}
          height="280px"
          lat={latNum}
          lng={lngNum}
          raioMetros={raioNum != null && Number.isFinite(raioNum) && raioNum > 0 ? raioNum : undefined}
          onMapClick={!readOnly ? handleMapClick : undefined}
          mapId={mapContainerId}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {readOnly ? "Localização no mapa." : "Clique no mapa para definir a latitude e longitude."}
        {onAddressFromCoords && !readOnly && " Local, cidade, distrito e concelho serão preenchidos automaticamente."}
        {geocodeLoading && " A obter morada…"}
        {mostraRaio && temCoordenadas && " Indique o raio ao público (m) para ver o círculo no mapa."}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="coordenadas-lat" className={labelClass}>
            Latitude
          </label>
          {readOnly ? (
            <p id="coordenadas-lat" className="mt-1 text-gray-900 dark:text-white">
              {latStr || "—"}
            </p>
          ) : (
            <input
              id="coordenadas-lat"
              type="number"
              step="any"
              value={latStr}
              onChange={(e) => onLatChange?.(e.target.value)}
              className={inputClass}
              placeholder="Ex.: 38.72 (ou clique no mapa)"
              aria-describedby={mapContainerId}
            />
          )}
        </div>
        <div>
          <label htmlFor="coordenadas-lng" className={labelClass}>
            Longitude
          </label>
          {readOnly ? (
            <p id="coordenadas-lng" className="mt-1 text-gray-900 dark:text-white">
              {lngStr || "—"}
            </p>
          ) : (
            <input
              id="coordenadas-lng"
              type="number"
              step="any"
              value={lngStr}
              onChange={(e) => onLngChange?.(e.target.value)}
              className={inputClass}
              placeholder="Ex.: -9.14 (ou clique no mapa)"
              aria-describedby={mapContainerId}
            />
          )}
        </div>
      </div>
      {mostraRaio && (
        <div className="mt-4">
          <label htmlFor="raio-publico-mapa" className={labelClass}>
            Raio ao público (m)
          </label>
          {readOnly ? (
            <p id="raio-publico-mapa" className="mt-1 text-gray-900 dark:text-white">
              {raioStr || "—"}
            </p>
          ) : (
            <input
              id="raio-publico-mapa"
              type="number"
              min={0}
              step="any"
              value={raioStr}
              onChange={(e) => onRaioChange?.(e.target.value)}
              className={inputClass}
              placeholder="Ex.: 500 — desenha um círculo no mapa"
              aria-describedby={mapContainerId}
            />
          )}
        </div>
      )}
    </div>
  );
}
