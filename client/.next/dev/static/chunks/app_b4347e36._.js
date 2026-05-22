(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/Navbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONTENT_OFFSET_TOP",
    ()=>CONTENT_OFFSET_TOP,
    "HEADER_HEIGHT",
    ()=>HEADER_HEIGHT,
    "SIDEBAR_WIDTH",
    ()=>SIDEBAR_WIDTH,
    "default",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/UserContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
/** Links da sidebar; cada um tem a permissão necessária (qualquer uma da lista permite ver o link). */ const NAV_LINKS = [
    {
        label: "Painel Admin",
        href: "/admin",
        permission: [
            "admin"
        ]
    },
    {
        label: "Funcionários",
        href: "/funcionarios",
        permission: [
            "funcionarios.gerir"
        ]
    },
    {
        label: "Clientes",
        href: "/clientes",
        permission: [
            "clientes.gerir"
        ]
    },
    {
        label: "Armazém",
        href: "/armazem",
        permission: [
            "armazem.stock",
            "armazem.gerir"
        ]
    },
    {
        label: "Catálogo",
        href: "/produtos",
        permission: [
            "produtos.ver",
            "produtos.gerir"
        ]
    },
    {
        label: "Encomendas",
        href: "/encomendas",
        permission: [
            "encomendas.gerir"
        ]
    },
    {
        label: "Serviços",
        href: "/servicos",
        permission: [
            "servicos.gerir"
        ]
    }
];
const SIDEBAR_WIDTH = 200;
const HEADER_HEIGHT = 56;
const CONTENT_OFFSET_TOP = HEADER_HEIGHT + 24;
const navItem = {
    initial: {
        opacity: 0,
        x: -12
    },
    animate: {
        opacity: 1,
        x: 0
    }
};
const HIDE_SIDEBAR_DELAY = 200;
function Navbar() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    const userName = user?.nome ?? null;
    const permissions = user?.permissions ?? [];
    const visibleLinks = NAV_LINKS.filter((link)=>link.permission.some((p)=>permissions.includes(p)));
    const [scrolled, setScrolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sidebarOpen, setSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const hideTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handleLogoClick = ()=>{
        setSidebarOpen(false);
    };
    const clearHideTimeout = ()=>{
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };
    /** Só abre a sidebar quando há utilizador autenticado. */ const handleLogoEnter = ()=>{
        if (!user) return;
        clearHideTimeout();
        setSidebarOpen(true);
    };
    const handleLogoLeave = ()=>{
        hideTimeoutRef.current = setTimeout(()=>setSidebarOpen(false), HIDE_SIDEBAR_DELAY);
    };
    const handleSidebarEnter = ()=>{
        clearHideTimeout();
        setSidebarOpen(true);
    };
    const handleSidebarLeave = ()=>{
        hideTimeoutRef.current = setTimeout(()=>setSidebarOpen(false), HIDE_SIDEBAR_DELAY);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            const onScroll = {
                "Navbar.useEffect.onScroll": ()=>setScrolled(("TURBOPACK compile-time value", "object") !== "undefined" && window.scrollY > 12)
            }["Navbar.useEffect.onScroll"];
            onScroll();
            window.addEventListener("scroll", onScroll, {
                passive: true
            });
            return ({
                "Navbar.useEffect": ()=>window.removeEventListener("scroll", onScroll)
            })["Navbar.useEffect"];
        }
    }["Navbar.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            return ({
                "Navbar.useEffect": ()=>clearHideTimeout()
            })["Navbar.useEffect"];
        }
    }["Navbar.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].header, {
                initial: {
                    opacity: 0,
                    y: -8
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                transition: {
                    duration: 0.4,
                    ease: [
                        0.25,
                        0.46,
                        0.45,
                        0.94
                    ]
                },
                className: `fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b px-4 transition-[background-color,box-shadow] duration-200 sm:px-6 ${scrolled ? "border-[#e7e5e4] bg-white/85 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-[#1a1a1a] dark:bg-[#0a0a0a]/85 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]" : "border-[#e7e5e4] bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:border-[#1a1a1a] dark:bg-[#0a0a0a] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"}`,
                style: {
                    height: HEADER_HEIGHT
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        "data-button": true,
                        onClick: handleLogoClick,
                        onMouseEnter: user ? handleLogoEnter : undefined,
                        onMouseLeave: user ? handleLogoLeave : undefined,
                        className: "rounded-lg py-2 text-lg font-semibold tracking-tight text-[#ea580c] transition-[color,filter] duration-200 hover:text-[#f97316] hover:drop-shadow-[0_0_12px_rgba(249,115,22,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:text-[#f97316] dark:hover:opacity-90 dark:hover:drop-shadow-[0_0_16px_rgba(249,115,22,0.35)]",
                        children: "PIROFAFE"
                    }, void 0, false, {
                        fileName: "[project]/app/components/Navbar.tsx",
                        lineNumber: 99,
                        columnNumber: 9
                    }, this),
                    user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/perfil",
                        "data-button": true,
                        className: "rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-4 py-2 text-sm font-medium text-[#444] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-[#d6d3d1] hover:bg-[#f5f5f4] hover:text-[#1c1917] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#222] dark:bg-[#111]/80 dark:text-[#a0a0a0] dark:shadow-none dark:hover:border-[#333] dark:hover:bg-[#161616] dark:hover:text-white",
                        children: userName?.trim() ? userName : "Perfil"
                    }, void 0, false, {
                        fileName: "[project]/app/components/Navbar.tsx",
                        lineNumber: 110,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/login",
                        "data-button": true,
                        className: "rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-4 py-2 text-sm font-medium text-[#444] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-[#d6d3d1] hover:bg-[#f5f5f4] hover:text-[#1c1917] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#222] dark:bg-[#111]/80 dark:text-[#a0a0a0] dark:shadow-none dark:hover:border-[#333] dark:hover:bg-[#161616] dark:hover:text-white",
                        children: "Iniciar sessão"
                    }, void 0, false, {
                        fileName: "[project]/app/components/Navbar.tsx",
                        lineNumber: 118,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/Navbar.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: user && sidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].aside, {
                    initial: {
                        opacity: 0,
                        x: -16
                    },
                    animate: {
                        opacity: 1,
                        x: 0
                    },
                    exit: {
                        opacity: 0,
                        x: -16
                    },
                    transition: {
                        duration: 0.2,
                        ease: [
                            0.25,
                            0.46,
                            0.45,
                            0.94
                        ]
                    },
                    onMouseEnter: handleSidebarEnter,
                    onMouseLeave: handleSidebarLeave,
                    className: "fixed bottom-0 left-0 z-40 flex w-[200px] flex-col border-r border-[#e7e5e4] bg-white shadow-[2px_0_12px_-4px_rgba(0,0,0,0.06),1px_0_0_0_rgba(0,0,0,0.03)] backdrop-blur-xl dark:border-[#1a1a1a] dark:bg-[#0a0a0a]/95 dark:shadow-[2px_0_24px_-8px_rgba(0,0,0,0.5)]",
                    style: {
                        top: CONTENT_OFFSET_TOP,
                        minHeight: `calc(100vh - ${CONTENT_OFFSET_TOP}px)`
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-1 flex-col p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                variants: navItem,
                                transition: {
                                    duration: 0.3
                                },
                                className: "mb-3 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-[#78716c] dark:text-[#666]",
                                children: "Navegação"
                            }, void 0, false, {
                                fileName: "[project]/app/components/Navbar.tsx",
                                lineNumber: 141,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                className: "flex flex-col gap-2",
                                children: visibleLinks.map(({ label, href })=>{
                                    const isActive = pathname === href || pathname.startsWith(href + "/");
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        variants: navItem,
                                        transition: {
                                            duration: 0.35
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: href,
                                            className: `relative flex min-h-[48px] items-center rounded-xl px-4 py-3.5 text-base font-medium transition-[border-color,background-color,color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] ${isActive ? "border-l-2 border-[#ea580c] bg-[#fff7ed] text-[#ea580c] shadow-[inset_0_1px_0_0_rgba(0,0,0,0.02)] dark:border-[#f97316] dark:bg-[#161616] dark:text-[#f97316] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),inset_2px_0_12px_-4px_rgba(249,115,22,0.12)]" : "border-l-2 border-transparent text-[#444] hover:border-[#f97316]/35 hover:bg-[#fff7ed]/60 hover:text-[#ea580c] dark:text-white/85 dark:hover:border-[#f97316]/30 dark:hover:bg-[#111] dark:hover:text-[#f97316] dark:hover:shadow-[inset_0_0_0_1px_rgba(249,115,22,0.06)]"}`,
                                            children: label
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/Navbar.tsx",
                                            lineNumber: 153,
                                            columnNumber: 19
                                        }, this)
                                    }, href, false, {
                                        fileName: "[project]/app/components/Navbar.tsx",
                                        lineNumber: 152,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/components/Navbar.tsx",
                                lineNumber: 148,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/Navbar.tsx",
                        lineNumber: 140,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/Navbar.tsx",
                    lineNumber: 130,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/Navbar.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(Navbar, "h9/ic4xthA9PNQ/l5BqtkRpIIFY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"]
    ];
});
_c = Navbar;
var _c;
__turbopack_context__.k.register(_c, "Navbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/apiErrors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Helper para interpretar respostas de erro da API (ex.: 400 com ModelState ou message).
 * Permite mostrar mensagens do backend de forma consistente na UI.
 */ __turbopack_context__.s([
    "parseApiErrorBody",
    ()=>parseApiErrorBody,
    "parseApiErrorResponse",
    ()=>parseApiErrorResponse
]);
function parseApiErrorBody(body) {
    const byKey = {};
    const list = [];
    if (body == null || typeof body !== "object") {
        return {
            message: "Erro ao processar pedido. Tente novamente.",
            byKey: {},
            list: []
        };
    }
    const obj = body;
    // error ou message global
    const globalMsg = (typeof obj.error === "string" ? obj.error : undefined) ?? (typeof obj.message === "string" ? obj.message : undefined) ?? (typeof obj.Message === "string" ? obj.Message : undefined);
    if (globalMsg) list.push(globalMsg);
    // errors (ModelState: { "Cliente.Nome": ["O nome é obrigatório."], ... })
    const errors = obj.errors ?? obj.Errors;
    if (errors != null && typeof errors === "object") {
        const errObj = errors;
        for (const [key, value] of Object.entries(errObj)){
            let msg = "";
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
                msg = value[0];
            } else if (typeof value === "string") {
                msg = value;
            }
            if (msg) {
                byKey[key] = msg;
                if (!list.includes(msg)) list.push(msg);
            }
        }
    }
    const message = list.length > 0 ? list[0] : globalMsg ?? "Erro ao processar pedido. Tente novamente.";
    return {
        message,
        byKey,
        list
    };
}
async function parseApiErrorResponse(response, body) {
    let parsed = body;
    if (parsed === undefined) {
        try {
            parsed = await response.json();
        } catch  {
            parsed = null;
        }
    }
    const result = parseApiErrorBody(parsed);
    if (result.list.length === 0 && response.status >= 400) {
        result.message = result.message || `Erro ${response.status}. Tente novamente.`;
        result.list.push(result.message);
    }
    return result;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/encomendasApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * API Encomendas: lista, criar (create + adicionar-itens + adicionar/remover item + submeter),
 * detalhe, aceitar, rejeitar, preparar, registar-preparacao, concluir.
 * Para o fluxo de criação (draft no servidor) usar credentials: 'include' para manter sessão.
 */ __turbopack_context__.s([
    "fetchAdicionarItens",
    ()=>fetchAdicionarItens,
    "fetchCreate",
    ()=>fetchCreate,
    "fetchEncomendaDetalhe",
    ()=>fetchEncomendaDetalhe,
    "fetchList",
    ()=>fetchList,
    "fetchPreparar",
    ()=>fetchPreparar,
    "fetchRejeitar",
    ()=>fetchRejeitar,
    "postAceitar",
    ()=>postAceitar,
    "postAdicionarItem",
    ()=>postAdicionarItem,
    "postConcluir",
    ()=>postConcluir,
    "postCreate",
    ()=>postCreate,
    "postRegistarPreparacao",
    ()=>postRegistarPreparacao,
    "postRejeitar",
    ()=>postRejeitar,
    "postRemoverItem",
    ()=>postRemoverItem,
    "postSubmeter",
    ()=>postSubmeter,
    "putEncomenda",
    ()=>putEncomenda
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiConfig.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiErrors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiErrors.ts [app-client] (ecmascript)");
;
;
function authHeaders(token) {
    return {
        Authorization: `Bearer ${token}`
    };
}
function jsonHeaders(token) {
    return {
        "Content-Type": "application/json",
        ...authHeaders(token)
    };
}
async function fetchList(token, opts = {}) {
    const { estado = "", pagina = 1, itensPorPagina = 20 } = opts;
    const params = new URLSearchParams();
    if (estado) params.set("estado", estado);
    params.set("pagina", String(pagina));
    params.set("itensPorPagina", String(itensPorPagina));
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}?${params}`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error(`Lista encomendas: ${res.status}`);
    return res.json();
}
async function fetchCreate(token, clienteId) {
    const q = clienteId != null ? `?clienteId=${clienteId}` : "";
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/create${q}`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error(`Create: ${res.status}`);
    return res.json();
}
async function postCreate(token, body) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/create`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify({
            clienteId: Number(body.clienteId)
        }),
        credentials: "include"
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) {
        if (res.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
        if (res.status === 403) throw new Error("Sem permissão para criar encomendas.");
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiErrors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseApiErrorBody"])(data).message);
    }
    return data;
}
async function fetchAdicionarItens(token, clienteId, filtros = {}) {
    const params = new URLSearchParams({
        clienteId: String(clienteId)
    });
    if (filtros.pesquisa) params.set("pesquisa", filtros.pesquisa);
    if (filtros.classificacao) params.set("classificacao", filtros.classificacao);
    if (filtros.grupoCompatibilidade) params.set("grupoCompatibilidade", filtros.grupoCompatibilidade);
    if (filtros.filtroTecnico) params.set("filtroTecnico", filtros.filtroTecnico);
    if (filtros.calibre) params.set("calibre", filtros.calibre);
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/adicionar-itens?${params}`, {
        headers: authHeaders(token),
        credentials: "include"
    });
    if (res.status === 404) throw new Error("CLIENTE_NAO_ENCONTRADO");
    if (!res.ok) throw new Error(`Adicionar-itens: ${res.status}`);
    const data = await res.json();
    const rawCliente = data.cliente ?? data.Cliente;
    const cliente = rawCliente && typeof rawCliente === "object" ? {
        id: rawCliente.id ?? rawCliente.Id,
        nome: rawCliente.nome ?? rawCliente.Nome ?? ""
    } : null;
    return {
        cliente: cliente ? {
            id: Number(cliente.id),
            nome: String(cliente.nome)
        } : {
            id: clienteId,
            nome: ""
        },
        clienteId: data.clienteId ?? data.ClienteId ?? clienteId,
        produtosFiltrados: data.produtosFiltrados ?? data.ProdutosFiltrados ?? [],
        itensRascunho: data.itensRascunho ?? data.ItensRascunho ?? []
    };
}
async function postAdicionarItem(token, params) {
    const q = new URLSearchParams();
    q.set("clienteId", String(params.clienteId));
    q.set("produtoId", String(params.produtoId));
    q.set("quantidade", String(params.quantidade));
    if (params.pesquisa) q.set("pesquisa", params.pesquisa);
    if (params.classificacao) q.set("classificacao", params.classificacao);
    if (params.grupoCompatibilidade) q.set("grupoCompatibilidade", params.grupoCompatibilidade);
    if (params.filtroTecnico) q.set("filtroTecnico", params.filtroTecnico);
    if (params.calibre) q.set("calibre", params.calibre);
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/adicionar-item?${q}`, {
        method: "POST",
        headers: authHeaders(token),
        credentials: "include"
    });
    if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err.error ?? `Adicionar-item: ${res.status}`);
    }
    return res.json();
}
async function postRemoverItem(token, params) {
    const q = new URLSearchParams();
    q.set("clienteId", String(params.clienteId));
    q.set("produtoId", String(params.produtoId));
    if (params.pesquisa) q.set("pesquisa", params.pesquisa);
    if (params.classificacao) q.set("classificacao", params.classificacao);
    if (params.grupoCompatibilidade) q.set("grupoCompatibilidade", params.grupoCompatibilidade);
    if (params.filtroTecnico) q.set("filtroTecnico", params.filtroTecnico);
    if (params.calibre) q.set("calibre", params.calibre);
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/remover-item?${q}`, {
        method: "POST",
        headers: authHeaders(token),
        credentials: "include"
    });
    if (!res.ok) throw new Error(`Remover-item: ${res.status}`);
    return res.json();
}
async function postSubmeter(token, body) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/submeter`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify({
            clienteId: body.clienteId,
            dataEntrega: body.dataEntrega || null,
            observacoes: body.observacoes || null
        }),
        credentials: "include"
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) {
        const msg = data.error ?? data.Error;
        if (msg) throw new Error(String(msg));
        if (res.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
        if (res.status === 403) throw new Error("Sem permissão para registar encomendas.");
        throw new Error(`Erro ao registar encomenda (${res.status}).`);
    }
    return data;
}
async function postAceitar(token, id) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}/aceitar`, {
        method: "POST",
        headers: authHeaders(token)
    });
    const d = await res.json().catch(()=>({}));
    if (!res.ok) {
        const msg = d.error ?? d.Error;
        if (msg) throw new Error(String(msg));
        if (res.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
        if (res.status === 403) throw new Error("Sem permissão para aceitar encomendas (apenas Admin).");
        if (res.status === 404) throw new Error("Encomenda não encontrada.");
        throw new Error(`Erro ao aceitar (${res.status}).`);
    }
    return d;
}
async function fetchRejeitar(token, id) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}/rejeitar`, {
        headers: authHeaders(token)
    });
    if (!res.ok) {
        const d = await res.json().catch(()=>({}));
        throw new Error(d.error ?? `Rejeitar GET: ${res.status}`);
    }
    return res.json();
}
async function postRejeitar(token, id, body) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}/rejeitar`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify(body ?? {})
    });
    if (!res.ok) {
        const d = await res.json().catch(()=>({}));
        throw new Error(d.error ?? `Rejeitar: ${res.status}`);
    }
    return res.json();
}
async function fetchPreparar(token, id) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}/preparar`, {
        headers: authHeaders(token)
    });
    if (!res.ok) {
        const d = await res.json().catch(()=>({}));
        throw new Error(d.error ?? `Preparar: ${res.status}`);
    }
    return res.json();
}
async function postRegistarPreparacao(token, id, retiradas) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}/registar-preparacao`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify(retiradas)
    });
    if (!res.ok) {
        const d = await res.json().catch(()=>({}));
        throw new Error(d.error ?? `Registar preparação: ${res.status}`);
    }
    return res.json();
}
async function postConcluir(token, id) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}/concluir`, {
        method: "POST",
        headers: authHeaders(token)
    });
    if (!res.ok) {
        const d = await res.json().catch(()=>({}));
        throw new Error(d.error ?? `Concluir: ${res.status}`);
    }
    return res.json();
}
async function fetchEncomendaDetalhe(token, id) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}`, {
        headers: authHeaders(token)
    });
    if (res.status === 404) throw new Error("NOT_FOUND");
    if (!res.ok) throw new Error(`Detalhe: ${res.status}`);
    return res.json();
}
async function putEncomenda(token, id, body) {
    const payload = {
        dataEntrega: body.dataEntrega?.trim() ? body.dataEntrega.trim().slice(0, 10) : null,
        observacoes: body.observacoes?.trim()?.slice(0, 2000) ?? null,
        itens: body.itens.map((i)=>({
                produtoId: i.produtoId,
                quantidade: Number(i.quantidade)
            }))
    };
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}`, {
        method: "PUT",
        headers: jsonHeaders(token),
        body: JSON.stringify(payload)
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(data.error ?? `Atualizar: ${res.status}`);
    return data;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/servicosApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteServico",
    ()=>deleteServico,
    "documentoUrl",
    ()=>documentoUrl,
    "downloadComToken",
    ()=>downloadComToken,
    "fetchServicoById",
    ()=>fetchServicoById,
    "fetchServicos",
    ()=>fetchServicos,
    "fetchServicosCreate",
    ()=>fetchServicosCreate,
    "fetchServicosDelete",
    ()=>fetchServicosDelete,
    "fetchServicosEdit",
    ()=>fetchServicosEdit,
    "fetchUploadLicenca",
    ()=>fetchUploadLicenca,
    "licencaFicheiroUrl",
    ()=>licencaFicheiroUrl,
    "postServico",
    ()=>postServico,
    "postUploadLicenca",
    ()=>postUploadLicenca,
    "putDistanciaSeguranca",
    ()=>putDistanciaSeguranca,
    "putServico",
    ()=>putServico
]);
/**
 * API Serviços: lista, create, edit, delete, detalhe, documentos, licenças, distâncias de segurança.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiConfig.ts [app-client] (ecmascript)");
;
function authHeaders(token) {
    return {
        Authorization: `Bearer ${token}`
    };
}
async function fetchServicos(token, filters, pagina, itensPorPagina) {
    const params = new URLSearchParams();
    if (filters?.clienteId != null && filters.clienteId !== "") params.set("clienteId", String(filters.clienteId));
    if (filters?.dataDesde) params.set("dataDesde", filters.dataDesde);
    if (filters?.dataAte) params.set("dataAte", filters.dataAte);
    params.set("pagina", String(pagina));
    params.set("itensPorPagina", String(itensPorPagina));
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}?${params}`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
    return res.json();
}
async function fetchServicosCreate(token, encomendaId) {
    const q = encomendaId != null ? `?encomendaId=${encomendaId}` : "";
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/create${q}`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
    const data = await res.json();
    return {
        encomendas: (data.encomendas ?? []).map((e)=>({
                id: e.id ?? e.Id ?? 0,
                texto: e.texto ?? e.Texto ?? ""
            })),
        responsaveisTecnicos: data.responsaveisTecnicos ?? data.ResponsaveisTecnicos ?? [],
        funcionariosEquipa: data.funcionariosEquipa ?? data.FuncionariosEquipa ?? [],
        tiposAcesso: data.tiposAcesso ?? data.TiposAcesso ?? [
            "Público",
            "Privado"
        ],
        servico: data.servico ?? data.Servico ?? {
            dataServico: new Date().toISOString().slice(0, 10),
            encomendaId: 0
        }
    };
}
async function postServico(token, formData) {
    const res = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos"), {
        method: "POST",
        headers: authHeaders(token),
        body: formData
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : `Erro ${res.status}`);
    return data;
}
async function fetchServicoById(token, id) {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}`, {
        headers: authHeaders(token)
    });
    if (!res.ok) {
        if (res.status === 404) throw new Error("NOT_FOUND");
        throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
    }
    return res.json();
}
async function fetchServicosEdit(token, id) {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}/edit`, {
        headers: authHeaders(token)
    });
    if (!res.ok) {
        if (res.status === 404) throw new Error("NOT_FOUND");
        throw new Error(`Erro ${res.status}`);
    }
    const data = await res.json();
    return {
        servico: data.servico ?? data.Servico ?? {},
        encomendas: (data.encomendas ?? []).map((e)=>({
                id: e.id ?? e.Id ?? 0,
                texto: e.texto ?? e.Texto ?? ""
            })),
        responsaveisTecnicos: data.responsaveisTecnicos ?? data.ResponsaveisTecnicos ?? [],
        funcionariosEquipa: data.funcionariosEquipa ?? data.FuncionariosEquipa ?? [],
        tiposAcesso: data.tiposAcesso ?? data.TiposAcesso ?? [
            "Público",
            "Privado"
        ],
        equipaIds: data.equipaIds ?? data.EquipaIds ?? []
    };
}
async function putServico(token, id, formData) {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}`, {
        method: "PUT",
        headers: authHeaders(token),
        body: formData
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : `Erro ${res.status}`);
    return data;
}
async function fetchServicosDelete(token, id) {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}/delete`, {
        headers: authHeaders(token)
    });
    if (!res.ok) {
        if (res.status === 404) throw new Error("NOT_FOUND");
        throw new Error(`Erro ${res.status}`);
    }
    return res.json();
}
async function deleteServico(token, id) {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}`, {
        method: "DELETE",
        headers: authHeaders(token)
    });
    if (!res.ok && res.status !== 204) throw new Error(`Erro ${res.status}`);
}
function documentoUrl(id, extraId) {
    const n = typeof id === "string" ? id : String(id);
    const e = typeof extraId === "string" ? extraId : String(extraId);
    return `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${n}/documentos/${e}`;
}
function licencaFicheiroUrl(id, licencaId) {
    const n = typeof id === "string" ? id : String(id);
    const l = typeof licencaId === "string" ? licencaId : String(licencaId);
    return `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${n}/licenca/${l}/ficheiro`;
}
async function downloadComToken(token, url) {
    const res = await fetch(url, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
    setTimeout(()=>URL.revokeObjectURL(blobUrl), 60000);
}
async function fetchUploadLicenca(token, id, tipo, licencaId, origem) {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
    const params = new URLSearchParams({
        tipo: String(tipo)
    });
    if (licencaId != null) params.set("licencaId", String(licencaId));
    if (origem !== undefined) params.set("origem", String(origem));
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}/upload-licenca?${params}`, {
        headers: authHeaders(token)
    });
    if (!res.ok) {
        if (res.status === 404) throw new Error("NOT_FOUND");
        throw new Error(`Erro ${res.status}`);
    }
    const data = await res.json();
    return {
        servicoId: data.servicoId ?? data.ServicoId ?? numId,
        tipoLicenca: data.tipoLicenca ?? data.TipoLicenca ?? tipo,
        tipoNome: data.tipoNome ?? data.TipoNome ?? "",
        origemRegisto: data.origemRegisto ?? data.OrigemRegisto,
        licenca: data.licenca ?? data.Licenca ?? {}
    };
}
async function postUploadLicenca(token, id, tipo, formData, licencaId, origem) {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (Number.isNaN(numId)) throw new Error("Id de serviço inválido");
    const params = new URLSearchParams({
        tipo: String(tipo)
    });
    if (licencaId != null) params.set("licencaId", String(licencaId));
    if (origem !== undefined) params.set("origem", String(origem));
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}/upload-licenca?${params}`, {
        method: "POST",
        headers: authHeaders(token),
        body: formData
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : `Erro ${res.status}`);
    return data;
}
async function putDistanciaSeguranca(token, id, distanciaId, distanciaMedida_m) {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    const dId = typeof distanciaId === "string" ? parseInt(distanciaId, 10) : distanciaId;
    if (Number.isNaN(numId) || Number.isNaN(dId)) throw new Error("Id inválido");
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}/distancia-seguranca/${dId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(token)
        },
        body: JSON.stringify({
            DistanciaMedida_m: distanciaMedida_m
        })
    });
    if (!res.ok) {
        if (res.status === 404) throw new Error("NOT_FOUND");
        throw new Error(`Erro ${res.status}`);
    }
    return res.json();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/servicos.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Módulo Serviços (frontend): operações no terreno ligadas a uma encomenda concluída (1:1).
 * Usa apenas a API do backend (api/servicos).
 */ __turbopack_context__.s([
    "ConstantesDistanciaSeguranca",
    ()=>ConstantesDistanciaSeguranca,
    "ConstantesServicoLicenca",
    ()=>ConstantesServicoLicenca,
    "ORIGEM_LICENCA_SERVICO",
    ()=>ORIGEM_LICENCA_SERVICO,
    "PUBLICO_PRIVADO",
    ()=>PUBLICO_PRIVADO,
    "TIPOS_LICENCA_SERVICO",
    ()=>TIPOS_LICENCA_SERVICO,
    "TIPOS_REFERENCIA_DISTANCIA",
    ()=>TIPOS_REFERENCIA_DISTANCIA,
    "fetchServicoDetalheFromApi",
    ()=>fetchServicoDetalheFromApi,
    "fetchServicosFromApi",
    ()=>fetchServicosFromApi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicosApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/servicosApi.ts [app-client] (ecmascript)");
;
const TIPOS_LICENCA_SERVICO = [
    "LICENCA_PSP",
    "LER",
    "PARECER_BOMBEIROS",
    "SEGURO_RC",
    "PARECER_CAMARA",
    "LICENCA_RECINTOS",
    "AUTORIZACAO_IP",
    "OUTRO"
];
const TIPOS_REFERENCIA_DISTANCIA = [
    "HABITACAO",
    "ESTRADA_NACIONAL",
    "AUTOESTRADA",
    "LINHA_ALTA_TENSAO",
    "FLORESTA",
    "OUTRO"
];
const PUBLICO_PRIVADO = [
    "Público",
    "Privado"
];
const ConstantesServicoLicenca = {
    Nome (tipo) {
        const nomes = {
            LICENCA_PSP: "Licença PSP de Espetáculo Pirotécnico",
            LER: "Licença Especial de Ruído (LER)",
            PARECER_BOMBEIROS: "Parecer dos Bombeiros / Proteção Civil",
            SEGURO_RC: "Seguro de Responsabilidade Civil do Evento",
            PARECER_CAMARA: "Parecer / Autorização da Câmara Municipal",
            LICENCA_RECINTOS: "Licença de Recintos Improvisados (IGAC)",
            AUTORIZACAO_IP: "Autorização de Infraestruturas de Portugal",
            OUTRO: "Outro documento específico"
        };
        return nomes[tipo] ?? tipo;
    },
    TiposObrigatoriosPara (publicoPrivado) {
        if (publicoPrivado === "Público") return [
            "LICENCA_PSP",
            "LER",
            "PARECER_BOMBEIROS",
            "SEGURO_RC",
            "PARECER_CAMARA"
        ];
        if (publicoPrivado === "Privado") return [
            "LICENCA_PSP",
            "SEGURO_RC"
        ];
        return [];
    },
    TodosTiposPredefinidos () {
        return TIPOS_LICENCA_SERVICO.filter((t)=>t !== "OUTRO");
    }
};
const ConstantesDistanciaSeguranca = {
    HabitacaoMinimaMetros (divisaoDominante) {
        if (!divisaoDominante) return 50;
        if (divisaoDominante === "1.1G") return 300;
        if (divisaoDominante === "1.3G") return 100;
        return 50;
    },
    EstradaNacional: 25,
    Autoestrada: 100,
    LinhaAltaTensao: 50,
    Floresta: 100,
    Nome (tipo) {
        const nomes = {
            HABITACAO: "Habitações / edifícios",
            ESTRADA_NACIONAL: "Estradas nacionais",
            AUTOESTRADA: "Autoestradas / IC / IP",
            LINHA_ALTA_TENSAO: "Linhas de alta tensão",
            FLORESTA: "Florestas / matas",
            OUTRO: "Outro"
        };
        return nomes[tipo] ?? tipo;
    }
};
const ORIGEM_LICENCA_SERVICO = {
    pedidoGerado: 0,
    autorizacaoDefinitiva: 1
};
// --- API ---
function mapId(v) {
    if (v === null || v === undefined) return "";
    return String(v);
}
/** Mapeia um item da lista da API para o tipo do frontend (id como string). */ function mapApiServicoToList(s) {
    const id = mapId(s.id ?? s.Id);
    const cliente = s.cliente ?? s.Cliente;
    const encomenda = s.encomenda ?? s.Encomenda;
    const resp = s.responsavelTecnico ?? s.ResponsavelTecnico;
    return {
        id,
        encomendaId: mapId(s.encomendaId ?? s.EncomendaId),
        clienteId: mapId(s.clienteId ?? s.ClienteId),
        dataServico: s.dataServico ?? s.DataServico,
        local: s.local ?? s.Local,
        moradaCompleta: s.moradaCompleta ?? s.MoradaCompleta,
        distrito: s.distrito ?? s.Distrito,
        cidade: s.cidade ?? s.Cidade,
        municipio: s.municipio ?? s.Municipio,
        coordenadasLat: (s.coordenadasLat ?? s.CoordenadasLat) != null ? Number(s.coordenadasLat ?? s.CoordenadasLat) : undefined,
        coordenadasLng: (s.coordenadasLng ?? s.CoordenadasLng) != null ? Number(s.coordenadasLng ?? s.CoordenadasLng) : undefined,
        raioPublico: (s.raioPublico ?? s.RaioPublico) != null ? Number(s.raioPublico ?? s.RaioPublico) : undefined,
        publicoPrivado: s.publicoPrivado ?? s.PublicoPrivado,
        responsavelTecnicoId: resp != null ? mapId(resp.id ?? resp.Id) : undefined,
        observacoes: s.observacoes ?? s.Observacoes,
        cliente: cliente ? {
            id: mapId(cliente.id ?? cliente.Id),
            nome: String(cliente.nome ?? cliente.Nome ?? "")
        } : null,
        encomenda: encomenda ? {
            id: mapId(encomenda.id ?? encomenda.Id),
            estado: encomenda.estado ?? encomenda.Estado
        } : null,
        responsavelTecnico: resp ? {
            id: mapId(resp.id ?? resp.Id),
            nomeCompleto: String(resp.nomeCompleto ?? resp.NomeCompleto ?? "")
        } : null
    };
}
async function fetchServicosFromApi(token, filters, pagina, itensPorPagina) {
    const f = {};
    if (filters?.clienteId) f.clienteId = filters.clienteId;
    if (filters?.dataDesde) f.dataDesde = filters.dataDesde;
    if (filters?.dataAte) f.dataAte = filters.dataAte;
    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicosApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchServicos"](token, f, pagina, itensPorPagina);
    const lista = (res.lista ?? []).map((s)=>mapApiServicoToList(s));
    return {
        lista,
        total: res.totalRegistos ?? 0,
        clientes: res.clientes ?? []
    };
}
async function fetchServicoDetalheFromApi(token, id) {
    try {
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicosApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchServicoById"](token, id);
        return mapApiDetalheToServicoDetalhe(data);
    } catch (e) {
        if (e.message === "NOT_FOUND") return null;
        throw e;
    }
}
function mapApiDetalheToServicoDetalhe(data) {
    const s = data.servico;
    const id = mapId(s.id ?? s.Id);
    const cliente = s.cliente ?? s.Cliente;
    const encomenda = s.encomenda ?? s.Encomenda;
    const resp = s.responsavelTecnico ?? s.ResponsavelTecnico;
    const equipa = s.equipa ?? s.Equipa;
    const documentosExtras = s.documentosExtras ?? s.DocumentosExtras;
    const licencas = s.licencas ?? s.Licencas;
    const encomendaIdStr = mapId(s.encomendaId ?? s.EncomendaId);
    const itensEncomenda = (data.itensEncomenda ?? []).map((i)=>{
        const prod = i.produto ?? i.Produto;
        const g = (o, k)=>o[k] ?? o[k.charAt(0).toUpperCase() + k.slice(1)];
        const produtoFromApi = prod ? {
            id: mapId(prod.id ?? prod.Id),
            nome: String(g(prod, "nome") ?? g(prod, "Nome") ?? ""),
            nemPorUnidade: Number(g(prod, "nemPorUnidade") ?? g(prod, "NemPorUnidade") ?? 0),
            familiaRisco: g(prod, "familiaRisco") ?? g(prod, "FamiliaRisco")
        } : null;
        return {
            id: mapId(i.id ?? i.Id),
            encomendaId: mapId(i.encomendaId ?? i.EncomendaId) || encomendaIdStr,
            produtoId: mapId(i.produtoId ?? i.ProdutoId),
            quantidadePedida: Number(i.quantidadePedida ?? i.QuantidadePedida ?? 0),
            produto: produtoFromApi
        };
    });
    const mapVmLic = (raw)=>{
        if (!raw || typeof raw !== "object") return undefined;
        const x = raw;
        return {
            id: mapId(x.id ?? x.Id),
            servicoId: mapId(x.servicoId ?? x.ServicoId),
            tipoLicenca: x.tipoLicenca ?? x.TipoLicenca,
            origemRegisto: (x.origemRegisto ?? x.OrigemRegisto) != null ? Number(x.origemRegisto ?? x.OrigemRegisto) : undefined,
            nomePersonalizado: x.nomePersonalizado ?? x.NomePersonalizado,
            numeroDocumento: x.numeroDocumento ?? x.NumeroDocumento,
            dataEmissao: x.dataEmissao ?? x.DataEmissao,
            dataValidade: x.dataValidade ?? x.DataValidade,
            observacoes: x.observacoes ?? x.Observacoes
        };
    };
    const licencasEvento = (data.licencasEvento ?? []).map((l)=>{
        const ped = mapVmLic(l.licencaPedido ?? l.LicencaPedido);
        const def = mapVmLic(l.licencaDefinitiva ?? l.LicencaDefinitiva);
        const estadoPedido = Number(l.estadoPedido ?? l.EstadoPedido ?? 0);
        const estadoDefinitiva = Number(l.estadoDefinitiva ?? l.EstadoDefinitiva ?? 0);
        const estadoLegacy = Number(l.estado ?? l.Estado ?? 0);
        const estado = l.estadoPedido != null || l.EstadoPedido != null || l.estadoDefinitiva != null || l.EstadoDefinitiva != null ? Math.max(estadoPedido, estadoDefinitiva) : estadoLegacy;
        return {
            tipo: l.tipo ?? l.Tipo,
            obrigatorio: Boolean(l.obrigatorio ?? l.Obrigatorio),
            estado,
            estadoPedido: l.estadoPedido != null || l.EstadoPedido != null ? estadoPedido : estadoLegacy,
            estadoDefinitiva: l.estadoDefinitiva != null || l.EstadoDefinitiva != null ? estadoDefinitiva : estadoLegacy,
            licencaPedido: ped,
            licencaDefinitiva: def,
            licenca: def ?? ped ?? mapVmLic(l.licenca ?? l.Licenca),
            nomeExibicao: String(l.nomeExibicao ?? l.NomeExibicao ?? "")
        };
    });
    return {
        ...mapApiServicoToList(data.servico),
        id,
        cliente: cliente ? {
            id: mapId(cliente.id ?? cliente.Id),
            nome: String(cliente.nome ?? cliente.Nome ?? "")
        } : null,
        encomenda: encomenda ? {
            id: mapId(encomenda.id ?? encomenda.Id),
            estado: encomenda.estado ?? encomenda.Estado
        } : null,
        responsavelTecnico: resp ? {
            id: mapId(resp.id ?? resp.Id),
            nomeCompleto: String(resp.nomeCompleto ?? resp.NomeCompleto ?? "")
        } : null,
        // API GET detalhe devolve Equipa como lista de FuncionarioResponseDto (id, nomeCompleto no topo),
        // não como { funcionarioId, funcionario }.
        equipa: (equipa ?? []).map((e)=>{
            const nested = e.funcionario ?? e.Funcionario;
            const src = nested ?? e;
            const fid = mapId(e.funcionarioId ?? e.FuncionarioId) || mapId(src.id ?? src.Id);
            const nomeCompleto = String((nested ? nested.nomeCompleto ?? nested.NomeCompleto : e.nomeCompleto ?? e.NomeCompleto) ?? "");
            return {
                servicoId: id,
                funcionarioId: fid,
                funcionario: {
                    id: fid,
                    nomeCompleto
                }
            };
        }),
        documentosExtras: (documentosExtras ?? []).map((d)=>({
                id: mapId(d.id ?? d.Id),
                servicoId: id,
                nome: String(d.nome ?? d.Nome ?? ""),
                caminho: d.caminho ?? d.Caminho
            })),
        licencas: (licencas ?? []).map((l)=>({
                id: mapId(l.id ?? l.Id),
                servicoId: id,
                tipoLicenca: l.tipoLicenca ?? l.TipoLicenca,
                origemRegisto: (l.origemRegisto ?? l.OrigemRegisto) != null ? Number(l.origemRegisto ?? l.OrigemRegisto) : ORIGEM_LICENCA_SERVICO.autorizacaoDefinitiva,
                numeroDocumento: l.numeroDocumento ?? l.NumeroDocumento,
                dataEmissao: l.dataEmissao ?? l.DataEmissao,
                dataValidade: l.dataValidade ?? l.DataValidade,
                ficheiroPath: l.ficheiroPath ?? l.FicheiroPath,
                nomePersonalizado: l.nomePersonalizado ?? l.NomePersonalizado,
                observacoes: l.observacoes ?? l.Observacoes
            })),
        distanciasSeguranca: (data.distanciasSeguranca ?? []).map((d)=>({
                id: mapId(d.id ?? d.Id),
                servicoId: id,
                tipoReferencia: d.tipoReferencia ?? d.TipoReferencia,
                descricaoReferencia: String(d.descricaoReferencia ?? d.DescricaoReferencia ?? ""),
                distanciaMinima_m: Number(d.distanciaMinima_m ?? d.DistanciaMinima_m ?? 0),
                distanciaMedida_m: (d.distanciaMedida_m ?? d.DistanciaMedida_m) != null ? Number(d.distanciaMedida_m ?? d.DistanciaMedida_m) : undefined
            })),
        resumoMaterial: data.resumoMaterial ? {
            encomendaId: mapId(data.resumoMaterial.encomendaId ?? data.resumoMaterial.EncomendaId),
            numeroProdutos: Number(data.resumoMaterial.numeroProdutos ?? data.resumoMaterial.NumeroProdutos ?? 0),
            totalUnidades: Number(data.resumoMaterial.totalUnidades ?? data.resumoMaterial.TotalUnidades ?? 0),
            mleTotalKg: Number(data.resumoMaterial.mleTotalKg ?? data.resumoMaterial.MleTotalKg ?? 0),
            divisaoDominante: data.resumoMaterial.divisaoDominante ?? data.resumoMaterial.DivisaoDominante,
            corDivisaoDominante: data.resumoMaterial.corDivisaoDominante ?? data.resumoMaterial.CorDivisaoDominante,
            categoriasPresentes: String(data.resumoMaterial.categoriasPresentes ?? data.resumoMaterial.CategoriasPresentes ?? ""),
            temItens: Boolean(data.resumoMaterial.temItens ?? data.resumoMaterial.TemItens)
        } : null,
        itensEncomenda,
        licencasEvento,
        licencasObrigatoriasTotal: data.licencasObrigatoriasTotal ?? 0,
        licencasObrigatoriasEntregues: data.licencasObrigatoriasEntregues ?? 0
    };
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/encomendas.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Tipos e helpers para a área Encomendas.
 * Dados vêm apenas da API (encomendasApi). Sem localStorage/sessionStorage.
 */ __turbopack_context__.s([
    "ESTADOS_COM_RESERVA",
    ()=>ESTADOS_COM_RESERVA,
    "ESTADOS_ENCOMENDA",
    ()=>ESTADOS_ENCOMENDA,
    "TODOS_ESTADOS",
    ()=>TODOS_ESTADOS,
    "corEstado",
    ()=>corEstado,
    "podeEditarEncomenda",
    ()=>podeEditarEncomenda
]);
const ESTADOS_ENCOMENDA = [
    "Pendente",
    "Aceite",
    "Rejeitada",
    "Em preparação",
    "Concluída"
];
const ESTADOS_COM_RESERVA = [
    "Pendente",
    "Aceite"
];
const TODOS_ESTADOS = [
    ...ESTADOS_ENCOMENDA
];
function podeEditarEncomenda(encomenda, currentUserId, isAdmin) {
    if (isAdmin) return true;
    if (!currentUserId) return false;
    return encomenda.criadoPorUserId === currentUserId;
}
function corEstado(estado) {
    switch(estado){
        case "Pendente":
            return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
        case "Aceite":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
        case "Rejeitada":
            return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
        case "Em preparação":
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
        case "Concluída":
            return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/hooks/useLiveDateTime.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useLiveDateTime",
    ()=>useLiveDateTime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useLiveDateTime() {
    _s();
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "useLiveDateTime.useState": ()=>new Date()
    }["useLiveDateTime.useState"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useLiveDateTime.useEffect": ()=>{
            const t = setInterval({
                "useLiveDateTime.useEffect.t": ()=>setNow(new Date())
            }["useLiveDateTime.useEffect.t"], 1000);
            return ({
                "useLiveDateTime.useEffect": ()=>clearInterval(t)
            })["useLiveDateTime.useEffect"];
        }
    }["useLiveDateTime.useEffect"], []);
    return now;
}
_s(useLiveDateTime, "aIQ63u2pSAvMwtVQMX73MhWGFJ4=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/DashboardComercial.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardComercial
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$encomendasApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/encomendasApi.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicos$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/lib/servicos.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$encomendas$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/encomendas.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useLiveDateTime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/hooks/useLiveDateTime.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function mapApiToEncomendaLinha(e) {
    const id = e.id ?? e.Id;
    const clienteId = e.clienteId ?? e.ClienteId;
    const estadoVal = e.estado ?? e.Estado ?? "Pendente";
    const dataCriacao = e.dataCriacao ?? e.DataCriacao;
    const dataEntrega = e.dataEntrega ?? e.DataEntrega;
    const cliente = e.cliente ?? e.Cliente;
    return {
        id: String(id ?? ""),
        clienteId: String(clienteId ?? ""),
        estado: String(estadoVal),
        dataCriacao: typeof dataCriacao === "string" ? dataCriacao : new Date().toISOString(),
        dataEntrega: dataEntrega ? typeof dataEntrega === "string" ? dataEntrega : "" : undefined,
        clienteNome: cliente?.nome
    };
}
const hoje = new Date().toISOString().slice(0, 10);
function DashboardComercial({ token, totalClientes }) {
    _s();
    const liveNow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useLiveDateTime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLiveDateTime"])();
    const { data: encomendasData, isLoading: loadingEncomendas, dataUpdatedAt: encomendasUpdatedAt } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "encomendas-dashboard",
            "all"
        ],
        queryFn: {
            "DashboardComercial.useQuery": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$encomendasApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchList"])(token, {
                    estado: "",
                    pagina: 1,
                    itensPorPagina: 10
                })
        }["DashboardComercial.useQuery"],
        enabled: !!token,
        staleTime: 60 * 1000
    });
    const { data: servicosData, isLoading: loadingServicos, dataUpdatedAt: servicosUpdatedAt } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "servicos-dashboard",
            "proximos"
        ],
        queryFn: {
            "DashboardComercial.useQuery": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicos$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fetchServicosFromApi"])(token, undefined, 1, 25)
        }["DashboardComercial.useQuery"],
        enabled: !!token,
        staleTime: 60 * 1000
    });
    const totaisPorEstado = encomendasData?.totaisPorEstado ?? {};
    const pendentes = Number(totaisPorEstado?.Pendente ?? 0);
    const aceites = Number(totaisPorEstado?.Aceite ?? 0);
    const itemsEncomendas = encomendasData?.items ?? [];
    const ultimasEncomendas = itemsEncomendas.slice(0, 5).map(mapApiToEncomendaLinha);
    const listaServicos = servicosData?.lista ?? [];
    const proximosServicos = listaServicos.filter((s)=>s.dataServico >= hoje).sort((a, b)=>String(a.dataServico).localeCompare(String(b.dataServico))).slice(0, 5);
    const totalServicosAgendados = listaServicos.filter((s)=>s.dataServico >= hoje).length;
    const pendentesRequerAtencao = pendentes > 0;
    const lastUpdated = Math.max(encomendasUpdatedAt ?? 0, servicosUpdatedAt ?? 0);
    const lastUpdatedText = lastUpdated > 0 ? liveNow.getTime() - lastUpdated < 120_000 ? "Atualizado agora" : `Atualizado às ${new Date(lastUpdated).toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit"
    })}` : null;
    const cards = [
        {
            title: "Encomendas pendentes",
            value: pendentes,
            href: "/encomendas?estado=Pendente",
            accent: "orange",
            description: "A aguardar decisão"
        },
        {
            title: "Encomendas aceites",
            value: aceites,
            href: "/encomendas?estado=Aceite",
            accent: "blue",
            description: "Em curso"
        },
        {
            title: "Serviços agendados",
            value: totalServicosAgendados,
            href: "/servicos",
            accent: "emerald",
            description: "Próximos no terreno"
        },
        {
            title: "Total de clientes",
            value: totalClientes,
            href: "/clientes",
            accent: "slate",
            description: "Contexto geral"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "dashboard-comercial",
        className: "border-t border-[#e7e5e4] bg-[#fafaf9] px-6 py-24 dark:border-[#1a1a1a] dark:bg-[#050505] sm:px-8 sm:py-32",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-6xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs font-semibold uppercase tracking-[0.2em] text-[#ea580c] dark:text-[#f97316]",
                    children: "Área Comercial"
                }, void 0, false, {
                    fileName: "[project]/app/components/DashboardComercial.tsx",
                    lineNumber: 126,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-2 h-px w-12 rounded-full bg-[#ea580c]/40 dark:bg-[#f97316]/50",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/app/components/DashboardComercial.tsx",
                    lineNumber: 129,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "font-heading mt-3 text-2xl font-bold tracking-tight text-[#1c1917] sm:text-3xl dark:text-white",
                    children: "O seu painel"
                }, void 0, false, {
                    fileName: "[project]/app/components/DashboardComercial.tsx",
                    lineNumber: 130,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-3 text-[#57534e] dark:text-[#888]",
                    children: "Encomendas pendentes, em curso e próximos serviços."
                }, void 0, false, {
                    fileName: "[project]/app/components/DashboardComercial.tsx",
                    lineNumber: 133,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-8 flex flex-wrap items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/encomendas/novo",
                            className: "rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm font-medium text-[#1c1917] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-[#f97316]/40 hover:bg-[#fffbf7] hover:text-[#ea580c] dark:border-[#222] dark:bg-[#0d0d0d] dark:text-white dark:hover:border-[#f97316]/30 dark:hover:bg-[#0d0d0d]",
                            children: "Nova encomenda"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardComercial.tsx",
                            lineNumber: 139,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/encomendas?estado=Pendente",
                            className: "rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm font-medium text-[#57534e] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-[#e7e5e4] hover:bg-[#fafaf9] hover:text-[#1c1917] dark:border-[#222] dark:bg-[#0d0d0d] dark:text-[#a3a3a3] dark:hover:bg-[#111] dark:hover:text-white",
                            children: "Pendentes"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardComercial.tsx",
                            lineNumber: 145,
                            columnNumber: 11
                        }, this),
                        lastUpdatedText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "ml-auto text-xs text-[#a8a29e] dark:text-[#555]",
                            children: lastUpdatedText
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardComercial.tsx",
                            lineNumber: 152,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/DashboardComercial.tsx",
                    lineNumber: 138,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6",
                    children: loadingEncomendas ? cards.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col rounded-2xl border border-[#e7e5e4] bg-white p-6 dark:border-[#222] dark:bg-[#0d0d0d]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "h-9 w-12 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 166,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "mt-2 h-4 w-24 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 167,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "mt-1 h-3 w-20 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 168,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, card.title, true, {
                            fileName: "[project]/app/components/DashboardComercial.tsx",
                            lineNumber: 162,
                            columnNumber: 15
                        }, this)) : cards.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: card.href,
                            className: `group relative flex flex-col rounded-2xl border bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_24px_-8px_rgba(249,115,22,0.2)] dark:bg-[#0d0d0d] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)] ${card.title === "Encomendas pendentes" && pendentesRequerAtencao ? "border-[#f97316]/40 dark:border-[#f97316]/30 dark:hover:border-[#f97316]/50" : "border-[#e7e5e4] hover:border-[#f97316]/30 dark:border-[#222] dark:hover:border-[#f97316]/25"}`,
                            children: [
                                card.title === "Encomendas pendentes" && pendentesRequerAtencao && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "absolute right-4 top-4 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
                                    children: "Requer atenção"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 183,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-3xl font-bold tracking-tight text-[#1c1917] dark:text-white",
                                    children: card.value
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 187,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "mt-1 text-sm font-semibold text-[#1c1917] dark:text-white",
                                    children: card.title
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 190,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "mt-0.5 text-xs text-[#78716c] dark:text-[#888]",
                                    children: card.description
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 193,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, card.title, true, {
                            fileName: "[project]/app/components/DashboardComercial.tsx",
                            lineNumber: 173,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/app/components/DashboardComercial.tsx",
                    lineNumber: 159,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-14 grid gap-8 sm:grid-cols-2 lg:gap-10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-[#222] dark:bg-[#0d0d0d]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-b border-[#e7e5e4] px-6 py-4 dark:border-[#222]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-[#1c1917] dark:text-white",
                                            children: "Últimas encomendas"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/DashboardComercial.tsx",
                                            lineNumber: 206,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-[#78716c] dark:text-[#888]",
                                            children: "Com estado atual"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/DashboardComercial.tsx",
                                            lineNumber: 209,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 205,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "divide-y divide-[#e7e5e4] dark:divide-[#222]",
                                    children: loadingEncomendas ? [
                                        1,
                                        2,
                                        3,
                                        4,
                                        5
                                    ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "flex items-center gap-3 px-6 py-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "h-4 w-12 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                                    lineNumber: 217,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "h-4 flex-1 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                                    lineNumber: 218,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "h-5 w-16 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                                    lineNumber: 219,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/app/components/DashboardComercial.tsx",
                                            lineNumber: 216,
                                            columnNumber: 19
                                        }, this)) : ultimasEncomendas.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "px-6 py-8 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-[#78716c] dark:text-[#888]",
                                                children: "Nenhuma encomenda recente."
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardComercial.tsx",
                                                lineNumber: 224,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/encomendas/novo",
                                                className: "mt-3 inline-block text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]",
                                                children: "Criar encomenda"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardComercial.tsx",
                                                lineNumber: 227,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DashboardComercial.tsx",
                                        lineNumber: 223,
                                        columnNumber: 17
                                    }, this) : ultimasEncomendas.map((enc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: `/encomendas/${enc.id}`,
                                                className: "flex items-center justify-between gap-3 px-6 py-4 text-sm transition-colors hover:bg-[#fafaf9] dark:hover:bg-[#111]",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium text-[#1c1917] dark:text-white",
                                                        children: [
                                                            "#",
                                                            enc.id
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/DashboardComercial.tsx",
                                                        lineNumber: 241,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "truncate text-[#57534e] dark:text-[#a3a3a3]",
                                                        children: enc.clienteNome ?? `Cliente ${enc.clienteId}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardComercial.tsx",
                                                        lineNumber: 244,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$encomendas$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["corEstado"])(enc.estado)}`,
                                                        children: enc.estado
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardComercial.tsx",
                                                        lineNumber: 247,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/DashboardComercial.tsx",
                                                lineNumber: 237,
                                                columnNumber: 21
                                            }, this)
                                        }, enc.id, false, {
                                            fileName: "[project]/app/components/DashboardComercial.tsx",
                                            lineNumber: 236,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 213,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-t border-[#e7e5e4] px-6 py-3 dark:border-[#222]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/encomendas",
                                        className: "text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]",
                                        children: "Ver todas as encomendas →"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DashboardComercial.tsx",
                                        lineNumber: 258,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 257,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DashboardComercial.tsx",
                            lineNumber: 204,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-[#222] dark:bg-[#0d0d0d]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-b border-[#e7e5e4] px-6 py-4 dark:border-[#222]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-[#1c1917] dark:text-white",
                                            children: "Próximos serviços"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/DashboardComercial.tsx",
                                            lineNumber: 270,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-[#78716c] dark:text-[#888]",
                                            children: "Agendados no terreno"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/DashboardComercial.tsx",
                                            lineNumber: 273,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 269,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "divide-y divide-[#e7e5e4] dark:divide-[#222]",
                                    children: loadingServicos ? [
                                        1,
                                        2,
                                        3,
                                        4,
                                        5
                                    ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "flex items-center gap-3 px-6 py-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "h-4 w-20 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                                    lineNumber: 281,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "h-4 flex-1 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                                    lineNumber: 282,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "h-4 w-4 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                                    lineNumber: 283,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/app/components/DashboardComercial.tsx",
                                            lineNumber: 280,
                                            columnNumber: 19
                                        }, this)) : proximosServicos.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "px-6 py-8 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-[#78716c] dark:text-[#888]",
                                                children: "Nenhum serviço agendado."
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardComercial.tsx",
                                                lineNumber: 288,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/servicos",
                                                className: "mt-3 inline-block text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]",
                                                children: "Ver serviços"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardComercial.tsx",
                                                lineNumber: 291,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DashboardComercial.tsx",
                                        lineNumber: 287,
                                        columnNumber: 17
                                    }, this) : proximosServicos.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: `/servicos/${s.id}`,
                                                className: "flex items-center justify-between gap-3 px-6 py-4 text-sm transition-colors hover:bg-[#fafaf9] dark:hover:bg-[#111]",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium text-[#1c1917] dark:text-white",
                                                        children: new Date(s.dataServico).toLocaleDateString("pt-PT", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric"
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardComercial.tsx",
                                                        lineNumber: 305,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "truncate text-[#57534e] dark:text-[#a3a3a3]",
                                                        children: s.local ?? s.moradaCompleta ?? "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardComercial.tsx",
                                                        lineNumber: 312,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "shrink-0 text-[#ea580c] dark:text-[#f97316]",
                                                        children: "→"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardComercial.tsx",
                                                        lineNumber: 315,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/DashboardComercial.tsx",
                                                lineNumber: 301,
                                                columnNumber: 21
                                            }, this)
                                        }, s.id, false, {
                                            fileName: "[project]/app/components/DashboardComercial.tsx",
                                            lineNumber: 300,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 277,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-t border-[#e7e5e4] px-6 py-3 dark:border-[#222]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/servicos",
                                        className: "text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]",
                                        children: "Ver todos os serviços →"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DashboardComercial.tsx",
                                        lineNumber: 324,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardComercial.tsx",
                                    lineNumber: 323,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DashboardComercial.tsx",
                            lineNumber: 268,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/DashboardComercial.tsx",
                    lineNumber: 202,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/DashboardComercial.tsx",
            lineNumber: 125,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/DashboardComercial.tsx",
        lineNumber: 121,
        columnNumber: 5
    }, this);
}
_s(DashboardComercial, "7wOO4nSMBDe9B0JLJ5YbhKvk3ek=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useLiveDateTime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLiveDateTime"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
_c = DashboardComercial;
var _c;
__turbopack_context__.k.register(_c, "DashboardComercial");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/homeGestor.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGestorDashboard",
    ()=>getGestorDashboard
]);
/**
 * API Home — dashboard do Gestor/Admin (estatísticas, gráficos, alertas, atividade recente).
 * GET api/home/gestor-dashboard — apenas para roles Admin e Gestor.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiConfig.ts [app-client] (ecmascript)");
;
function authHeaders(token) {
    return {
        Authorization: `Bearer ${token}`
    };
}
function mapUltimaEncomenda(item) {
    const cliente = item.cliente ?? item.Cliente;
    return {
        id: Number(item.id ?? item.Id ?? 0),
        clienteId: Number(item.clienteId ?? item.ClienteId ?? 0),
        estado: String(item.estado ?? item.Estado ?? ""),
        dataCriacao: String(item.dataCriacao ?? item.DataCriacao ?? ""),
        dataEntrega: item.dataEntrega != null ? String(item.dataEntrega) : undefined,
        cliente: cliente ? {
            id: cliente.id ?? 0,
            nome: cliente.nome ?? ""
        } : undefined
    };
}
async function getGestorDashboard(token) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/home")}/gestor-dashboard`, {
        headers: authHeaders(token)
    });
    if (!res.ok) {
        const text = await res.text();
        if (res.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
        if (res.status === 403) throw new Error("Sem permissão para ver o painel do gestor.");
        throw new Error(text || "Falha ao obter dashboard do gestor");
    }
    const raw = await res.json();
    const ultimasEncomendasRaw = Array.isArray(raw.ultimasEncomendas) ? raw.ultimasEncomendas : [];
    return {
        totalClientes: Number(raw.totalClientes ?? 0),
        totalServicos: Number(raw.totalServicos ?? 0),
        totalProdutos: Number(raw.totalProdutos ?? 0),
        totalPaioisAtivos: Number(raw.totalPaioisAtivos ?? 0),
        totalFuncionarios: Number(raw.totalFuncionarios ?? 0),
        encomendasPendentes: Number(raw.encomendasPendentes ?? 0),
        encomendasPorEstado: raw.encomendasPorEstado ?? {},
        encomendasPorMes: Array.isArray(raw.encomendasPorMes) ? raw.encomendasPorMes : [],
        paioisEmManutencao: Array.isArray(raw.paioisEmManutencao) ? raw.paioisEmManutencao : [],
        ultimasEncomendas: ultimasEncomendasRaw.map((e)=>mapUltimaEncomenda(e)),
        entradasRecentes: Array.isArray(raw.entradasRecentes) ? raw.entradasRecentes : [],
        saidasRecentes: Array.isArray(raw.saidasRecentes) ? raw.saidasRecentes : []
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/DashboardGestor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardGestor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/PieChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/polar/Pie.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Cell.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/LineChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Line.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$parseISO$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/parseISO.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$locale$2f$pt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/locale/pt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$homeGestor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/homeGestor.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/animations.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useLiveDateTime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/hooks/useLiveDateTime.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
const ROLE_COLORS = {
    Admin: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300",
    Gestor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
};
/** Áreas e cores para o gráfico "Resumo por área" */ const AREAS_PIE = [
    {
        key: "clientes",
        label: "Clientes",
        color: "#3b82f6"
    },
    {
        key: "servicos",
        label: "Serviços",
        color: "#8b5cf6"
    },
    {
        key: "produtos",
        label: "Produtos",
        color: "#f97316"
    },
    {
        key: "paiois",
        label: "Paióis",
        color: "#22c55e"
    },
    {
        key: "funcionarios",
        label: "Funcionários",
        color: "#06b6d4"
    }
];
function useCountUp(value, enabled, durationMs = 800) {
    _s();
    const [display, setDisplay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCountUp.useEffect": ()=>{
            if (!enabled || value === 0) {
                setDisplay(value);
                return;
            }
            const startTime = performance.now();
            const step = {
                "useCountUp.useEffect.step": (time)=>{
                    const elapsed = time - startTime;
                    const progress = Math.min(elapsed / durationMs, 1);
                    const eased = 1 - (1 - progress) ** 2;
                    setDisplay(Math.round(eased * value));
                    if (progress < 1) requestAnimationFrame(step);
                }
            }["useCountUp.useEffect.step"];
            requestAnimationFrame(step);
            return ({
                "useCountUp.useEffect": ()=>{}
            })["useCountUp.useEffect"];
        }
    }["useCountUp.useEffect"], [
        value,
        enabled,
        durationMs
    ]);
    return display;
}
_s(useCountUp, "iGrsp1ofKEOxzl9YXikV40pdhhg=");
function DashboardGestor({ token, userName, roleLabel }) {
    _s1();
    const sec2Ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sec3Ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sec4Ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sec2InView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"])(sec2Ref, {
        once: true,
        margin: "-80px"
    });
    const sec3InView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"])(sec3Ref, {
        once: true,
        margin: "-80px"
    });
    const sec4InView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"])(sec4Ref, {
        once: true,
        margin: "-80px"
    });
    const liveDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useLiveDateTime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLiveDateTime"])();
    const { data, isLoading, isError, error, refetch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "gestor-dashboard"
        ],
        queryFn: {
            "DashboardGestor.useQuery": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$homeGestor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGestorDashboard"])(token)
        }["DashboardGestor.useQuery"],
        staleTime: 60 * 1000,
        retry: 2,
        enabled: !!token
    });
    const cards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DashboardGestor.useMemo[cards]": ()=>{
            if (!data) return [];
            return [
                {
                    title: "Encomendas pendentes",
                    value: data.encomendasPendentes,
                    href: "/encomendas?estado=Pendente",
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "h-8 w-8",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 1.5,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 109,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/DashboardGestor.tsx",
                        lineNumber: 108,
                        columnNumber: 11
                    }, this)
                },
                {
                    title: "Serviços ativos",
                    value: data.totalServicos,
                    href: "/servicos",
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "h-8 w-8",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 1.5,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.227-.226.34-.53.34-.836V6.75A2.25 2.25 0 109.75 9v4.18c0 .306.113.61.34.836l2.496 3.03"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 119,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/DashboardGestor.tsx",
                        lineNumber: 118,
                        columnNumber: 11
                    }, this)
                },
                {
                    title: "Paióis ativos",
                    value: data.totalPaioisAtivos,
                    href: "/armazem/gestao",
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "h-8 w-8",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 1.5,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 129,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/DashboardGestor.tsx",
                        lineNumber: 128,
                        columnNumber: 11
                    }, this)
                },
                {
                    title: "Clientes",
                    value: data.totalClientes,
                    href: "/clientes",
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "h-8 w-8",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 1.5,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 139,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/DashboardGestor.tsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this)
                },
                {
                    title: "Funcionários",
                    value: data.totalFuncionarios,
                    href: "/funcionarios",
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "h-8 w-8",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 1.5,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 149,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/DashboardGestor.tsx",
                        lineNumber: 148,
                        columnNumber: 11
                    }, this)
                },
                {
                    title: "Produtos",
                    value: data.totalProdutos,
                    href: "/produtos",
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "h-8 w-8",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        strokeWidth: 1.5,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 159,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/DashboardGestor.tsx",
                        lineNumber: 158,
                        columnNumber: 11
                    }, this)
                }
            ];
        }
    }["DashboardGestor.useMemo[cards]"], [
        data
    ]);
    /** Dados para o gráfico circular: resumo por área (clientes, serviços, produtos, paióis, funcionários) */ const pieData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DashboardGestor.useMemo[pieData]": ()=>{
            if (!data) return [];
            const values = {
                clientes: data.totalClientes ?? 0,
                servicos: data.totalServicos ?? 0,
                produtos: data.totalProdutos ?? 0,
                paiois: data.totalPaioisAtivos ?? 0,
                funcionarios: data.totalFuncionarios ?? 0
            };
            const total = Object.values(values).reduce({
                "DashboardGestor.useMemo[pieData].total": (a, b)=>a + b
            }["DashboardGestor.useMemo[pieData].total"], 0);
            return AREAS_PIE.filter({
                "DashboardGestor.useMemo[pieData]": (a)=>values[a.key] > 0
            }["DashboardGestor.useMemo[pieData]"]).map({
                "DashboardGestor.useMemo[pieData]": (a)=>({
                        name: a.label,
                        value: values[a.key],
                        total,
                        percent: total > 0 ? values[a.key] / total * 100 : 0,
                        color: a.color
                    })
            }["DashboardGestor.useMemo[pieData]"]);
        }
    }["DashboardGestor.useMemo[pieData]"], [
        data
    ]);
    const lineData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DashboardGestor.useMemo[lineData]": ()=>{
            if (!data?.encomendasPorMes?.length) return [];
            return data.encomendasPorMes.map({
                "DashboardGestor.useMemo[lineData]": ({ mes, total })=>({
                        mes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$parseISO$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseISO"])(mes + "-01"), "MMM yy", {
                            locale: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$locale$2f$pt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pt"]
                        }),
                        total,
                        mesKey: mes
                    })
            }["DashboardGestor.useMemo[lineData]"]);
        }
    }["DashboardGestor.useMemo[lineData]"], [
        data
    ]);
    const ultimosMovimentos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DashboardGestor.useMemo[ultimosMovimentos]": ()=>{
            if (!data) return [];
            const entradas = data.entradasRecentes.map({
                "DashboardGestor.useMemo[ultimosMovimentos].entradas": (e)=>({
                        ...e,
                        data: e.data
                    })
            }["DashboardGestor.useMemo[ultimosMovimentos].entradas"]);
            const saidas = data.saidasRecentes.map({
                "DashboardGestor.useMemo[ultimosMovimentos].saidas": (s)=>({
                        ...s,
                        data: s.data
                    })
            }["DashboardGestor.useMemo[ultimosMovimentos].saidas"]);
            return [
                ...entradas,
                ...saidas
            ].sort({
                "DashboardGestor.useMemo[ultimosMovimentos]": (a, b)=>new Date(b.data).getTime() - new Date(a.data).getTime()
            }["DashboardGestor.useMemo[ultimosMovimentos]"]).slice(0, 5);
        }
    }["DashboardGestor.useMemo[ultimosMovimentos]"], [
        data
    ]);
    /** Encomendas com estado Pendente (das últimas recebidas); para o primeiro card. */ const encomendasPendentesLista = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DashboardGestor.useMemo[encomendasPendentesLista]": ()=>{
            if (!data?.ultimasEncomendas) return [];
            return data.ultimasEncomendas.filter({
                "DashboardGestor.useMemo[encomendasPendentesLista]": (e)=>e.estado === "Pendente"
            }["DashboardGestor.useMemo[encomendasPendentesLista]"]).slice(0, 5);
        }
    }["DashboardGestor.useMemo[encomendasPendentesLista]"], [
        data
    ]);
    const temAlertas = data && data.paioisEmManutencao?.length > 0;
    const roleBadgeClass = ROLE_COLORS[roleLabel] ?? "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    if (isError) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            id: "dashboard-gestor",
            className: "border-t border-[#e7e5e4] bg-[#fafaf9] px-6 py-24 dark:border-[#1a1a1a] dark:bg-[#050505] sm:px-8 sm:py-32",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto max-w-6xl",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-900/20",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "font-medium text-amber-900 dark:text-amber-200",
                            children: error instanceof Error ? error.message : "Erro ao carregar o painel."
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 221,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>refetch(),
                            className: "mt-4 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800",
                            children: "Tentar novamente"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 224,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/DashboardGestor.tsx",
                    lineNumber: 220,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/DashboardGestor.tsx",
                lineNumber: 219,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/DashboardGestor.tsx",
            lineNumber: 215,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "dashboard-gestor",
        className: "border-t border-[#e7e5e4] bg-[#fafaf9] px-6 py-24 dark:border-[#1a1a1a] dark:bg-[#050505] sm:px-8 sm:py-32",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-6xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: 12
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    transition: {
                        duration: 0.4,
                        ease: [
                            0.25,
                            0.46,
                            0.45,
                            0.94
                        ]
                    },
                    className: "flex flex-wrap items-center justify-between gap-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "font-heading text-2xl font-bold tracking-tight text-[#1c1917] sm:text-3xl dark:text-white",
                                children: [
                                    "Bem-vindo, ",
                                    userName || "Gestor"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                lineNumber: 251,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 flex flex-wrap items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClass}`,
                                        children: roleLabel
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 255,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-[#57534e] dark:text-[#888]",
                                        children: [
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(liveDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                                                locale: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$locale$2f$pt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pt"]
                                            }),
                                            " · ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "tabular-nums",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(liveDate, "HH:mm:ss")
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 261,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 258,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                lineNumber: 254,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/DashboardGestor.tsx",
                        lineNumber: 250,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/DashboardGestor.tsx",
                    lineNumber: 244,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    variants: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["staggerContainer"],
                    initial: "initial",
                    animate: "animate",
                    className: "mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6",
                    children: isLoading ? Array.from({
                        length: 6
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-2xl border border-[#e7e5e4] bg-white p-5 dark:border-[#222] dark:bg-[#0d0d0d]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-10 w-10 animate-pulse rounded-xl bg-[#e7e5e4] dark:bg-[#333]"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 280,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-3 h-8 w-16 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 281,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 h-4 w-24 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 282,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 276,
                            columnNumber: 17
                        }, this)) : cards.map((card, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                            card: card,
                            index: i,
                            enabled: !!data
                        }, card.title, false, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 286,
                            columnNumber: 17
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/app/components/DashboardGestor.tsx",
                    lineNumber: 268,
                    columnNumber: 9
                }, this),
                temAlertas && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    ref: sec2Ref,
                    initial: {
                        opacity: 0,
                        y: 24
                    },
                    animate: sec2InView ? {
                        opacity: 1,
                        y: 0
                    } : {},
                    transition: {
                        duration: 0.4
                    },
                    className: "mt-14",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-semibold text-[#1c1917] dark:text-white",
                            children: "Alertas"
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 299,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-3 flex flex-wrap gap-3",
                            children: data.paioisEmManutencao.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/armazem/gestao",
                                className: "flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 transition-shadow hover:shadow-md dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold dark:bg-amber-800",
                                        children: data.paioisEmManutencao.length
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 306,
                                        columnNumber: 19
                                    }, this),
                                    "Paióis em manutenção",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-amber-600 dark:text-amber-400",
                                        children: "→"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 310,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                lineNumber: 302,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 300,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/DashboardGestor.tsx",
                    lineNumber: 292,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    ref: sec3Ref,
                    initial: {
                        opacity: 0,
                        y: 24
                    },
                    animate: sec3InView ? {
                        opacity: 1,
                        y: 0
                    } : {},
                    transition: {
                        duration: 0.4
                    },
                    className: "mt-14 grid gap-8 lg:grid-cols-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:border-[#222] dark:bg-[#0d0d0d] dark:hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-b border-[#e7e5e4] bg-[#fafaf9] px-5 py-4 dark:border-[#222] dark:bg-[#0a0a0a]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff6ff] text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "h-5 w-5",
                                                    fill: "none",
                                                    viewBox: "0 0 24 24",
                                                    stroke: "currentColor",
                                                    strokeWidth: 1.5,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        d: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-3 3m0 0l3 3m-3-3h7.5m-7.5 0V9"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 330,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 329,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 328,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "font-semibold text-[#1c1917] dark:text-white",
                                                        children: "Resumo por área"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 334,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-[#78716c] dark:text-[#666]",
                                                        children: "Distribuição de registos no sistema"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 335,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 333,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 327,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 326,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4",
                                    children: pieData.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center gap-4 sm:flex-row sm:items-stretch",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-[220px] w-full min-w-[220px]",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                                    width: "100%",
                                                    height: "100%",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PieChart"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Pie"], {
                                                                data: pieData,
                                                                cx: "50%",
                                                                cy: "50%",
                                                                innerRadius: 52,
                                                                outerRadius: 72,
                                                                paddingAngle: 3,
                                                                dataKey: "value",
                                                                nameKey: "name",
                                                                animationBegin: 0,
                                                                animationDuration: 500,
                                                                children: pieData.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cell"], {
                                                                        fill: entry.color
                                                                    }, entry.name, false, {
                                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                        lineNumber: 358,
                                                                        columnNumber: 29
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                lineNumber: 345,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                                contentStyle: {
                                                                    borderRadius: "12px",
                                                                    border: "1px solid #e7e5e4"
                                                                },
                                                                formatter: (value, name, props)=>{
                                                                    const pct = props?.payload?.percent;
                                                                    return [
                                                                        `${value} registo(s)${typeof pct === "number" ? ` — ${pct.toFixed(1)}%` : ""}`,
                                                                        name
                                                                    ];
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                lineNumber: 361,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 344,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 343,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 342,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-1 flex-wrap content-start gap-x-4 gap-y-2 sm:flex-col sm:justify-center",
                                                children: pieData.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "h-3 w-3 shrink-0 rounded-full",
                                                                style: {
                                                                    backgroundColor: entry.color
                                                                },
                                                                "aria-hidden": true
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                lineNumber: 377,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm text-[#1c1917] dark:text-white",
                                                                children: entry.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                lineNumber: 382,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "tabular-nums text-sm font-medium text-[#57534e] dark:text-[#a3a3a3]",
                                                                children: [
                                                                    entry.value,
                                                                    entry.total > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "ml-0.5 text-xs text-[#a8a29e] dark:text-[#555]",
                                                                        children: [
                                                                            "(",
                                                                            entry.percent.toFixed(0),
                                                                            "%)"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                        lineNumber: 386,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                lineNumber: 383,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, entry.name, true, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 376,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 374,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 341,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex h-[220px] flex-col items-center justify-center rounded-xl bg-[#fafaf9] dark:bg-[#0a0a0a]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-[#78716c] dark:text-[#666]",
                                                children: "Sem registos para mostrar."
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 397,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-xs text-[#a8a29e] dark:text-[#555]",
                                                children: "Os totais aparecem quando existir dados."
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 398,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 396,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 339,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 325,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-[#222] dark:bg-[#0d0d0d]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "font-semibold text-[#1c1917] dark:text-white",
                                    children: "Evolução encomendas (últimos 6 meses)"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 404,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4 h-[260px]",
                                    children: lineData.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                        width: "100%",
                                        height: "100%",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LineChart"], {
                                            data: lineData,
                                            margin: {
                                                top: 5,
                                                right: 10,
                                                left: 0,
                                                bottom: 5
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                                    strokeDasharray: "3 3",
                                                    className: "stroke-[#e7e5e4] dark:stroke-[#333]"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 409,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                                    dataKey: "mes",
                                                    className: "text-xs",
                                                    stroke: "#78716c"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 410,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                                    className: "text-xs",
                                                    stroke: "#78716c",
                                                    allowDecimals: false
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 411,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                    contentStyle: {
                                                        borderRadius: "12px",
                                                        border: "1px solid #e7e5e4"
                                                    },
                                                    formatter: (v)=>[
                                                            v,
                                                            "Encomendas"
                                                        ],
                                                    labelFormatter: (mes)=>mes
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 412,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                                                    type: "monotone",
                                                    dataKey: "total",
                                                    name: "Encomendas",
                                                    stroke: "#f97316",
                                                    strokeWidth: 2,
                                                    dot: {
                                                        fill: "#f97316",
                                                        r: 4
                                                    },
                                                    animationBegin: 0,
                                                    animationDuration: 600
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 417,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                            lineNumber: 408,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 407,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex h-full items-center justify-center text-sm text-[#78716c] dark:text-[#666]",
                                        children: "Sem dados"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 430,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 405,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 403,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/DashboardGestor.tsx",
                    lineNumber: 318,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    ref: sec4Ref,
                    initial: {
                        opacity: 0,
                        y: 24
                    },
                    animate: sec4InView ? {
                        opacity: 1,
                        y: 0
                    } : {},
                    transition: {
                        duration: 0.4
                    },
                    className: "mt-14 grid gap-8 lg:grid-cols-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:border-[#222] dark:bg-[#0d0d0d] dark:hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-b border-[#e7e5e4] bg-[#fffbeb] px-5 py-4 dark:border-[#222] dark:bg-amber-950/20",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "h-5 w-5",
                                                            fill: "none",
                                                            viewBox: "0 0 24 24",
                                                            stroke: "currentColor",
                                                            strokeWidth: 1.5,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                lineNumber: 453,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 452,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 451,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "font-semibold text-[#1c1917] dark:text-white",
                                                                children: "Encomendas pendentes"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                lineNumber: 457,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-[#78716c] dark:text-[#a3a3a3]",
                                                                children: "A aguardar aceite ou rejeição"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                lineNumber: 458,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 456,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 450,
                                                columnNumber: 17
                                            }, this),
                                            !isLoading && data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex h-8 min-w-[2rem] items-center justify-center rounded-full bg-amber-200 px-2.5 text-sm font-bold tabular-nums text-amber-900 dark:bg-amber-800 dark:text-amber-100",
                                                children: data.encomendasPendentes
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 462,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 449,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 448,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-h-[200px]",
                                    children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "divide-y divide-[#e7e5e4] dark:divide-[#222]",
                                        children: [
                                            1,
                                            2,
                                            3
                                        ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "flex items-center gap-3 px-5 py-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "h-4 w-12 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 473,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "h-4 flex-1 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 474,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, i, true, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 472,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 470,
                                        columnNumber: 17
                                    }, this) : encomendasPendentesLista.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center justify-center px-5 py-12 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-[#78716c] dark:text-[#888]",
                                                children: data && data.encomendasPendentes > 0 ? "Nenhuma pendente nas últimas encomendas listadas." : "Nenhuma encomenda pendente."
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 480,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: data?.encomendasPendentes ? "/encomendas?estado=Pendente" : "/encomendas",
                                                className: "mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-100 dark:hover:bg-amber-800/50",
                                                children: [
                                                    data?.encomendasPendentes ? "Ver pendentes" : "Ver encomendas",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "h-4 w-4",
                                                        fill: "none",
                                                        viewBox: "0 0 24 24",
                                                        stroke: "currentColor",
                                                        strokeWidth: 2,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            d: "M13 7l5 5m0 0l-5 5m5-5H6"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 491,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 490,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 485,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 479,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "divide-y divide-[#e7e5e4] dark:divide-[#222]",
                                        children: encomendasPendentesLista.map((enc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: `/encomendas/${enc.id}`,
                                                    className: "group flex items-center gap-4 border-l-2 border-transparent px-5 py-4 transition-colors hover:border-amber-500 hover:bg-[#fffbeb]/50 dark:hover:border-amber-500 dark:hover:bg-amber-950/10",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-semibold tabular-nums text-[#1c1917] dark:text-white",
                                                            children: [
                                                                "#",
                                                                enc.id
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 503,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "min-w-0 flex-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "truncate text-sm font-medium text-[#1c1917] dark:text-white",
                                                                    children: enc.cliente?.nome ?? `Cliente ${enc.clienteId}`
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                    lineNumber: 505,
                                                                    columnNumber: 27
                                                                }, this),
                                                                enc.dataCriacao && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-[#78716c] dark:text-[#666]",
                                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(enc.dataCriacao), "d MMM, HH:mm", {
                                                                        locale: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$locale$2f$pt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pt"]
                                                                    })
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                    lineNumber: 509,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 504,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
                                                            children: "Pendente"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 514,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "h-4 w-4 shrink-0 text-[#a8a29e] group-hover:text-amber-600 dark:group-hover:text-amber-400",
                                                            fill: "none",
                                                            viewBox: "0 0 24 24",
                                                            stroke: "currentColor",
                                                            strokeWidth: 2,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                d: "M9 5l7 7-7 7"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                lineNumber: 518,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 517,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 499,
                                                    columnNumber: 23
                                                }, this)
                                            }, enc.id, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 498,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 496,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 468,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-t border-[#e7e5e4] bg-[#fafaf9] px-5 py-3 dark:border-[#222] dark:bg-[#0a0a0a]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/encomendas?estado=Pendente",
                                        className: "inline-flex items-center gap-1.5 text-sm font-medium text-[#ea580c] transition-colors hover:text-[#c2410c] dark:text-[#f97316] dark:hover:text-[#fb923c]",
                                        children: [
                                            "Ver todas as pendentes",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "h-4 w-4",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                stroke: "currentColor",
                                                strokeWidth: 2,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    d: "M13 7l5 5m0 0l-5 5m5-5H6"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 533,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 532,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 527,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 526,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 447,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:border-[#222] dark:bg-[#0d0d0d] dark:hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-b border-[#e7e5e4] bg-[#fafaf9] px-5 py-4 dark:border-[#222] dark:bg-[#0a0a0a]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0fdf4] text-green-600 dark:bg-green-900/30 dark:text-green-400",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "h-5 w-5",
                                                    fill: "none",
                                                    viewBox: "0 0 24 24",
                                                    stroke: "currentColor",
                                                    strokeWidth: 1.5,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        d: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 545,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 544,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 543,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "font-semibold text-[#1c1917] dark:text-white",
                                                        children: "Movimentos de armazém"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 549,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-[#78716c] dark:text-[#666]",
                                                        children: "Entradas e saídas recentes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 550,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 548,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 542,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 541,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-h-[200px]",
                                    children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "divide-y divide-[#e7e5e4] dark:divide-[#222]",
                                        children: [
                                            1,
                                            2,
                                            3,
                                            4,
                                            5
                                        ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "flex items-center gap-3 px-5 py-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "h-4 w-16 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 559,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "h-4 flex-1 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                        lineNumber: 560,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, i, true, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 558,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 556,
                                        columnNumber: 17
                                    }, this) : ultimosMovimentos.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center justify-center px-5 py-12 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-[#78716c] dark:text-[#888]",
                                                children: "Nenhum movimento recente."
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 566,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/armazem/movimentos",
                                                className: "mt-2 text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]",
                                                children: "Ver histórico"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 567,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 565,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "overflow-x-auto",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-[480px]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid grid-cols-[auto_auto_1fr_1fr_auto_auto] gap-2 border-b border-[#e7e5e4] px-5 py-2 text-xs font-medium uppercase tracking-wider text-[#78716c] dark:border-[#222] dark:text-[#666]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Data"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 575,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "w-16",
                                                            children: "Tipo"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 576,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "truncate",
                                                            children: "Paiol"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 577,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "truncate",
                                                            children: "Produto"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 578,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-right",
                                                            children: "Qtd"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 579,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "w-12 text-right",
                                                            children: "Ref."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 580,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 574,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                    className: "divide-y divide-[#e7e5e4] dark:divide-[#222]",
                                                    children: ultimosMovimentos.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            className: "transition-colors hover:bg-[#fafaf9] dark:hover:bg-[#111]",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-[auto_auto_1fr_1fr_auto_auto] gap-2 px-5 py-3 text-sm",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "tabular-nums text-[#57534e] dark:text-[#a3a3a3]",
                                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(m.data), "dd/MM HH:mm", {
                                                                            locale: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$locale$2f$pt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pt"]
                                                                        })
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                        lineNumber: 589,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: `w-fit rounded px-2 py-0.5 text-xs font-medium ${m.tipo === "Entrada" ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"}`,
                                                                        children: m.tipo
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                        lineNumber: 592,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "truncate font-medium text-[#1c1917] dark:text-white",
                                                                        title: m.paiolNome,
                                                                        children: m.paiolNome || "—"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                        lineNumber: 601,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "truncate text-[#57534e] dark:text-[#a3a3a3]",
                                                                        title: m.produtoNome,
                                                                        children: m.produtoNome || "—"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                        lineNumber: 604,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-right tabular-nums font-medium text-[#1c1917] dark:text-white",
                                                                        children: Number(m.quantidade)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                        lineNumber: 607,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "w-12 text-right",
                                                                        children: m.encomendaId != null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                            href: `/encomendas/${m.encomendaId}`,
                                                                            className: "font-medium text-[#ea580c] hover:underline dark:text-[#f97316]",
                                                                            children: [
                                                                                "#",
                                                                                m.encomendaId
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                            lineNumber: 612,
                                                                            columnNumber: 33
                                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[#a8a29e] dark:text-[#555]",
                                                                            children: "—"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                            lineNumber: 619,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                        lineNumber: 610,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                                lineNumber: 588,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, `${m.tipo}-${m.id}`, false, {
                                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                                            lineNumber: 584,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 582,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/DashboardGestor.tsx",
                                            lineNumber: 573,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 572,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 554,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-t border-[#e7e5e4] bg-[#fafaf9] px-5 py-3 dark:border-[#222] dark:bg-[#0a0a0a]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/armazem/movimentos",
                                        className: "inline-flex items-center gap-1.5 text-sm font-medium text-[#ea580c] transition-colors hover:text-[#c2410c] dark:text-[#f97316] dark:hover:text-[#fb923c]",
                                        children: [
                                            "Ver todos os movimentos",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "h-4 w-4",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                stroke: "currentColor",
                                                strokeWidth: 2,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    d: "M13 7l5 5m0 0l-5 5m5-5H6"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                                    lineNumber: 637,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/DashboardGestor.tsx",
                                                lineNumber: 636,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/DashboardGestor.tsx",
                                        lineNumber: 631,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/DashboardGestor.tsx",
                                    lineNumber: 630,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/DashboardGestor.tsx",
                            lineNumber: 540,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/DashboardGestor.tsx",
                    lineNumber: 439,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/DashboardGestor.tsx",
            lineNumber: 242,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/DashboardGestor.tsx",
        lineNumber: 238,
        columnNumber: 5
    }, this);
}
_s1(DashboardGestor, "RIIty/BP32V/snbUxQAjCSM/JOA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInView"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useLiveDateTime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLiveDateTime"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
_c = DashboardGestor;
function StatCard({ card, index, enabled }) {
    _s2();
    const displayValue = useCountUp(card.value, enabled);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        variants: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["staggerItem"],
        transition: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
            delay: index * 0.05
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: card.href,
            className: "card-hover group flex flex-col rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(249,115,22,0.2)] dark:border-[#222] dark:bg-[#0d0d0d] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.4)]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[#ea580c] dark:text-[#f97316]",
                    children: card.icon
                }, void 0, false, {
                    fileName: "[project]/app/components/DashboardGestor.tsx",
                    lineNumber: 656,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "mt-3 text-2xl font-bold tracking-tight text-[#1c1917] dark:text-white",
                    children: displayValue
                }, void 0, false, {
                    fileName: "[project]/app/components/DashboardGestor.tsx",
                    lineNumber: 657,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "mt-1 text-sm font-semibold text-[#1c1917] dark:text-white",
                    children: card.title
                }, void 0, false, {
                    fileName: "[project]/app/components/DashboardGestor.tsx",
                    lineNumber: 658,
                    columnNumber: 9
                }, this),
                card.variation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "mt-0.5 text-xs text-[#78716c] dark:text-[#888]",
                    children: card.variation
                }, void 0, false, {
                    fileName: "[project]/app/components/DashboardGestor.tsx",
                    lineNumber: 660,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/DashboardGestor.tsx",
            lineNumber: 652,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/DashboardGestor.tsx",
        lineNumber: 651,
        columnNumber: 5
    }, this);
}
_s2(StatCard, "/Ezs77Ib6hQTmG8++aIdUjbQVT4=", false, function() {
    return [
        useCountUp
    ];
});
_c1 = StatCard;
var _c, _c1;
__turbopack_context__.k.register(_c, "DashboardGestor");
__turbopack_context__.k.register(_c1, "StatCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/Navbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$DashboardComercial$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/DashboardComercial.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$DashboardGestor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/DashboardGestor.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/UserContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/animations.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$home$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/home.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
/** Labels das estatísticas (ordem alinhada com a API: clientes, serviços, produtos, paióis) */ const STATS_LABELS = [
    "clientes",
    "serviços realizados",
    "produtos geridos",
    "paióis ativos"
];
/** Faíscas no hero — poucas e leves para não prejudicar a fluidez (só transform + opacity) */ const SPARKS = [
    {
        left: "15%",
        top: "20%",
        size: 3,
        delay: 0,
        gold: false
    },
    {
        left: "85%",
        top: "25%",
        size: 3,
        delay: 0.8,
        gold: true
    },
    {
        left: "50%",
        top: "15%",
        size: 4,
        delay: 0.4,
        gold: true
    },
    {
        left: "25%",
        top: "70%",
        size: 3,
        delay: 1.2,
        gold: false
    },
    {
        left: "75%",
        top: "68%",
        size: 3,
        delay: 0.3,
        gold: false
    },
    {
        left: "8%",
        top: "48%",
        size: 3,
        delay: 1,
        gold: true
    },
    {
        left: "92%",
        top: "52%",
        size: 3,
        delay: 0.5,
        gold: false
    },
    {
        left: "40%",
        top: "38%",
        size: 3,
        delay: 1.5,
        gold: false
    },
    {
        left: "60%",
        top: "42%",
        size: 3,
        delay: 0.2,
        gold: true
    },
    {
        left: "20%",
        top: "82%",
        size: 3,
        delay: 0.7,
        gold: false
    },
    {
        left: "80%",
        top: "12%",
        size: 3,
        delay: 1.3,
        gold: true
    },
    {
        left: "48%",
        top: "55%",
        size: 4,
        delay: 0.6,
        gold: true
    }
];
/** Hierarquia: Admin > Gestor > Comercial > Armazém. O melhor cargo do utilizador determina a vista. */ const ROLE_APENAS_ARMAZEM = "Armazém";
const ROLE_COMERCIAL = "Comercial";
const ROLE_ADMIN = "Admin";
const ROLE_GESTOR = "Gestor";
function isApenasArmazem(roles) {
    if (!roles || roles.length !== 1) return false;
    return roles[0] === ROLE_APENAS_ARMAZEM;
}
/** Melhor cargo = Comercial: tem Comercial e não tem Admin nem Gestor (pode ter Armazém). */ function isMelhorCargoComercial(roles) {
    if (!roles || roles.length === 0) return false;
    const hasComercial = roles.some((r)=>r === ROLE_COMERCIAL);
    const hasAdmin = roles.some((r)=>r === ROLE_ADMIN);
    const hasGestor = roles.some((r)=>r === ROLE_GESTOR);
    return hasComercial && !hasAdmin && !hasGestor;
}
function Home() {
    _s();
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    const apenasArmazem = isApenasArmazem(user?.roles);
    const melhorCargoComercial = isMelhorCargoComercial(user?.roles);
    const showAreasSection = !!token && !apenasArmazem && !melhorCargoComercial;
    const showComercialDashboard = !!token && melhorCargoComercial;
    const { data: statsData, isLoading: loadingStats } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "home",
            "stats"
        ],
        queryFn: {
            "Home.useQuery": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$home$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getHomeStats"])(token)
        }["Home.useQuery"],
        staleTime: 60 * 1000,
        retry: 2,
        enabled: !!token
    });
    const statsDisplay = statsData ? [
        {
            value: String(statsData.totalClientes),
            label: STATS_LABELS[0]
        },
        {
            value: String(statsData.totalServicos),
            label: STATS_LABELS[1]
        },
        {
            value: String(statsData.totalProdutos),
            label: STATS_LABELS[2]
        },
        {
            value: String(statsData.totalPaioisAtivos),
            label: STATS_LABELS[3]
        }
    ] : STATS_LABELS.map((label)=>({
            value: "—",
            label
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#fafaf9] text-[#1c1917] selection:bg-[#f97316]/20 selection:text-[#1c1917] dark:bg-[#050505] dark:text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "relative",
                style: {
                    paddingTop: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CONTENT_OFFSET_TOP"]
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "home-hero-bg home-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-28 md:pb-36 md:pt-32",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "home-grain",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 97,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "home-sparks",
                                "aria-hidden": true,
                                children: SPARKS.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `home-spark ${s.gold ? "home-spark--gold" : ""}`,
                                        style: {
                                            left: s.left,
                                            top: s.top,
                                            width: s.size,
                                            height: s.size,
                                            minWidth: s.size,
                                            minHeight: s.size,
                                            animationDelay: `${s.delay}s`,
                                            animationDuration: `${8 + i % 2}s`
                                        }
                                    }, i, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 102,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 100,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pointer-events-none absolute inset-0 flex items-center justify-center",
                                "aria-hidden": true,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        className: "absolute h-[600px] w-[800px] max-w-[95vw] rounded-full",
                                        style: {
                                            background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 58%)"
                                        },
                                        animate: {
                                            scale: [
                                                1,
                                                1.06,
                                                1
                                            ],
                                            opacity: [
                                                0.5,
                                                0.8,
                                                0.5
                                            ]
                                        },
                                        transition: {
                                            duration: 12,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 121,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        className: "absolute h-[380px] w-[480px] rounded-full",
                                        style: {
                                            background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 62%)",
                                            marginLeft: "-15%",
                                            marginTop: "8%"
                                        },
                                        animate: {
                                            scale: [
                                                1.04,
                                                1,
                                                1.04
                                            ],
                                            opacity: [
                                                0.6,
                                                0.9,
                                                0.6
                                            ]
                                        },
                                        transition: {
                                            duration: 14,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 136,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 120,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["staggerContainer"],
                                initial: "initial",
                                animate: "animate",
                                className: "relative mx-auto max-w-2xl text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"],
                                        transition: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                        className: "inline-block rounded-full border border-[#fed7aa]/80 bg-[#fffbf7] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c2410c]/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-[#f97316]/20 dark:bg-[#f97316]/8 dark:text-[#f97316] dark:shadow-none",
                                        children: "Sistema de Gestão Pirotécnica"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 161,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].h1, {
                                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"],
                                        transition: {
                                            ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                            delay: 0.06
                                        },
                                        className: "home-wordmark font-heading mt-12 text-5xl font-bold tracking-tight text-[#1c1917] sm:mt-14 sm:text-6xl md:text-7xl lg:text-8xl dark:text-white",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                                className: "inline-block text-[#ea580c] dark:text-[#f97316]",
                                                animate: {
                                                    opacity: [
                                                        1,
                                                        0.9,
                                                        1
                                                    ]
                                                },
                                                transition: {
                                                    duration: 4,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                },
                                                children: "P"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 174,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[#1c1917] dark:text-white",
                                                children: "IROFAFE"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 181,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 169,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"],
                                        transition: {
                                            ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                            delay: 0.1
                                        },
                                        className: "mx-auto mt-10 h-px w-16 rounded-full bg-[#ea580c]/30 dark:bg-[#f97316]/40",
                                        "aria-hidden": true
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 184,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].p, {
                                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"],
                                        transition: {
                                            ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                            delay: 0.12
                                        },
                                        className: "mt-10 max-w-md mx-auto text-center text-base leading-relaxed text-[#57534e] tracking-wide sm:text-lg sm:tracking-normal dark:text-[#a3a3a3]",
                                        children: "Iluminamos os seus sonhos."
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 191,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"],
                                        transition: {
                                            ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                            delay: 0.18
                                        },
                                        className: "mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/login",
                                                "data-button": true,
                                                className: "group inline-flex items-center gap-2.5 rounded-2xl bg-[#ea580c] px-8 py-4 text-sm font-semibold text-white shadow-[0_2px_12px_-2px_rgba(234,88,12,0.35)] transition-all duration-300 hover:bg-[#c2410c] hover:shadow-[0_8px_24px_-4px_rgba(234,88,12,0.4)] hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c] active:scale-[0.98] dark:bg-[#f97316] dark:text-black dark:shadow-[0_4px_20px_-2px_rgba(249,115,22,0.35)] dark:hover:shadow-[0_12px_32px_-4px_rgba(249,115,22,0.4)]",
                                                children: [
                                                    "Aceder à aplicação",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                                        transition: {
                                                            type: "spring",
                                                            stiffness: 400,
                                                            damping: 25
                                                        },
                                                        whileHover: {
                                                            x: 2
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "h-4 w-4",
                                                            fill: "none",
                                                            viewBox: "0 0 24 24",
                                                            stroke: "currentColor",
                                                            strokeWidth: 2,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                d: "M13 7l5 5m0 0l-5 5m5-5H6"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 215,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 214,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 210,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 204,
                                                columnNumber: 15
                                            }, this),
                                            (showAreasSection || showComercialDashboard) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: showComercialDashboard ? "#dashboard-comercial" : "#dashboard-gestor",
                                                "data-button": true,
                                                className: "rounded-2xl border border-[#e7e5e4] bg-white/90 px-8 py-4 text-sm font-medium text-[#444] shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all duration-300 hover:border-[#f97316]/30 hover:bg-white hover:text-[#1c1917] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] active:scale-[0.98] dark:border-[#2a2a2a] dark:bg-white/5 dark:text-white/90 dark:shadow-none dark:hover:border-[#f97316]/25 dark:hover:bg-white/10 dark:hover:text-white",
                                                children: showComercialDashboard ? "Ver painel" : showAreasSection ? "Ver painel" : "Saber mais"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 220,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 199,
                                        columnNumber: 13
                                    }, this),
                                    token && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["staggerContainer"],
                                        initial: "initial",
                                        animate: "animate",
                                        className: "mt-36 grid max-w-4xl grid-cols-2 gap-4 sm:mt-44 sm:grid-cols-4 sm:gap-6",
                                        children: statsDisplay.map((stat, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["staggerItem"],
                                                transition: {
                                                    ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                                    delay: 0.22 + i * 0.06
                                                },
                                                className: "card-hover rounded-2xl border border-[#e7e5e4] bg-white/80 p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-8 dark:border-[#222] dark:bg-[#0d0d0d]/90 dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)]",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "block text-3xl font-bold tracking-tight text-[#1c1917] sm:text-4xl dark:text-white",
                                                        children: loadingStats ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-block h-9 w-12 animate-pulse rounded bg-[#e7e5e4] dark:bg-[#333]",
                                                            "aria-hidden": true
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 247,
                                                            columnNumber: 23
                                                        }, this) : stat.value
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 245,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "mt-2 block text-sm font-medium text-[#57534e] dark:text-[#888]",
                                                        children: stat.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 252,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, stat.label, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 239,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 232,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 155,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, this),
                    showComercialDashboard && statsData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$DashboardComercial$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        token: token,
                        totalClientes: statsData.totalClientes
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 264,
                        columnNumber: 11
                    }, this),
                    showAreasSection && token && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$DashboardGestor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        token: token,
                        userName: user?.nome ?? "",
                        roleLabel: user?.roles?.find((r)=>r === ROLE_ADMIN || r === ROLE_GESTOR) ?? ROLE_GESTOR
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 269,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                        className: "border-t border-[#e7e5e4] bg-[#fafaf9] px-6 py-10 dark:border-[#1a1a1a] dark:bg-[#050505] sm:px-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mx-auto max-w-5xl text-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs tracking-wide text-[#a8a29e] dark:text-[#555]",
                                children: [
                                    "© ",
                                    new Date().getFullYear(),
                                    " PIROFAFE. Todos os direitos reservados."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 281,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 280,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 277,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 87,
        columnNumber: 5
    }, this);
}
_s(Home, "aucTqlnSq/RUkzaxkZccPvyiZaA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_b4347e36._.js.map