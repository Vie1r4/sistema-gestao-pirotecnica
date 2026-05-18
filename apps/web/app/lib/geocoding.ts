/**
 * Geocodificação inversa (coordenadas → morada) via Nominatim (OpenStreetMap).
 * Uso: preencher local, distrito, cidade, concelho ao clicar no mapa.
 */

export type EnderecoFromCoords = {
  local?: string;
  distrito?: string;
  cidade?: string;
  municipio?: string;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT = "PirofafeApp/1.0 (contacto interno)";

/**
 * Obtém endereço aproximado a partir de lat/lng.
 * Respeita política de uso do Nominatim (1 req/s, User-Agent).
 */
export async function getEnderecoFromCoords(
  lat: number,
  lng: number
): Promise<EnderecoFromCoords> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    addressdetails: "1",
  });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return {};
  const data = (await res.json()) as {
    address?: Record<string, string>;
    display_name?: string;
  };
  const addr = data?.address;
  if (!addr || typeof addr !== "object") return {};

  // Portugal: state = distrito, county = concelho, town/village/city = cidade
  const state = addr.state ?? addr["state_district"] ?? "";
  const county = addr.county ?? addr.municipality ?? "";
  const cidade =
    addr.town ?? addr.city ?? addr.village ?? addr.municipality ?? addr.locality ?? "";
  const road = addr.road ?? "";
  const suburb = addr.suburb ?? addr.neighbourhood ?? "";
  const houseNumber = addr.house_number ?? "";
  const localPart = [road, houseNumber].filter(Boolean).join(" ") || suburb || cidade || "";

  return {
    local: localPart.trim() || undefined,
    distrito: state.trim() || undefined,
    cidade: cidade.trim() || undefined,
    municipio: county.trim() || undefined,
  };
}
