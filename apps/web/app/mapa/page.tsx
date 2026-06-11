"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { fetchServicosFromApi } from "@/app/lib/servicos";
import { getToken } from "@/app/lib/auth";
import { fetchGestao } from "@/app/lib/paiolApi";
import type { MarcadorMapa } from "@/app/components/MapaLeaflet";

const MapaLeaflet = dynamic(() => import("@/app/components/MapaLeaflet"), { ssr: false });

const CENTRO_PT: [number, number] = [39.5, -8];

type LoadState = "loading" | "ready" | "error" | "no-session";

export default function MapaPage() {
  const [markers, setMarkers] = useState<MarcadorMapa[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadMapData = useCallback(async (signal: AbortSignal) => {
    const token = getToken();
    if (!token) {
      setLoadState("no-session");
      setMarkers([]);
      return;
    }
    setLoadState("loading");
    setLoadError(null);
    try {
      const [servicosRes, paioisRaw] = await Promise.all([
        fetchServicosFromApi(token, undefined, 1, 2000),
        fetchGestao(token),
      ]);
      if (signal.aborted) return;
      const servicosComCoord = (servicosRes.lista ?? []).filter(
        (s) =>
          s.coordenadasLat != null &&
          s.coordenadasLng != null &&
          Number.isFinite(s.coordenadasLat) &&
          Number.isFinite(s.coordenadasLng)
      );
      const paiois = (paioisRaw ?? []).filter((p: Record<string, unknown>) => {
        const lat = p.coordenadasLat ?? p.CoordenadasLat;
        const lng = p.coordenadasLng ?? p.CoordenadasLng;
        return lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
      });
      const lista: MarcadorMapa[] = [
        ...servicosComCoord.map((s) => ({
          lat: s.coordenadasLat!,
          lng: s.coordenadasLng!,
          label: s.local || `Serviço ${s.id}`,
          type: "servico" as const,
        })),
        ...paiois.map((p: Record<string, unknown>) => {
          const lat = Number(p.coordenadasLat ?? p.CoordenadasLat);
          const lng = Number(p.coordenadasLng ?? p.CoordenadasLng);
          const nome = String(p.nome ?? p.Nome ?? "");
          const id = p.id ?? p.Id;
          return {
            lat,
            lng,
            label: nome || `Paiol ${id ?? ""}`,
            type: "paiol" as const,
          };
        }),
      ];
      setMarkers(lista);
      setLoadState("ready");
    } catch (e) {
      if (signal.aborted) return;
      setMarkers([]);
      setLoadError(e instanceof Error ? e.message : "Não foi possível carregar serviços e paióis.");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const controller = new AbortController();
    void loadMapData(controller.signal);
    return () => controller.abort();
  }, [mounted, reloadKey, loadMapData]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf9] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0a] pt-content-offset">
        <div className="content-container px-4 py-8 sm:px-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-[#1c1917] dark:text-white">
              Mapa — Serviços e Paióis
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#f97316]" aria-hidden />
                Serviços
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#0ea5e9]" aria-hidden />
                Paióis
              </span>
            </div>
          </div>

          {loadState === "no-session" && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Inicie sessão para ver serviços e paióis no mapa.
              </p>
              <Link
                href="/login"
                className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
              >
                Ir para login
              </Link>
            </div>
          )}

          {loadState === "error" && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                {loadError ?? "Erro ao carregar o mapa."}
              </p>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 dark:bg-amber-700"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {loadState === "loading" && (
            <div className="mb-4 flex h-[500px] items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-[#222] dark:bg-[#111]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
            </div>
          )}

          {loadState === "ready" && (
            <>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#222] dark:bg-[#111]">
                <MapaLeaflet
                  center={CENTRO_PT}
                  zoom={7}
                  height="500px"
                  markers={markers}
                  mapId="mapa-servicos-paiois"
                />
              </div>
              {markers.length === 0 && (
                <p className="mt-4 rounded-lg border border-dashed border-[#e7e5e4] bg-[#fafaf9] px-4 py-3 text-sm text-[#78716c] dark:border-[#333] dark:bg-[#111]">
                  Nenhum serviço ou paiol com coordenadas. Defina latitude e longitude na edição de cada
                  registo.
                </p>
              )}
            </>
          )}

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            São mostrados no mapa apenas os serviços e paióis com coordenadas definidas.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/armazem"
              className="inline-flex items-center rounded-xl border border-[#e7e5e4] bg-white px-4 py-2 text-sm font-medium text-[#444] shadow-sm transition hover:bg-[#fafaf9] dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-[#222]"
            >
              Armazém
            </Link>
            <Link
              href="/servicos"
              className="inline-flex items-center rounded-xl bg-[#f97316] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#ea580c]"
            >
              Serviços
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
