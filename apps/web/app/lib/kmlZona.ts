/** Pontos de um anel circular (lat/lng). */
export function circleRing(lat: number, lng: number, radiusM: number, segments = 64): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const dx = radiusM * Math.cos(angle);
    const dy = radiusM * Math.sin(angle);
    const dLat = dy / 111_320;
    const dLng = dx / (111_320 * Math.cos((lat * Math.PI) / 180));
    points.push([lat + dLat, lng + dLng]);
  }
  return points;
}

export function buildZonaKml(lat: number, lng: number, raioMetros?: number, nome = "Local de lançamento"): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const placemarks: string[] = [
    `<Placemark>
  <name>${esc(nome)}</name>
  <description>Ponto exacto de lançamento pirotécnico</description>
  <Style>
    <IconStyle><scale>1.2</scale></IconStyle>
  </Style>
  <Point>
    <coordinates>${lng},${lat},0</coordinates>
  </Point>
</Placemark>`,
  ];

  if (raioMetros != null && raioMetros > 0) {
    const ring = circleRing(lat, lng, raioMetros);
    const coords = ring.map(([la, ln]) => `${ln},${la},0`).join(" ");
    placemarks.push(`<Placemark>
  <name>Raio ao público (${raioMetros} m)</name>
  <description>Distância de segurança calculada automaticamente</description>
  <Style>
    <LineStyle><color>ff16f973ff</color><width>2</width></LineStyle>
    <PolyStyle><color>3316f973</color><fill>1</fill><outline>1</outline></PolyStyle>
  </Style>
  <Polygon>
    <outerBoundaryIs>
      <LinearRing>
        <coordinates>${coords}</coordinates>
      </LinearRing>
    </outerBoundaryIs>
  </Polygon>
</Placemark>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${esc(nome)}</name>
    ${placemarks.join("\n    ")}
  </Document>
</kml>`;
}
