(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/MapaLeaflet.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapaLeaflet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Mapa Leaflet reutilizável.
 * Suporta: um marcador (lat/lng), vários marcadores (markers), ou modo clique para escolher coordenadas (onMapClick).
 * Sem atribuição no canto; botão de ecrã inteiro no canto.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const CENTRO_PT = [
    39.5,
    -8
];
const ZOOM_DEFAULT = 7;
function createIcon(type) {
    const cor = type === "paiol" ? "#0ea5e9" : type === "servico" ? "#f97316" : "#22c55e";
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
        className: "custom-marker",
        html: `<span style="background-color:${cor};width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);display:block;"></span>`,
        iconSize: [
            24,
            24
        ],
        iconAnchor: [
            12,
            12
        ]
    });
}
function MapaLeaflet({ center = CENTRO_PT, zoom = ZOOM_DEFAULT, height = "300px", lat, lng, raioMetros, markers = [], onMapClick, mapId = "mapa-leaflet", className = "" }) {
    _s();
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const markersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const circleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isFullscreen, setIsFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const toggleFullscreen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MapaLeaflet.useCallback[toggleFullscreen]": ()=>{
            const wrapper = wrapperRef.current;
            if (!wrapper) return;
            const map = mapRef.current;
            if (!document.fullscreenElement) {
                wrapper.requestFullscreen?.().then({
                    "MapaLeaflet.useCallback[toggleFullscreen]": ()=>{
                        setIsFullscreen(true);
                        setTimeout({
                            "MapaLeaflet.useCallback[toggleFullscreen]": ()=>map?.invalidateSize()
                        }["MapaLeaflet.useCallback[toggleFullscreen]"], 100);
                    }
                }["MapaLeaflet.useCallback[toggleFullscreen]"]);
            } else {
                document.exitFullscreen?.().then({
                    "MapaLeaflet.useCallback[toggleFullscreen]": ()=>{
                        setIsFullscreen(false);
                        setTimeout({
                            "MapaLeaflet.useCallback[toggleFullscreen]": ()=>map?.invalidateSize()
                        }["MapaLeaflet.useCallback[toggleFullscreen]"], 100);
                    }
                }["MapaLeaflet.useCallback[toggleFullscreen]"]);
            }
        }
    }["MapaLeaflet.useCallback[toggleFullscreen]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapaLeaflet.useEffect": ()=>{
            const onFullscreenChange = {
                "MapaLeaflet.useEffect.onFullscreenChange": ()=>{
                    const full = Boolean(document.fullscreenElement);
                    setIsFullscreen(full);
                    if (!full) setTimeout({
                        "MapaLeaflet.useEffect.onFullscreenChange": ()=>mapRef.current?.invalidateSize()
                    }["MapaLeaflet.useEffect.onFullscreenChange"], 100);
                }
            }["MapaLeaflet.useEffect.onFullscreenChange"];
            document.addEventListener("fullscreenchange", onFullscreenChange);
            return ({
                "MapaLeaflet.useEffect": ()=>document.removeEventListener("fullscreenchange", onFullscreenChange)
            })["MapaLeaflet.useEffect"];
        }
    }["MapaLeaflet.useEffect"], []);
    const pontos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MapaLeaflet.useMemo[pontos]": ()=>{
            if (markers.length > 0) return markers;
            if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
                return [
                    {
                        lat,
                        lng,
                        label: "Local"
                    }
                ];
            }
            return [];
        }
    }["MapaLeaflet.useMemo[pontos]"], [
        markers,
        lat,
        lng
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapaLeaflet.useEffect": ()=>{
            if (("TURBOPACK compile-time value", "object") === "undefined" || !containerRef.current) return;
            const map = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].map(containerRef.current, {
                center,
                zoom,
                scrollWheelZoom: true,
                attributionControl: false
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map);
            if (onMapClick) {
                map.on("click", {
                    "MapaLeaflet.useEffect": (e)=>{
                        onMapClick(e.latlng.lat, e.latlng.lng);
                    }
                }["MapaLeaflet.useEffect"]);
            }
            mapRef.current = map;
            return ({
                "MapaLeaflet.useEffect": ()=>{
                    markersRef.current.forEach({
                        "MapaLeaflet.useEffect": (m)=>m.remove()
                    }["MapaLeaflet.useEffect"]);
                    markersRef.current = [];
                    if (circleRef.current) {
                        circleRef.current.remove();
                        circleRef.current = null;
                    }
                    map.remove();
                    mapRef.current = null;
                }
            })["MapaLeaflet.useEffect"];
        // Mapa Leaflet: criar uma vez; recentrar/atualizar marcadores noutros efeitos.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- center/zoom/onMapClick aplicados noutros efeitos
        }
    }["MapaLeaflet.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapaLeaflet.useEffect": ()=>{
            if (!mapRef.current) return;
            const map = mapRef.current;
            markersRef.current.forEach({
                "MapaLeaflet.useEffect": (m)=>m.remove()
            }["MapaLeaflet.useEffect"]);
            markersRef.current = [];
            pontos.forEach({
                "MapaLeaflet.useEffect": (p)=>{
                    const marker = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].marker([
                        p.lat,
                        p.lng
                    ], {
                        icon: createIcon(p.type)
                    }).addTo(map);
                    if (p.label) marker.bindPopup(p.label);
                    markersRef.current.push(marker);
                }
            }["MapaLeaflet.useEffect"]);
        }
    }["MapaLeaflet.useEffect"], [
        pontos
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapaLeaflet.useEffect": ()=>{
            if (!mapRef.current) return;
            if (circleRef.current) {
                circleRef.current.remove();
                circleRef.current = null;
            }
            const hasCenter = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
            const hasRaio = raioMetros != null && Number.isFinite(raioMetros) && raioMetros > 0;
            if (hasCenter && hasRaio) {
                circleRef.current = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].circle([
                    lat,
                    lng
                ], {
                    radius: raioMetros,
                    color: "#f97316",
                    fillColor: "#f97316",
                    fillOpacity: 0.15,
                    weight: 2
                }).addTo(mapRef.current);
            }
        }
    }["MapaLeaflet.useEffect"], [
        lat,
        lng,
        raioMetros
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: wrapperRef,
        className: `relative ${className}`,
        style: {
            width: "100%",
            borderRadius: "0.75rem",
            overflow: "hidden",
            ...isFullscreen ? {
                height: "100vh",
                minHeight: "100%"
            } : {}
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: mapId,
                ref: containerRef,
                style: {
                    height: isFullscreen ? "100%" : height,
                    minHeight: isFullscreen ? "100%" : "200px",
                    width: "100%"
                },
                "aria-label": "Mapa"
            }, void 0, false, {
                fileName: "[project]/app/components/MapaLeaflet.tsx",
                lineNumber: 175,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: toggleFullscreen,
                className: "absolute right-2 top-2 z-[1000] flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white/95 text-gray-700 shadow hover:bg-gray-50 dark:border-[#333] dark:bg-[#1a1a1a]/95 dark:text-gray-200 dark:hover:bg-[#222]",
                title: isFullscreen ? "Sair de ecrã inteiro" : "Ecrã inteiro",
                "aria-label": isFullscreen ? "Sair de ecrã inteiro" : "Ecrã inteiro",
                children: isFullscreen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "h-5 w-5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    "aria-hidden": true,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M6 18L18 6M6 6l12 12"
                    }, void 0, false, {
                        fileName: "[project]/app/components/MapaLeaflet.tsx",
                        lineNumber: 194,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/MapaLeaflet.tsx",
                    lineNumber: 193,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "h-5 w-5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    "aria-hidden": true,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/components/MapaLeaflet.tsx",
                        lineNumber: 198,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/MapaLeaflet.tsx",
                    lineNumber: 197,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/MapaLeaflet.tsx",
                lineNumber: 185,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/MapaLeaflet.tsx",
        lineNumber: 165,
        columnNumber: 5
    }, this);
}
_s(MapaLeaflet, "YkbH7+Xl5doDHxc8t7Y9vh2G98U=");
_c = MapaLeaflet;
var _c;
__turbopack_context__.k.register(_c, "MapaLeaflet");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/MapaLeaflet.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/components/MapaLeaflet.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=app_components_MapaLeaflet_tsx_a283a076._.js.map