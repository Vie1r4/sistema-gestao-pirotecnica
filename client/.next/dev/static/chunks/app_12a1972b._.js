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
    },
    {
        label: "Documentação",
        href: "/documentacao",
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
    const roles = user?.roles ?? [];
    const isAdminOrGestor = roles.includes("Admin") || roles.includes("Gestor");
    const visibleLinks = NAV_LINKS.filter((link)=>link.permission.some((p)=>permissions.includes(p))).filter((link)=>link.href === "/documentacao" ? isAdminOrGestor : true);
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
                        lineNumber: 104,
                        columnNumber: 9
                    }, this),
                    user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/perfil",
                        "data-button": true,
                        className: "rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-4 py-2 text-sm font-medium text-[#444] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-[#d6d3d1] hover:bg-[#f5f5f4] hover:text-[#1c1917] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#222] dark:bg-[#111]/80 dark:text-[#a0a0a0] dark:shadow-none dark:hover:border-[#333] dark:hover:bg-[#161616] dark:hover:text-white",
                        children: userName?.trim() ? userName : "Perfil"
                    }, void 0, false, {
                        fileName: "[project]/app/components/Navbar.tsx",
                        lineNumber: 115,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/login",
                        "data-button": true,
                        className: "rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-4 py-2 text-sm font-medium text-[#444] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-[#d6d3d1] hover:bg-[#f5f5f4] hover:text-[#1c1917] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#222] dark:bg-[#111]/80 dark:text-[#a0a0a0] dark:shadow-none dark:hover:border-[#333] dark:hover:bg-[#161616] dark:hover:text-white",
                        children: "Iniciar sessão"
                    }, void 0, false, {
                        fileName: "[project]/app/components/Navbar.tsx",
                        lineNumber: 123,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/Navbar.tsx",
                lineNumber: 93,
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
                                lineNumber: 146,
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
                                            lineNumber: 158,
                                            columnNumber: 19
                                        }, this)
                                    }, href, false, {
                                        fileName: "[project]/app/components/Navbar.tsx",
                                        lineNumber: 157,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/components/Navbar.tsx",
                                lineNumber: 153,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/Navbar.tsx",
                        lineNumber: 145,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/Navbar.tsx",
                    lineNumber: 135,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/Navbar.tsx",
                lineNumber: 133,
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
        responsavelTecnicoId: s.responsavelTecnicoId != null || s.ResponsavelTecnicoId != null ? mapId(s.responsavelTecnicoId ?? s.ResponsavelTecnicoId) : resp != null ? mapId(resp.id ?? resp.Id) : undefined,
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
            ficheiroPath: x.ficheiroPath ?? x.FicheiroPath,
            hasFicheiro: Boolean(x.hasFicheiro ?? x.HasFicheiro ?? x.ficheiroPath ?? x.FicheiroPath),
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
                hasFicheiro: Boolean(l.hasFicheiro ?? l.HasFicheiro ?? l.ficheiroPath ?? l.FicheiroPath),
                nomePersonalizado: l.nomePersonalizado ?? l.NomePersonalizado,
                observacoes: l.observacoes ?? l.Observacoes
            })),
        distanciasSeguranca: (data.distanciasSeguranca ?? []).map((d)=>({
                id: mapId(d.id ?? d.Id),
                servicoId: id,
                tipoReferencia: d.tipoReferencia ?? d.TipoReferencia,
                descricaoReferencia: String(d.descricaoReferencia ?? d.DescricaoReferencia ?? ""),
                distanciaMinima_m: Number(d.distanciaMinima_m ?? d.DistanciaMinima_m ?? 0),
                distanciaMedida_m: (d.distanciaMedida_m ?? d.DistanciaMedida_m) != null ? Number(d.distanciaMedida_m ?? d.DistanciaMedida_m) : undefined,
                cumpre: (d.cumpre ?? d.Cumpre) != null ? Boolean(d.cumpre ?? d.Cumpre) : undefined
            })),
        resumoMaterial: data.resumoMaterial ? (()=>{
            const rm = data.resumoMaterial;
            const pesoRaw = rm.pesoBrutoKg ?? rm.PesoBrutoKg;
            return {
                encomendaId: mapId(rm.encomendaId ?? rm.EncomendaId),
                numeroProdutos: Number(rm.numeroProdutos ?? rm.NumeroProdutos ?? 0),
                totalUnidades: Number(rm.totalUnidades ?? rm.TotalUnidades ?? 0),
                mleTotalKg: Number(rm.mleTotalKg ?? rm.MleTotalKg ?? 0),
                pesoBrutoKg: pesoRaw != null ? Number(pesoRaw) : undefined,
                divisaoDominante: rm.divisaoDominante ?? rm.DivisaoDominante,
                corDivisaoDominante: rm.corDivisaoDominante ?? rm.CorDivisaoDominante,
                categoriasPresentes: String(rm.categoriasPresentes ?? rm.CategoriasPresentes ?? ""),
                temItens: Boolean(rm.temItens ?? rm.TemItens)
            };
        })() : null,
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
"[project]/app/lib/servicosApi.ts [app-client] (ecmascript) <export * as servicosApi>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "servicosApi",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicosApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicosApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/servicosApi.ts [app-client] (ecmascript)");
}),
"[project]/app/lib/geocoding.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Geocodificação inversa (coordenadas → morada) via Nominatim (OpenStreetMap).
 * Uso: preencher local, distrito, cidade, concelho ao clicar no mapa.
 */ __turbopack_context__.s([
    "getEnderecoFromCoords",
    ()=>getEnderecoFromCoords
]);
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT = "PirofafeApp/1.0 (contacto interno)";
async function getEnderecoFromCoords(lat, lng) {
    const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lng),
        format: "json",
        addressdetails: "1"
    });
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: {
            "User-Agent": USER_AGENT
        }
    });
    if (!res.ok) return {};
    const data = await res.json();
    const addr = data?.address;
    if (!addr || typeof addr !== "object") return {};
    // Portugal: state = distrito, county = concelho, town/village/city = cidade
    const state = addr.state ?? addr["state_district"] ?? "";
    const county = addr.county ?? addr.municipality ?? "";
    const cidade = addr.town ?? addr.city ?? addr.village ?? addr.municipality ?? addr.locality ?? "";
    const road = addr.road ?? "";
    const suburb = addr.suburb ?? addr.neighbourhood ?? "";
    const houseNumber = addr.house_number ?? "";
    const localPart = [
        road,
        houseNumber
    ].filter(Boolean).join(" ") || suburb || cidade || "";
    return {
        local: localPart.trim() || undefined,
        distrito: state.trim() || undefined,
        cidade: cidade.trim() || undefined,
        municipio: county.trim() || undefined
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/MapaCoordenadas.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapaCoordenadas
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Bloco reutilizável: mapa Leaflet + campos Latitude/Longitude.
 * Em modo edição, ao clicar no mapa as coordenadas são preenchidas e, opcionalmente, local/distrito/cidade/concelho (geocodificação inversa).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$geocoding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/geocoding.ts [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const MapaLeaflet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/app/components/MapaLeaflet.tsx [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/app/components/MapaLeaflet.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = MapaLeaflet;
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const inputClass = "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";
function MapaCoordenadas({ readOnly = false, lat = "", lng = "", raioMetros: raioProp, onLatChange, onLngChange, onRaioChange, onAddressFromCoords, mapContainerId = "mapa-paiol-container", className = "" }) {
    _s();
    const [geocodeLoading, setGeocodeLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const latStr = lat !== undefined && lat !== "" ? String(lat) : "";
    const lngStr = lng !== undefined && lng !== "" ? String(lng) : "";
    const raioStr = raioProp !== undefined && raioProp !== "" ? String(raioProp) : "";
    const latNum = latStr ? Number(latStr) : undefined;
    const lngNum = lngStr ? Number(lngStr) : undefined;
    const raioNum = raioStr ? Number(raioStr) : undefined;
    const temCoordenadas = latNum != null && lngNum != null && Number.isFinite(latNum) && Number.isFinite(lngNum);
    const mostraRaio = onRaioChange != null;
    const handleMapClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MapaCoordenadas.useCallback[handleMapClick]": async (latVal, lngVal)=>{
            if (readOnly) return;
            onLatChange?.(String(latVal));
            onLngChange?.(String(lngVal));
            if (onAddressFromCoords) {
                setGeocodeLoading(true);
                try {
                    const address = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$geocoding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEnderecoFromCoords"])(latVal, lngVal);
                    onAddressFromCoords(address);
                } catch  {
                // falha silenciosa; coordenadas já foram preenchidas
                } finally{
                    setGeocodeLoading(false);
                }
            }
        }
    }["MapaCoordenadas.useCallback[handleMapClick]"], [
        readOnly,
        onLatChange,
        onLngChange,
        onAddressFromCoords
    ]);
    const center = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MapaCoordenadas.useMemo[center]": ()=>{
            if (temCoordenadas) return [
                latNum,
                lngNum
            ];
            return [
                39.5,
                -8
            ];
        }
    }["MapaCoordenadas.useMemo[center]"], [
        temCoordenadas,
        latNum,
        lngNum
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: mapContainerId,
                className: "rounded-xl overflow-hidden border border-gray-200 dark:border-[#222]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapaLeaflet, {
                    center: center,
                    zoom: temCoordenadas ? 15 : 7,
                    height: "280px",
                    lat: latNum,
                    lng: lngNum,
                    raioMetros: raioNum != null && Number.isFinite(raioNum) && raioNum > 0 ? raioNum : undefined,
                    onMapClick: !readOnly ? handleMapClick : undefined,
                    mapId: mapContainerId
                }, void 0, false, {
                    fileName: "[project]/app/components/MapaCoordenadas.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-xs text-gray-500 dark:text-gray-400",
                children: [
                    readOnly ? "Localização no mapa." : "Clique no mapa para definir a latitude e longitude.",
                    onAddressFromCoords && !readOnly && " Local, cidade, distrito e concelho serão preenchidos automaticamente.",
                    geocodeLoading && " A obter morada…",
                    mostraRaio && temCoordenadas && " Indique o raio ao público (m) para ver o círculo no mapa."
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 grid gap-4 sm:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "coordenadas-lat",
                                className: labelClass,
                                children: "Latitude"
                            }, void 0, false, {
                                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this),
                            readOnly ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                id: "coordenadas-lat",
                                className: "mt-1 text-gray-900 dark:text-white",
                                children: latStr || "—"
                            }, void 0, false, {
                                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                                lineNumber: 105,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "coordenadas-lat",
                                type: "number",
                                step: "any",
                                value: latStr,
                                onChange: (e)=>onLatChange?.(e.target.value),
                                className: inputClass,
                                placeholder: "Ex.: 38.72 (ou clique no mapa)",
                                "aria-describedby": mapContainerId
                            }, void 0, false, {
                                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                                lineNumber: 109,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/MapaCoordenadas.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "coordenadas-lng",
                                className: labelClass,
                                children: "Longitude"
                            }, void 0, false, {
                                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                                lineNumber: 122,
                                columnNumber: 11
                            }, this),
                            readOnly ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                id: "coordenadas-lng",
                                className: "mt-1 text-gray-900 dark:text-white",
                                children: lngStr || "—"
                            }, void 0, false, {
                                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                                lineNumber: 126,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "coordenadas-lng",
                                type: "number",
                                step: "any",
                                value: lngStr,
                                onChange: (e)=>onLngChange?.(e.target.value),
                                className: inputClass,
                                placeholder: "Ex.: -9.14 (ou clique no mapa)",
                                "aria-describedby": mapContainerId
                            }, void 0, false, {
                                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                                lineNumber: 130,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/MapaCoordenadas.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this),
            mostraRaio && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "raio-publico-mapa",
                        className: labelClass,
                        children: "Raio ao público (m)"
                    }, void 0, false, {
                        fileName: "[project]/app/components/MapaCoordenadas.tsx",
                        lineNumber: 145,
                        columnNumber: 11
                    }, this),
                    readOnly ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        id: "raio-publico-mapa",
                        className: "mt-1 text-gray-900 dark:text-white",
                        children: raioStr || "—"
                    }, void 0, false, {
                        fileName: "[project]/app/components/MapaCoordenadas.tsx",
                        lineNumber: 149,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: "raio-publico-mapa",
                        type: "number",
                        min: 0,
                        step: "any",
                        value: raioStr,
                        onChange: (e)=>onRaioChange?.(e.target.value),
                        className: inputClass,
                        placeholder: "Ex.: 500 — desenha um círculo no mapa",
                        "aria-describedby": mapContainerId
                    }, void 0, false, {
                        fileName: "[project]/app/components/MapaCoordenadas.tsx",
                        lineNumber: 153,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                lineNumber: 144,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/MapaCoordenadas.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
_s(MapaCoordenadas, "w3CvZCqQShjLet1Hf/3K3LP/SrM=");
_c1 = MapaCoordenadas;
var _c, _c1;
__turbopack_context__.k.register(_c, "MapaLeaflet");
__turbopack_context__.k.register(_c1, "MapaCoordenadas");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/servicos/novo/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NovoServicoPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/Navbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicos$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/lib/servicos.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicosApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__servicosApi$3e$__ = __turbopack_context__.i("[project]/app/lib/servicosApi.ts [app-client] (ecmascript) <export * as servicosApi>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/animations.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$MapaCoordenadas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/MapaCoordenadas.tsx [app-client] (ecmascript)");
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
const inputClass = "rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const btnPrimary = "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";
const btnSecondary = "rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-[#333] dark:text-gray-300";
function NovoServicoContent() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const encomendaIdParam = searchParams.get("encomendaId") ?? undefined;
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [encomendaId, setEncomendaId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(encomendaIdParam ?? "");
    const [dataServico, setDataServico] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [local, setLocal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [distrito, setDistrito] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [cidade, setCidade] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [municipio, setMunicipio] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [coordenadasLat, setCoordenadasLat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [coordenadasLng, setCoordenadasLng] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [raioPublico, setRaioPublico] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [publicoPrivado, setPublicoPrivado] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [responsavelTecnicoId, setResponsavelTecnicoId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [equipaIds, setEquipaIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [observacoes, setObservacoes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [erro, setErro] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])();
    const encomendaPreselect = encomendaIdParam ? parseInt(encomendaIdParam, 10) : undefined;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NovoServicoContent.useEffect": ()=>{
            const t = setTimeout({
                "NovoServicoContent.useEffect.t": ()=>setMounted(true)
            }["NovoServicoContent.useEffect.t"], 0);
            return ({
                "NovoServicoContent.useEffect": ()=>clearTimeout(t)
            })["NovoServicoContent.useEffect"];
        }
    }["NovoServicoContent.useEffect"], []);
    const { data: createData, isLoading: loadingForm } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "servicos",
            "create",
            encomendaPreselect ?? "none"
        ],
        queryFn: {
            "NovoServicoContent.useQuery": async ()=>{
                const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])();
                if (!t) throw new Error("no-token");
                return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicosApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__servicosApi$3e$__["servicosApi"].fetchServicosCreate(t, encomendaPreselect);
            }
        }["NovoServicoContent.useQuery"],
        enabled: mounted && !!token,
        retry: false
    });
    const encomendasDisponiveis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NovoServicoContent.useMemo[encomendasDisponiveis]": ()=>{
            if (!createData) return [];
            return (createData.encomendas ?? []).map({
                "NovoServicoContent.useMemo[encomendasDisponiveis]": (e)=>({
                        id: e.id,
                        texto: e.texto ?? ""
                    })
            }["NovoServicoContent.useMemo[encomendasDisponiveis]"]);
        }
    }["NovoServicoContent.useMemo[encomendasDisponiveis]"], [
        createData
    ]);
    const responsaveis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NovoServicoContent.useMemo[responsaveis]": ()=>{
            if (!createData) return [];
            return (createData.responsaveisTecnicos ?? []).map({
                "NovoServicoContent.useMemo[responsaveis]": (f)=>({
                        id: f.id ?? f.Id,
                        nomeCompleto: String(f.nomeCompleto ?? f.NomeCompleto ?? "")
                    })
            }["NovoServicoContent.useMemo[responsaveis]"]);
        }
    }["NovoServicoContent.useMemo[responsaveis]"], [
        createData
    ]);
    const funcionariosEquipa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NovoServicoContent.useMemo[funcionariosEquipa]": ()=>{
            if (!createData) return [];
            return (createData.funcionariosEquipa ?? []).map({
                "NovoServicoContent.useMemo[funcionariosEquipa]": (f)=>({
                        id: f.id ?? f.Id,
                        nomeCompleto: String(f.nomeCompleto ?? f.NomeCompleto ?? "")
                    })
            }["NovoServicoContent.useMemo[funcionariosEquipa]"]);
        }
    }["NovoServicoContent.useMemo[funcionariosEquipa]"], [
        createData
    ]);
    const createMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "NovoServicoContent.useMutation[createMutation]": async (fd)=>{
                const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])();
                if (!t) throw new Error("Sessão inválida. Faça login.");
                return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicosApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__servicosApi$3e$__["servicosApi"].postServico(t, fd);
            }
        }["NovoServicoContent.useMutation[createMutation]"],
        onSuccess: {
            "NovoServicoContent.useMutation[createMutation]": (res)=>{
                const servico = res.servico;
                const newId = servico?.id ?? servico?.Id;
                if (newId != null) router.push(`/servicos/${String(newId)}`);
                else setErro("Resposta inválida do servidor.");
            }
        }["NovoServicoContent.useMutation[createMutation]"],
        onError: {
            "NovoServicoContent.useMutation[createMutation]": (err)=>{
                setErro(err.message || "Erro ao criar serviço.");
            }
        }["NovoServicoContent.useMutation[createMutation]"]
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NovoServicoContent.useEffect": ()=>{
            if (!encomendaIdParam || encomendaId) return;
            const t = setTimeout({
                "NovoServicoContent.useEffect.t": ()=>setEncomendaId(encomendaIdParam)
            }["NovoServicoContent.useEffect.t"], 0);
            return ({
                "NovoServicoContent.useEffect": ()=>clearTimeout(t)
            })["NovoServicoContent.useEffect"];
        }
    }["NovoServicoContent.useEffect"], [
        encomendaIdParam,
        encomendaId
    ]);
    const toggleEquipa = (id)=>{
        setEquipaIds((prev)=>{
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (createMutation.isPending) return;
        setErro(null);
        if (!encomendaId || !dataServico || !publicoPrivado) {
            setErro("Preencha Encomenda, Data do serviço e Público/Privado.");
            return;
        }
        const enc = encomendasDisponiveis.find((en)=>String(en.id) === encomendaId);
        if (!enc) {
            setErro("Encomenda inválida ou já utilizada noutro serviço.");
            return;
        }
        const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])();
        if (!t) {
            setErro("Sessão inválida. Faça login.");
            return;
        }
        const fd = new FormData();
        fd.append("Servico.EncomendaId", encomendaId);
        fd.append("Servico.DataServico", dataServico);
        fd.append("Servico.PublicoPrivado", publicoPrivado);
        if (local.trim()) fd.append("Servico.Local", local.trim());
        if (distrito.trim()) fd.append("Servico.Distrito", distrito.trim());
        if (cidade.trim()) fd.append("Servico.Cidade", cidade.trim());
        if (municipio.trim()) fd.append("Servico.Municipio", municipio.trim());
        if (coordenadasLat) fd.append("Servico.CoordenadasLat", coordenadasLat);
        if (coordenadasLng) fd.append("Servico.CoordenadasLng", coordenadasLng);
        if (raioPublico) fd.append("Servico.RaioPublico", raioPublico);
        if (responsavelTecnicoId) fd.append("Servico.ResponsavelTecnicoId", responsavelTecnicoId);
        if (observacoes.trim()) fd.append("Servico.Observacoes", observacoes.trim());
        Array.from(equipaIds).forEach((fid)=>fd.append("EquipaIds", fid));
        await createMutation.mutateAsync(fd);
    };
    if (!mounted || loadingForm) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
            }, void 0, false, {
                fileName: "[project]/app/servicos/novo/page.tsx",
                lineNumber: 159,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/servicos/novo/page.tsx",
            lineNumber: 158,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/servicos/novo/page.tsx",
                lineNumber: 166,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "px-6 pt-14 pb-10 sm:px-8",
                style: {
                    paddingTop: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CONTENT_OFFSET_TOP"]
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-2xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-2xl font-semibold tracking-tight sm:text-3xl",
                                    children: "Novo serviço"
                                }, void 0, false, {
                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                    lineNumber: 170,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-sm text-[#57534e] dark:text-gray-400",
                                    children: "Associe uma encomenda concluída e preencha os dados do evento."
                                }, void 0, false, {
                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                    lineNumber: 171,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/servicos/novo/page.tsx",
                            lineNumber: 169,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].form, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: {
                                ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                delay: 0.05
                            },
                            onSubmit: handleSubmit,
                            className: "mt-8 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]",
                            children: [
                                erro && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300",
                                    children: erro
                                }, void 0, false, {
                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                    lineNumber: 184,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "encomendaId",
                                                    className: labelClass,
                                                    children: "Encomenda *"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 191,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "encomendaId",
                                                    required: true,
                                                    value: encomendaId,
                                                    onChange: (e)=>setEncomendaId(e.target.value),
                                                    className: inputClass + " w-full",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "— Selecione —"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                                            lineNumber: 201,
                                                            columnNumber: 19
                                                        }, this),
                                                        encomendasDisponiveis.map((e)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: String(e.id),
                                                                children: "texto" in e && e.texto ? e.texto : `#${e.id} — ${e.cliente?.nome ?? e.clienteId ?? ""} (${e.dataConclusao ? new Date(e.dataConclusao).toLocaleDateString("pt-PT") : ""})`
                                                            }, String(e.id), false, {
                                                                fileName: "[project]/app/servicos/novo/page.tsx",
                                                                lineNumber: 203,
                                                                columnNumber: 21
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 194,
                                                    columnNumber: 17
                                                }, this),
                                                encomendasDisponiveis.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-sm text-amber-600 dark:text-amber-400",
                                                    children: "Não há encomendas concluídas disponíveis. Conclua uma encomenda primeiro."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 209,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                            lineNumber: 190,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "dataServico",
                                                    className: labelClass,
                                                    children: "Data do serviço *"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 216,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    id: "dataServico",
                                                    type: "date",
                                                    required: true,
                                                    value: dataServico,
                                                    onChange: (e)=>setDataServico(e.target.value),
                                                    className: inputClass + " w-full"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 219,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                            lineNumber: 215,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "publicoPrivado",
                                                    className: labelClass,
                                                    children: "Público / Privado *"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 230,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "publicoPrivado",
                                                    required: true,
                                                    value: publicoPrivado,
                                                    onChange: (e)=>setPublicoPrivado(e.target.value),
                                                    className: inputClass + " w-full",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "— Selecione —"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                                            lineNumber: 240,
                                                            columnNumber: 19
                                                        }, this),
                                                        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicos$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PUBLICO_PRIVADO"].map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: v,
                                                                children: v
                                                            }, v, false, {
                                                                fileName: "[project]/app/servicos/novo/page.tsx",
                                                                lineNumber: 242,
                                                                columnNumber: 21
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 233,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                            lineNumber: 229,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "responsavelTecnicoId",
                                                    className: labelClass,
                                                    children: "Responsável técnico"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 250,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "responsavelTecnicoId",
                                                    value: responsavelTecnicoId,
                                                    onChange: (e)=>{
                                                        const id = e.target.value;
                                                        setResponsavelTecnicoId(id);
                                                        if (id) setEquipaIds((prev)=>new Set(prev).add(id));
                                                    },
                                                    className: inputClass + " w-full",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "— Selecione —"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                                            lineNumber: 263,
                                                            columnNumber: 19
                                                        }, this),
                                                        responsaveis.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: String(f.id),
                                                                children: f.nomeCompleto
                                                            }, String(f.id), false, {
                                                                fileName: "[project]/app/servicos/novo/page.tsx",
                                                                lineNumber: 265,
                                                                columnNumber: 21
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 253,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                            lineNumber: 249,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: labelClass,
                                                    children: "Equipa"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 273,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-xs text-[#57534e] dark:text-gray-400",
                                                    children: "Funcionários com licença de operador. O responsável técnico fica sempre na equipa."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 274,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                    className: "mt-2 space-y-1",
                                                    children: funcionariosEquipa.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "flex cursor-pointer items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "checkbox",
                                                                        checked: equipaIds.has(String(f.id)) || responsavelTecnicoId === String(f.id),
                                                                        onChange: ()=>responsavelTecnicoId !== String(f.id) && toggleEquipa(String(f.id)),
                                                                        disabled: responsavelTecnicoId === String(f.id),
                                                                        className: "rounded border-gray-300"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/servicos/novo/page.tsx",
                                                                        lineNumber: 281,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: f.nomeCompleto
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/servicos/novo/page.tsx",
                                                                        lineNumber: 288,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    responsavelTecnicoId === String(f.id) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs text-[#57534e] dark:text-gray-400",
                                                                        children: "(responsável)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/servicos/novo/page.tsx",
                                                                        lineNumber: 290,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/servicos/novo/page.tsx",
                                                                lineNumber: 280,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, String(f.id), false, {
                                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                                            lineNumber: 279,
                                                            columnNumber: 21
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 277,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                            lineNumber: 272,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "local",
                                                    className: labelClass,
                                                    children: "Local"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 299,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    id: "local",
                                                    type: "text",
                                                    value: local,
                                                    onChange: (e)=>setLocal(e.target.value),
                                                    className: inputClass + " w-full"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 302,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                            lineNumber: 298,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid gap-4 sm:grid-cols-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "distrito",
                                                            className: labelClass,
                                                            children: "Distrito"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                                            lineNumber: 307,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "distrito",
                                                            type: "text",
                                                            value: distrito,
                                                            onChange: (e)=>setDistrito(e.target.value),
                                                            className: inputClass + " w-full"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                                            lineNumber: 310,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 306,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "cidade",
                                                            className: labelClass,
                                                            children: "Cidade"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                                            lineNumber: 313,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "cidade",
                                                            type: "text",
                                                            value: cidade,
                                                            onChange: (e)=>setCidade(e.target.value),
                                                            className: inputClass + " w-full"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                                            lineNumber: 316,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 312,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "municipio",
                                                            className: labelClass,
                                                            children: "Concelho"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                                            lineNumber: 319,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "municipio",
                                                            type: "text",
                                                            value: municipio,
                                                            onChange: (e)=>setMunicipio(e.target.value),
                                                            className: inputClass + " w-full"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                                            lineNumber: 322,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 318,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                            lineNumber: 305,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200",
                                                    children: "Localização no mapa"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 327,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$MapaCoordenadas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    readOnly: false,
                                                    lat: coordenadasLat,
                                                    lng: coordenadasLng,
                                                    raioMetros: raioPublico,
                                                    onLatChange: setCoordenadasLat,
                                                    onLngChange: setCoordenadasLng,
                                                    onRaioChange: setRaioPublico,
                                                    onAddressFromCoords: (addr)=>{
                                                        if (addr.local != null) setLocal(addr.local);
                                                        if (addr.distrito != null) setDistrito(addr.distrito);
                                                        if (addr.cidade != null) setCidade(addr.cidade);
                                                        if (addr.municipio != null) setMunicipio(addr.municipio);
                                                    },
                                                    mapContainerId: "mapa-servico-novo"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 328,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                            lineNumber: 326,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "observacoes",
                                                    className: labelClass,
                                                    children: "Observações"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 347,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                    id: "observacoes",
                                                    rows: 3,
                                                    value: observacoes,
                                                    onChange: (e)=>setObservacoes(e.target.value),
                                                    className: inputClass + " w-full"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                                    lineNumber: 350,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                            lineNumber: 346,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                    lineNumber: 189,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-8 flex flex-wrap gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            disabled: createMutation.isPending || encomendasDisponiveis.length === 0,
                                            className: btnPrimary,
                                            children: createMutation.isPending ? "A guardar…" : "Criar serviço"
                                        }, void 0, false, {
                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                            lineNumber: 361,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/servicos",
                                            className: btnSecondary,
                                            children: "Cancelar"
                                        }, void 0, false, {
                                            fileName: "[project]/app/servicos/novo/page.tsx",
                                            lineNumber: 364,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/servicos/novo/page.tsx",
                                    lineNumber: 360,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/servicos/novo/page.tsx",
                            lineNumber: 176,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/servicos/novo/page.tsx",
                    lineNumber: 168,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/servicos/novo/page.tsx",
                lineNumber: 167,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/servicos/novo/page.tsx",
        lineNumber: 165,
        columnNumber: 5
    }, this);
}
_s(NovoServicoContent, "zDRh297fLwiItYbDod8uZ98ZpUY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
_c = NovoServicoContent;
function NovoServicoPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
            }, void 0, false, {
                fileName: "[project]/app/servicos/novo/page.tsx",
                lineNumber: 380,
                columnNumber: 11
            }, void 0)
        }, void 0, false, {
            fileName: "[project]/app/servicos/novo/page.tsx",
            lineNumber: 379,
            columnNumber: 9
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NovoServicoContent, {}, void 0, false, {
            fileName: "[project]/app/servicos/novo/page.tsx",
            lineNumber: 384,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/servicos/novo/page.tsx",
        lineNumber: 377,
        columnNumber: 5
    }, this);
}
_c1 = NovoServicoPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "NovoServicoContent");
__turbopack_context__.k.register(_c1, "NovoServicoPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_12a1972b._.js.map