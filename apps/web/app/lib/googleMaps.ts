/** Zoom aproximado para enquadrar um círculo de raio `radiusM` no viewport. */
export function zoomForRadiusMeters(lat: number, radiusM: number, padding = 1.4): number {
  const diameter = radiusM * 2 * padding;
  const zoom = Math.log2((591657550.5 * Math.cos((lat * Math.PI) / 180)) / diameter);
  return Math.min(18, Math.max(11, Math.round(zoom)));
}

export type GoogleMapsLocalizacaoOptions = {
  lat: number;
  lng: number;
  raioMetros?: number;
  /** Origem pública da app — necessária para KML com raio (Google Maps tem de conseguir fetch). */
  origin?: string;
  nome?: string;
};

function buildKmlUrl(origin: string, lat: number, lng: number, raioMetros: number, nome?: string): string {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    raio: String(Math.round(raioMetros)),
  });
  if (nome?.trim()) params.set("nome", nome.trim());
  return `${origin.replace(/\/$/, "")}/api/mapas/zona?${params.toString()}`;
}

export function isLocalOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  } catch {
    return false;
  }
}

/** Página interna com mapa Leaflet (ponto + raio) — útil em dev ou fallback. */
export function buildMapaZonaInternoUrl(origin: string, lat: number, lng: number, raioMetros?: number, nome?: string): string {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (raioMetros != null && raioMetros > 0) params.set("raio", String(Math.round(raioMetros)));
  if (nome?.trim()) params.set("nome", nome.trim());
  return `${origin.replace(/\/$/, "")}/mapas/zona?${params.toString()}`;
}

/**
 * Google Maps com pin exacto; com raio + origem pública inclui KML (marcador + polígono do raio).
 */
export function buildGoogleMapsLocalizacaoUrl(options: GoogleMapsLocalizacaoOptions): string;
export function buildGoogleMapsLocalizacaoUrl(lat: number, lng: number, raioMetros?: number): string;
export function buildGoogleMapsLocalizacaoUrl(
  latOrOptions: number | GoogleMapsLocalizacaoOptions,
  lng?: number,
  raioMetros?: number
): string {
  const opts: GoogleMapsLocalizacaoOptions =
    typeof latOrOptions === "object"
      ? latOrOptions
      : { lat: latOrOptions, lng: lng!, raioMetros };

  const { lat, lng: longitude, raioMetros: raio, origin, nome } = opts;
  const zoom = raio != null && raio > 0 ? zoomForRadiusMeters(lat, raio) : 17;
  const label = nome?.trim() || "Local de lançamento";

  if (origin && raio != null && raio > 0 && !isLocalOrigin(origin)) {
    const kmlUrl = buildKmlUrl(origin, lat, longitude, raio, label);
    const params = new URLSearchParams({
      q: kmlUrl,
      ll: `${lat},${longitude}`,
      z: String(zoom),
    });
    return `https://www.google.com/maps?${params.toString()}`;
  }

  const params = new URLSearchParams({
    api: "1",
    query: `${lat},${longitude}`,
  });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

/** Pin exacto + zoom (@). */
export function buildGoogleMapsPinUrl(lat: number, lng: number, raioMetros?: number): string {
  const zoom = raioMetros != null && raioMetros > 0 ? zoomForRadiusMeters(lat, raioMetros) : 17;
  return `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},${zoom}z`;
}

/** URL a abrir: Google Maps (prod + KML) ou mapa interno (localhost). */
export function buildMapaExternoUrl(options: GoogleMapsLocalizacaoOptions): string {
  const { origin, lat, lng, raioMetros, nome } = options;
  if (origin && raioMetros != null && raioMetros > 0 && isLocalOrigin(origin)) {
    return buildMapaZonaInternoUrl(origin, lat, lng, raioMetros, nome);
  }
  return buildGoogleMapsLocalizacaoUrl(options);
}
