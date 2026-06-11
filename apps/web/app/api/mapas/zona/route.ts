import { NextRequest, NextResponse } from "next/server";
import { buildZonaKml } from "@/app/lib/kmlZona";

export const dynamic = "force-dynamic";

function parseCoord(value: string | null): number | null {
  if (value == null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** KML público: ponto de lançamento + polígono do raio ao público (para Google Maps / Earth). */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseCoord(searchParams.get("lat"));
  const lng = parseCoord(searchParams.get("lng"));
  const raio = parseCoord(searchParams.get("raio"));
  const nome = searchParams.get("nome")?.trim() || "Local de lançamento";

  if (lat == null || lng == null || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "Coordenadas inválidas." }, { status: 400 });
  }

  const raioMetros = raio != null && raio > 0 ? Math.round(raio) : undefined;
  const kml = buildZonaKml(lat, lng, raioMetros, nome);

  return new NextResponse(kml, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.google-earth.kml+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
