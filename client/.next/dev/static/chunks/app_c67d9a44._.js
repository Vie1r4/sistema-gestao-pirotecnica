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
"[project]/app/lib/funcionarios.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CARGOS",
    ()=>CARGOS
]);
const CARGOS = [
    "Admin",
    "Armazém",
    "Gestor",
    "Comercial"
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "safeParseJson",
    ()=>safeParseJson
]);
/**
 * Helpers para chamadas à API.
 * Evita o erro "Unexpected token '<'" quando o servidor devolve HTML em vez de JSON
 * (ex.: 404, API em baixo, URL errado).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiConfig.ts [app-client] (ecmascript)");
;
async function safeParseJson(res) {
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
        const text = await res.text();
        const isHtml = text.trimStart().startsWith("<");
        throw new Error(isHtml ? `O servidor devolveu uma página HTML em vez de JSON. Verifique se a API está a correr (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getApiBaseUrl"])()}) e se o URL está correto.` : text || `Erro ${res.status}`);
    }
    return res.json();
}
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
"[project]/app/lib/funcionariosApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteFuncionarioApi",
    ()=>deleteFuncionarioApi,
    "fetchCreate",
    ()=>fetchCreate,
    "fetchDeleteGet",
    ()=>fetchDeleteGet,
    "fetchFuncionarioEditGet",
    ()=>fetchFuncionarioEditGet,
    "fetchFuncionarioPorId",
    ()=>fetchFuncionarioPorId,
    "fetchFuncionariosLista",
    ()=>fetchFuncionariosLista,
    "mapApiItemToFuncionarioDetalhe",
    ()=>mapApiItemToFuncionarioDetalhe,
    "postCreate",
    ()=>postCreate,
    "postDesassociarConta",
    ()=>postDesassociarConta,
    "putFuncionario",
    ()=>putFuncionario
]);
/**
 * API Funcionários: GET {id} (detalhe), create (GET/POST), delete (GET/DELETE), desassociar (POST).
 * `fetchFuncionarioPorId` + `mapApiItemToFuncionarioDetalhe` alimentam detalhe e desassociar; lista/edit usam `fetchFuncionariosLista`, `fetchFuncionarioEditGet`, `putFuncionario`.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiConfig.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiErrors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiErrors.ts [app-client] (ecmascript)");
;
;
;
;
function authHeaders(token) {
    return {
        Authorization: `Bearer ${token}`
    };
}
async function fetchFuncionariosLista(token) {
    const res = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/funcionarios"), {
        headers: authHeaders(token)
    });
    if (!res.ok) {
        if (res.status === 401) throw new Error("UNAUTHORIZED");
        throw new Error(res.status === 404 ? "Recurso não encontrado." : "Erro ao carregar funcionários.");
    }
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeParseJson"])(res);
    const dataObj = data;
    const arr = Array.isArray(dataObj?.items) ? dataObj.items : [];
    return {
        items: arr
    };
}
async function fetchFuncionarioEditGet(token, id) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/funcionarios")}/${id}/edit`, {
        headers: authHeaders(token)
    });
    if (!res.ok) {
        if (res.status === 401) throw new Error("UNAUTHORIZED");
        const text = await res.text();
        throw new Error(res.status === 404 ? "Funcionário não encontrado." : text || `Erro ${res.status}`);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeParseJson"])(res);
}
async function putFuncionario(token, id, formData) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/funcionarios")}/${id}`, {
        method: "PUT",
        headers: authHeaders(token),
        body: formData
    });
    if (!res.ok) {
        const correlationId = res.headers.get(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_CORRELATION_ID_HEADER"]);
        let body = null;
        let nonJsonMessage = null;
        try {
            body = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeParseJson"])(res);
        } catch  {
            body = null;
            nonJsonMessage = "A API devolveu uma resposta não-JSON. Confirma se o backend está em Development e se a rota está correta.";
        }
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiErrors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseApiErrorBody"])(body);
        const baseMsg = nonJsonMessage ?? parsed.message ?? `Erro ${res.status}`;
        const msg = correlationId ? `${baseMsg} (correlationId: ${correlationId})` : baseMsg;
        throw new Error(msg);
    }
}
function mapApiItemToFuncionarioDetalhe(item, contaEmailConfirmada, associadoAoUtilizadorAtual) {
    const nome = item.nomeCompleto ?? item.NomeCompleto ?? item.nome ?? "";
    const hasCc = Boolean(item.hasCartaoCidadao ?? item.HasCartaoCidadao ?? item.cartaoCidadaoCaminho ?? item.CartaoCidadaoCaminho);
    const hasAdr = Boolean(item.hasDocumentoADR ?? item.HasDocumentoADR ?? item.documentoADDRCaminho ?? item.DocumentoADDRCaminho);
    const hasLic = Boolean(item.hasLicencaOperador ?? item.HasLicencaOperador ?? item.licencaOperadorCaminho ?? item.LicencaOperadorCaminho);
    const hasOutros = Boolean(item.hasOutros ?? item.HasOutros ?? item.outrosCaminho ?? item.OutrosCaminho);
    const apiExtras = item.documentosExtras ?? item.DocumentosExtras ?? [];
    const extras = apiExtras.map((ex)=>({
            id: String(ex.id ?? ex.Id ?? ""),
            nome: String(ex.nome ?? ex.Nome ?? "")
        }));
    const documentos = hasCc || hasAdr || hasLic || hasOutros || extras.length > 0 ? {
        cartaoCidadao: hasCc ? "cc" : undefined,
        adr: hasAdr ? "adr" : undefined,
        licencaOperador: hasLic ? "licenca" : undefined,
        outros: hasOutros ? "outros" : undefined,
        extras
    } : undefined;
    const contaEmailDaApi = item.contaEmailConfirmada ?? item.ContaEmailConfirmada;
    const emailConfirmado = typeof contaEmailDaApi === "boolean" ? contaEmailDaApi : contaEmailConfirmada ?? item.emailConfirmado;
    return {
        id: String(item.id ?? item.Id ?? ""),
        nomeCompleto: nome,
        nif: item.nif ?? item.NIF,
        email: item.email ?? item.Email,
        telefone: item.telefone ?? item.Telefone,
        morada: item.morada ?? item.Morada,
        nss: item.nss ?? item.NSS,
        iban: item.iban ?? item.IBAN,
        cargo: item.cargo ?? item.Cargo ?? "Comercial",
        notas: item.notas ?? item.Notas,
        dataRegisto: String(item.dataRegisto ?? item.DataRegisto ?? new Date().toISOString()),
        contaAssociada: Boolean(item.contaAssociada ?? item.ContaAssociada ?? item.userId ?? item.UserId),
        emailConfirmado,
        userId: item.userId ?? item.UserId,
        associadoAoUtilizadorAtual: associadoAoUtilizadorAtual ?? item.associadoAoUtilizadorAtual,
        documentos
    };
}
async function fetchFuncionarioPorId(token, id, opts) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/funcionarios")}/${id}`, {
        headers: authHeaders(token)
    });
    if (!res.ok) {
        if (res.status === 401) {
            opts?.onUnauthorized?.();
            throw new Error("Sessão expirada.");
        }
        const text = await res.text();
        throw new Error(res.status === 404 ? "Funcionário não encontrado." : text || `Erro ${res.status}`);
    }
    const value = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeParseJson"])(res);
    const data = value;
    const raw = data?.item ?? data;
    if (raw && typeof raw === "object") return mapApiItemToFuncionarioDetalhe(raw, data.contaEmailConfirmada, data.associadoAoUtilizadorAtual);
    return null;
}
async function fetchCreate(token) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/funcionarios")}/create`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error("Falha ao carregar formulário");
    return res.json();
}
async function postCreate(token, formData) {
    const res = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/funcionarios"), {
        method: "POST",
        headers: authHeaders(token),
        body: formData
    });
    const correlationId = res.headers.get(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_CORRELATION_ID_HEADER"]);
    let data = {};
    let nonJsonMessage = null;
    try {
        data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeParseJson"])(res);
    } catch (e) {
        data = {};
        nonJsonMessage = e instanceof Error ? e.message : "A API devolveu uma resposta não-JSON.";
    }
    if (!res.ok) {
        const msgBase = nonJsonMessage ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiErrors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseApiErrorBody"])(data).message;
        const msg = correlationId ? `${msgBase} (correlationId: ${correlationId})` : msgBase;
        throw new Error(msg);
    }
    return data;
}
async function fetchDeleteGet(token, id) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/funcionarios")}/${id}/delete`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error("Funcionário não encontrado");
    return res.json();
}
async function deleteFuncionarioApi(token, id) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/funcionarios")}/${id}`, {
        method: "DELETE",
        headers: authHeaders(token)
    });
    if (!res.ok && res.status !== 204) throw new Error("Falha ao eliminar");
}
async function postDesassociarConta(token, id) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/funcionarios")}/${id}/desassociar`, {
        method: "POST",
        headers: authHeaders(token)
    });
    if (res.ok) return;
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeParseJson"])(res).catch(()=>({}));
    if (res.status === 400 && data.error) throw new Error(data.error);
    if (res.status === 403) throw new Error("Sem permissão para desassociar contas.");
    throw new Error(data.error || "Ocorreu um erro ao desassociar a conta.");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/funcionarios/[id]/editar/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EditarFuncionarioPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/Navbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$funcionarios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/funcionarios.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/UserContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useToastStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/stores/useToastStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$funcionariosApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/funcionariosApi.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/animations.ts [app-client] (ecmascript)");
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
;
;
function mapApiItemToFuncionario(item) {
    const nome = item.nomeCompleto ?? item.NomeCompleto ?? item.nome ?? "";
    const docs = item.documentos ?? item.Documentos;
    const rawCargo = String(item.cargo ?? item.Cargo ?? "Comercial");
    const cargoNormalizado = rawCargo.toLowerCase() === "técnico" || rawCargo.toLowerCase() === "tecnico" ? "Gestor" : rawCargo;
    const rawEmailConfirmado = item.contaEmailConfirmada ?? item.ContaEmailConfirmada ?? item.emailConfirmado ?? item.EmailConfirmado;
    return {
        id: String(item.id ?? item.Id ?? ""),
        nomeCompleto: nome,
        nif: item.nif ?? item.NIF,
        email: item.email ?? item.Email,
        telefone: item.telefone ?? item.Telefone,
        morada: item.morada ?? item.Morada,
        nss: item.numeroSegurancaSocial ?? item.nss ?? item.NSS,
        iban: item.iban ?? item.IBAN,
        cargo: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$funcionarios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CARGOS"].includes(cargoNormalizado) ? cargoNormalizado : "Comercial",
        notas: item.notas ?? item.Notas,
        dataRegisto: String(item.dataRegisto ?? item.DataRegisto ?? new Date().toISOString()),
        contaAssociada: Boolean(item.userId ?? item.UserId),
        emailConfirmado: typeof rawEmailConfirmado === "boolean" ? rawEmailConfirmado : item.emailConfirmado,
        userId: item.userId ?? item.UserId,
        documentos: docs
    };
}
const cardClass = "card-hover rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8";
const inputClass = "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const btnPrimary = "data-button rounded-xl bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";
const btnSecondary = "data-button rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-[border-color,background-color,color] duration-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";
function EditarFuncionarioPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const id = params.id;
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    const canGerirFuncionarios = (user?.permissions ?? []).includes("funcionarios.gerir");
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        nomeCompleto: "",
        nif: "",
        email: "",
        telefone: "",
        morada: "",
        nss: "",
        iban: "",
        cargo: "Gestor",
        notas: "",
        criarConta: false,
        contaEmail: "",
        contaPassword: "",
        contaConfirmar: "",
        contaPerfil: "Gestor"
    });
    const [docs, setDocs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        extras: []
    });
    const [ccFile, setCcFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [addrFile, setAddrFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [licFile, setLicFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [extrasFiles, setExtrasFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [removerCc, setRemoverCc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [removerAddr, setRemoverAddr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [removerLic, setRemoverLic] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [removerOutros, setRemoverOutros] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [removerExtraIds, setRemoverExtraIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const submittingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [existingDocHas, setExistingDocHas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        cartaoCidadao: false,
        documentoADR: false,
        licencaOperador: false,
        outros: false
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EditarFuncionarioPage.useEffect": ()=>{
            setMounted(true);
        }
    }["EditarFuncionarioPage.useEffect"], []);
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const { data: editValue, isLoading: loading, error: queryError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "funcionarios",
            id,
            "edit"
        ],
        queryFn: {
            "EditarFuncionarioPage.useQuery": async ()=>{
                const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])();
                if (!token) {
                    router.replace("/login");
                    throw new Error("Sessão expirada.");
                }
                try {
                    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$funcionariosApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchFuncionarioEditGet"])(token, id);
                } catch (e) {
                    if (e instanceof Error && e.message === "UNAUTHORIZED") {
                        router.replace("/login");
                        throw new Error("Não autenticado");
                    }
                    throw e;
                }
            }
        }["EditarFuncionarioPage.useQuery"],
        staleTime: 30 * 1000,
        retry: 2,
        enabled: !!id && !!(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])()
    });
    const funcionario = editValue && (editValue?.item ?? editValue) && typeof (editValue?.item ?? editValue) === "object" ? mapApiItemToFuncionario(editValue.item ?? editValue) : null;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EditarFuncionarioPage.useEffect": ()=>{
            if (!editValue) return;
            const data = editValue;
            const raw = data?.item ?? data;
            if (!raw || typeof raw !== "object") return;
            const rawItem = raw;
            const f = mapApiItemToFuncionario(rawItem);
            setForm({
                nomeCompleto: f.nomeCompleto,
                nif: f.nif ?? "",
                email: f.email ?? "",
                telefone: f.telefone ?? "",
                morada: f.morada ?? "",
                nss: f.nss ?? "",
                iban: f.iban ?? "",
                cargo: f.cargo,
                notas: f.notas ?? "",
                criarConta: !f.contaAssociada,
                contaEmail: data.contaEmail ?? f.email ?? "",
                contaPassword: "",
                contaConfirmar: "",
                contaPerfil: f.cargo
            });
            const hasCc = !!(rawItem.hasCartaoCidadao ?? rawItem.cartaoCidadaoCaminho ?? rawItem.CartaoCidadaoCaminho);
            const hasAdr = !!(rawItem.hasDocumentoADR ?? rawItem.documentoADDRCaminho ?? rawItem.DocumentoADDRCaminho);
            const hasLic = !!(rawItem.hasLicencaOperador ?? rawItem.licencaOperadorCaminho ?? rawItem.LicencaOperadorCaminho);
            const hasOutros = !!(rawItem.hasOutros ?? rawItem.outrosCaminho ?? rawItem.OutrosCaminho);
            const apiExtras = rawItem.documentosExtras ?? rawItem.DocumentosExtras ?? [];
            const extrasMapped = apiExtras.map({
                "EditarFuncionarioPage.useEffect.extrasMapped": (ex)=>({
                        id: String(ex.id ?? ex.Id ?? `ex-${Date.now()}-${Math.random().toString(36).slice(2)}`),
                        nome: String(ex.nome ?? ex.Nome ?? "")
                    })
            }["EditarFuncionarioPage.useEffect.extrasMapped"]);
            setDocs({
                ...f.documentos ?? {},
                cartaoCidadao: hasCc ? "cc" : f.documentos?.cartaoCidadao ?? undefined,
                adr: hasAdr ? "adr" : f.documentos?.adr ?? undefined,
                licencaOperador: hasLic ? "licenca" : f.documentos?.licencaOperador ?? undefined,
                outros: hasOutros ? "outros" : f.documentos?.outros ?? undefined,
                extras: extrasMapped.length > 0 ? extrasMapped : f.documentos?.extras ?? []
            });
            setCcFile(null);
            setAddrFile(null);
            setLicFile(null);
            setExtrasFiles(extrasMapped.map({
                "EditarFuncionarioPage.useEffect": ()=>null
            }["EditarFuncionarioPage.useEffect"]));
            setRemoverCc(false);
            setRemoverAddr(false);
            setRemoverLic(false);
            setRemoverOutros(false);
            setRemoverExtraIds([]);
            setExistingDocHas({
                cartaoCidadao: hasCc,
                documentoADR: hasAdr,
                licencaOperador: hasLic,
                outros: hasOutros
            });
        }
    }["EditarFuncionarioPage.useEffect"], [
        editValue
    ]);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (submittingRef.current) return;
        if (!funcionario) return;
        setMessage(null);
        if (!form.nomeCompleto.trim()) {
            setMessage({
                type: "error",
                text: "O nome completo é obrigatório."
            });
            return;
        }
        if (form.nif && !/^\d{9}$/.test(form.nif.replace(/\s/g, ""))) {
            setMessage({
                type: "error",
                text: "O NIF deve ter nove dígitos."
            });
            return;
        }
        if (form.criarConta && !funcionario.contaAssociada) {
            if (!form.contaEmail.trim()) {
                setMessage({
                    type: "error",
                    text: "O email da conta de acesso é obrigatório."
                });
                return;
            }
            if (form.contaPassword.length < 6) {
                setMessage({
                    type: "error",
                    text: "A palavra-passe deve ter pelo menos 6 caracteres."
                });
                return;
            }
            if (form.contaPassword !== form.contaConfirmar) {
                setMessage({
                    type: "error",
                    text: "A palavra-passe e a confirmação não coincidem."
                });
                return;
            }
        }
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])();
        if (!token) {
            setMessage({
                type: "error",
                text: "Sessão inválida. Faça login novamente."
            });
            router.replace("/login");
            return;
        }
        const fd = new FormData();
        fd.append("Funcionario.Id", id);
        fd.append("Funcionario.NomeCompleto", form.nomeCompleto.trim());
        fd.append("Funcionario.NIF", form.nif.trim());
        fd.append("Funcionario.Email", form.email.trim());
        fd.append("Funcionario.Telefone", form.telefone.trim());
        fd.append("Funcionario.Morada", form.morada.trim());
        fd.append("Funcionario.NSS", form.nss.trim());
        fd.append("Funcionario.IBAN", form.iban.trim());
        fd.append("Funcionario.Cargo", form.cargo);
        fd.append("Funcionario.Notas", form.notas.trim());
        if (funcionario.userId) fd.append("Funcionario.UserId", funcionario.userId);
        fd.append("CriarConta", form.criarConta.toString());
        fd.append("ContaEmail", form.contaEmail);
        fd.append("ContaPassword", form.contaPassword);
        fd.append("ContaConfirmPassword", form.contaConfirmar);
        // Backend força a role da conta = cargo do funcionário (fonte única de verdade)
        fd.append("ContaRole", form.cargo);
        fd.append("RemoverCartaoCidadao", removerCc.toString());
        fd.append("RemoverDocumentoADDR", removerAddr.toString());
        fd.append("RemoverLicencaOperador", removerLic.toString());
        fd.append("RemoverOutrosAntigo", removerOutros.toString());
        removerExtraIds.forEach((extraId, i)=>fd.append(`RemoverDocumentoExtraIds[${i}]`, String(extraId)));
        if (ccFile) fd.append("CartaoCidadaoFicheiro", ccFile);
        if (addrFile) fd.append("DocumentoADDRFicheiro", addrFile);
        if (licFile) fd.append("LicencaOperadorFicheiro", licFile);
        docs.extras.forEach((ex, i)=>{
            const file = extrasFiles[i];
            if (file) {
                fd.append(`DocumentosExtras[${i}].Nome`, ex.nome.trim() || `Documento ${i + 1}`);
                fd.append(`DocumentosExtras[${i}].Ficheiro`, file);
            }
        });
        submittingRef.current = true;
        mutation.mutate(fd);
    };
    const mutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "EditarFuncionarioPage.useMutation[mutation]": async (fd)=>{
                const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])();
                if (!token) throw new Error("Sessão inválida.");
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$funcionariosApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["putFuncionario"])(token, id, fd);
            }
        }["EditarFuncionarioPage.useMutation[mutation]"],
        onSuccess: {
            "EditarFuncionarioPage.useMutation[mutation]": ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useToastStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToastStore"].getState().show("Alterações guardadas.", "success");
                queryClient.invalidateQueries({
                    queryKey: [
                        "funcionarios"
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        "funcionarios",
                        id
                    ]
                });
                router.push(`/funcionarios/${id}?editado=1`);
            }
        }["EditarFuncionarioPage.useMutation[mutation]"],
        onError: {
            "EditarFuncionarioPage.useMutation[mutation]": (err)=>setMessage({
                    type: "error",
                    text: err.message || "Erro ao guardar."
                })
        }["EditarFuncionarioPage.useMutation[mutation]"],
        onSettled: {
            "EditarFuncionarioPage.useMutation[mutation]": ()=>{
                submittingRef.current = false;
            }
        }["EditarFuncionarioPage.useMutation[mutation]"]
    });
    const addDocExtraRow = ()=>{
        setDocs((d)=>({
                ...d,
                extras: [
                    ...d.extras,
                    {
                        id: `ex-${Date.now()}`,
                        nome: ""
                    }
                ]
            }));
        setExtrasFiles((f)=>[
                ...f,
                null
            ]);
    };
    const removeDocExtra = (docId)=>{
        const idx = docs.extras.findIndex((e)=>e.id === docId);
        const numId = parseInt(docId, 10);
        if (!isNaN(numId)) setRemoverExtraIds((prev)=>[
                ...prev,
                numId
            ]);
        setDocs((d)=>({
                ...d,
                extras: d.extras.filter((e)=>e.id !== docId)
            }));
        if (idx >= 0) setExtrasFiles((f)=>f.filter((_, i)=>i !== idx));
    };
    const setExtraNome = (id, nome)=>{
        setDocs((d)=>({
                ...d,
                extras: d.extras.map((e)=>e.id === id ? {
                        ...e,
                        nome: nome.slice(0, 100)
                    } : e)
            }));
    };
    const mostraBlocoFicheiros = !!docs.cartaoCidadao || !!docs.adr || !!docs.licencaOperador || docs.extras.length > 0;
    const FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png";
    if (!mounted || loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
            }, void 0, false, {
                fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                lineNumber: 323,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
            lineNumber: 322,
            columnNumber: 7
        }, this);
    }
    if (queryError || !funcionario) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                    lineNumber: 330,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    style: {
                        paddingTop: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CONTENT_OFFSET_TOP"]
                    },
                    className: "p-8",
                    children: [
                        queryError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400",
                            children: queryError instanceof Error ? queryError.message : "Erro ao carregar."
                        }, void 0, false, {
                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                            lineNumber: 333,
                            columnNumber: 13
                        }, this),
                        !queryError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600 dark:text-gray-400",
                            children: "Funcionário não encontrado."
                        }, void 0, false, {
                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                            lineNumber: 337,
                            columnNumber: 27
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/funcionarios",
                            "data-button": true,
                            className: "mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline",
                            children: "← Voltar"
                        }, void 0, false, {
                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                            lineNumber: 338,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                    lineNumber: 331,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
            lineNumber: 329,
            columnNumber: 7
        }, this);
    }
    if (!canGerirFuncionarios) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                    lineNumber: 346,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    style: {
                        paddingTop: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CONTENT_OFFSET_TOP"]
                    },
                    className: "p-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600 dark:text-gray-400",
                            children: "Apenas utilizadores Admin podem editar funcionários."
                        }, void 0, false, {
                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                            lineNumber: 348,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: `/funcionarios/${id}`,
                            "data-button": true,
                            className: "mt-5 inline-block text-[#f97316] transition-[color] duration-200 hover:underline",
                            children: "← Voltar aos detalhes"
                        }, void 0, false, {
                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                            lineNumber: 349,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                    lineNumber: 347,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
            lineNumber: 345,
            columnNumber: 7
        }, this);
    }
    const mostrarCriarConta = !funcionario.contaAssociada;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#fafafa] text-gray-900 dark:bg-[#0a0a0a] dark:text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                lineNumber: 359,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "relative px-6 pt-14 pb-10 sm:px-8",
                style: {
                    paddingTop: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CONTENT_OFFSET_TOP"]
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-3xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "font-heading text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl",
                                    children: "Editar funcionário"
                                }, void 0, false, {
                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                    lineNumber: 367,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-gray-600 dark:text-gray-400",
                                    children: "Altere os dados da ficha. Pode substituir documentos e criar conta de acesso se ainda não existir."
                                }, void 0, false, {
                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                    lineNumber: 368,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                            lineNumber: 366,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            className: "mt-10 space-y-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].section, {
                                    initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                                    animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                                    transition: {
                                        ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                        delay: 0.05
                                    },
                                    className: cardClass,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-semibold text-gray-900 dark:text-white",
                                            children: "Dados pessoais"
                                        }, void 0, false, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 373,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-4 grid gap-4 sm:grid-cols-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "sm:col-span-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "nome",
                                                            className: labelClass,
                                                            children: "Nome completo *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 376,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "nome",
                                                            type: "text",
                                                            required: true,
                                                            value: form.nomeCompleto,
                                                            onChange: (e)=>setForm((f)=>({
                                                                        ...f,
                                                                        nomeCompleto: e.target.value
                                                                    })),
                                                            className: inputClass
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 377,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 375,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "nif",
                                                            className: labelClass,
                                                            children: "NIF"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 379,
                                                            columnNumber: 22
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "nif",
                                                            type: "text",
                                                            maxLength: 9,
                                                            value: form.nif,
                                                            onChange: (e)=>setForm((f)=>({
                                                                        ...f,
                                                                        nif: e.target.value.replace(/\D/g, "")
                                                                    })),
                                                            className: inputClass
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 379,
                                                            columnNumber: 77
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 379,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "email",
                                                            className: labelClass,
                                                            children: "Email"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 380,
                                                            columnNumber: 22
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "email",
                                                            type: "email",
                                                            value: form.email,
                                                            onChange: (e)=>setForm((f)=>({
                                                                        ...f,
                                                                        email: e.target.value
                                                                    })),
                                                            className: inputClass
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 380,
                                                            columnNumber: 81
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 380,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "telefone",
                                                            className: labelClass,
                                                            children: "Telefone"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 381,
                                                            columnNumber: 22
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "telefone",
                                                            type: "tel",
                                                            value: form.telefone,
                                                            onChange: (e)=>setForm((f)=>({
                                                                        ...f,
                                                                        telefone: e.target.value
                                                                    })),
                                                            className: inputClass
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 381,
                                                            columnNumber: 87
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 381,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "sm:col-span-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "morada",
                                                            className: labelClass,
                                                            children: "Morada"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 382,
                                                            columnNumber: 48
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "morada",
                                                            type: "text",
                                                            value: form.morada,
                                                            onChange: (e)=>setForm((f)=>({
                                                                        ...f,
                                                                        morada: e.target.value
                                                                    })),
                                                            className: inputClass
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 382,
                                                            columnNumber: 109
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 382,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "nss",
                                                            className: labelClass,
                                                            children: "N.º Segurança Social"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 383,
                                                            columnNumber: 22
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "nss",
                                                            type: "text",
                                                            value: form.nss,
                                                            onChange: (e)=>setForm((f)=>({
                                                                        ...f,
                                                                        nss: e.target.value
                                                                    })),
                                                            className: inputClass
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 383,
                                                            columnNumber: 94
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 383,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "iban",
                                                            className: labelClass,
                                                            children: "IBAN"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 384,
                                                            columnNumber: 22
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "iban",
                                                            type: "text",
                                                            value: form.iban,
                                                            onChange: (e)=>setForm((f)=>({
                                                                        ...f,
                                                                        iban: e.target.value
                                                                    })),
                                                            className: inputClass
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 384,
                                                            columnNumber: 79
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 384,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "sm:col-span-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "cargo",
                                                            className: labelClass,
                                                            children: "Cargo"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 385,
                                                            columnNumber: 48
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            id: "cargo",
                                                            value: form.cargo,
                                                            onChange: (e)=>setForm((f)=>({
                                                                        ...f,
                                                                        cargo: e.target.value
                                                                    })),
                                                            className: inputClass,
                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$funcionarios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CARGOS"].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: c,
                                                                    children: c
                                                                }, c, false, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 385,
                                                                    columnNumber: 275
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 385,
                                                            columnNumber: 107
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 385,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "sm:col-span-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "notas",
                                                            className: labelClass,
                                                            children: "Notas"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 386,
                                                            columnNumber: 48
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                            id: "notas",
                                                            rows: 3,
                                                            value: form.notas,
                                                            onChange: (e)=>setForm((f)=>({
                                                                        ...f,
                                                                        notas: e.target.value
                                                                    })),
                                                            className: inputClass
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 386,
                                                            columnNumber: 107
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 386,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 374,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                    lineNumber: 372,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].section, {
                                    initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                                    animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                                    transition: {
                                        ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                        delay: 0.1
                                    },
                                    className: cardClass,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-semibold text-gray-900 dark:text-white",
                                            children: "Documentos"
                                        }, void 0, false, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 391,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1 text-sm text-gray-600 dark:text-gray-400",
                                            children: "Marque os tipos de documento que pretende enviar ou substituir. Pode adicionar linhas com nome à escolha."
                                        }, void 0, false, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 392,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-4 flex flex-col gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "flex cursor-pointer items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: !!docs.cartaoCidadao,
                                                            onChange: (e)=>setDocs((d)=>({
                                                                        ...d,
                                                                        cartaoCidadao: e.target.checked ? "cc" : undefined
                                                                    })),
                                                            className: "h-4 w-4 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 395,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                            children: "Cartão de Cidadão"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 396,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 394,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "flex cursor-pointer items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: !!docs.adr,
                                                            onChange: (e)=>setDocs((d)=>({
                                                                        ...d,
                                                                        adr: e.target.checked ? "adr" : undefined
                                                                    })),
                                                            className: "h-4 w-4 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 399,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                            children: "ADR"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 400,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "flex cursor-pointer items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: !!docs.licencaOperador,
                                                            onChange: (e)=>setDocs((d)=>({
                                                                        ...d,
                                                                        licencaOperador: e.target.checked ? "licenca" : undefined
                                                                    })),
                                                            className: "h-4 w-4 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 403,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                            children: "Licença de Operador"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 404,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 402,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: addDocExtraRow,
                                                        "data-button": true,
                                                        className: "flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-[border-color,background-color,color] duration-200 hover:border-[#f97316] hover:bg-[#f97316]/5 hover:text-[#f97316] dark:border-[#444] dark:text-gray-400 dark:hover:border-[#f97316] dark:hover:text-[#f97316]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-lg leading-none",
                                                                children: "+"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                lineNumber: 408,
                                                                columnNumber: 21
                                                            }, this),
                                                            "Adicionar documento (nome à escolha)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                        lineNumber: 407,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 406,
                                                    columnNumber: 17
                                                }, this),
                                                docs.outros && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mt-2 flex cursor-pointer items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: removerOutros,
                                                            onChange: (e)=>setRemoverOutros(e.target.checked),
                                                            className: "h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 414,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                            children: "Remover documento «Outros» antigo"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 415,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 413,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 393,
                                            columnNumber: 15
                                        }, this),
                                        mostraBlocoFicheiros && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-[#222] dark:bg-[#0a0a0a]/50",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mb-4 text-sm font-medium text-gray-700 dark:text-gray-300",
                                                    children: "Campos de ficheiro"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 422,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col gap-4",
                                                    children: [
                                                        !!docs.cartaoCidadao && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "block text-sm font-medium text-gray-600 dark:text-gray-400",
                                                                    children: "Cartão de Cidadão"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 426,
                                                                    columnNumber: 25
                                                                }, this),
                                                                existingDocHas.cartaoCidadao ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    htmlFor: "editar-cc-ficheiro",
                                                                    className: "mt-1 flex cursor-pointer items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            id: "editar-cc-ficheiro",
                                                                            type: "file",
                                                                            name: "cartaoCidadaoFicheiro",
                                                                            accept: FILE_ACCEPT,
                                                                            className: "sr-only",
                                                                            onChange: (e)=>setCcFile(e.target.files?.[0] ?? null)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                            lineNumber: 429,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-gray-300 dark:hover:bg-[#222]",
                                                                            children: ccFile ? ccFile.name : "Alterar documento"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                            lineNumber: 437,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 428,
                                                                    columnNumber: 27
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "file",
                                                                    name: "cartaoCidadaoFicheiro",
                                                                    accept: FILE_ACCEPT,
                                                                    className: `${inputClass} mt-1`,
                                                                    onChange: (e)=>setCcFile(e.target.files?.[0] ?? null)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 442,
                                                                    columnNumber: 27
                                                                }, this),
                                                                existingDocHas.cartaoCidadao && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "mt-2 flex cursor-pointer items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "checkbox",
                                                                            checked: removerCc,
                                                                            onChange: (e)=>setRemoverCc(e.target.checked),
                                                                            className: "h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                            lineNumber: 452,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-sm text-red-600 dark:text-red-400",
                                                                            children: "Remover este documento"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                            lineNumber: 453,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 451,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 425,
                                                            columnNumber: 23
                                                        }, this),
                                                        !!docs.adr && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "block text-sm font-medium text-gray-600 dark:text-gray-400",
                                                                    children: "ADR"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 460,
                                                                    columnNumber: 25
                                                                }, this),
                                                                existingDocHas.documentoADR ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    htmlFor: "editar-adr-ficheiro",
                                                                    className: "mt-1 flex cursor-pointer items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            id: "editar-adr-ficheiro",
                                                                            type: "file",
                                                                            name: "documentoADDRFicheiro",
                                                                            accept: FILE_ACCEPT,
                                                                            className: "sr-only",
                                                                            onChange: (e)=>setAddrFile(e.target.files?.[0] ?? null)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                            lineNumber: 463,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-gray-300 dark:hover:bg-[#222]",
                                                                            children: addrFile ? addrFile.name : "Alterar documento"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                            lineNumber: 471,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 462,
                                                                    columnNumber: 27
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "file",
                                                                    name: "documentoADDRFicheiro",
                                                                    accept: FILE_ACCEPT,
                                                                    className: `${inputClass} mt-1`,
                                                                    onChange: (e)=>setAddrFile(e.target.files?.[0] ?? null)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 476,
                                                                    columnNumber: 27
                                                                }, this),
                                                                existingDocHas.documentoADR && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "mt-2 flex cursor-pointer items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "checkbox",
                                                                            checked: removerAddr,
                                                                            onChange: (e)=>setRemoverAddr(e.target.checked),
                                                                            className: "h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                            lineNumber: 486,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-sm text-red-600 dark:text-red-400",
                                                                            children: "Remover este documento"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                            lineNumber: 487,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 485,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 459,
                                                            columnNumber: 23
                                                        }, this),
                                                        !!docs.licencaOperador && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "block text-sm font-medium text-gray-600 dark:text-gray-400",
                                                                    children: "Licença de Operador"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 494,
                                                                    columnNumber: 25
                                                                }, this),
                                                                existingDocHas.licencaOperador ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    htmlFor: "editar-lic-ficheiro",
                                                                    className: "mt-1 flex cursor-pointer items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            id: "editar-lic-ficheiro",
                                                                            type: "file",
                                                                            name: "licencaOperadorFicheiro",
                                                                            accept: FILE_ACCEPT,
                                                                            className: "sr-only",
                                                                            onChange: (e)=>setLicFile(e.target.files?.[0] ?? null)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                            lineNumber: 497,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-gray-300 dark:hover:bg-[#222]",
                                                                            children: licFile ? licFile.name : "Alterar documento"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                            lineNumber: 505,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 496,
                                                                    columnNumber: 27
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "file",
                                                                    name: "licencaOperadorFicheiro",
                                                                    accept: FILE_ACCEPT,
                                                                    className: `${inputClass} mt-1`,
                                                                    onChange: (e)=>setLicFile(e.target.files?.[0] ?? null)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 510,
                                                                    columnNumber: 27
                                                                }, this),
                                                                existingDocHas.licencaOperador && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "mt-2 flex cursor-pointer items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "checkbox",
                                                                            checked: removerLic,
                                                                            onChange: (e)=>setRemoverLic(e.target.checked),
                                                                            className: "h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                            lineNumber: 520,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-sm text-red-600 dark:text-red-400",
                                                                            children: "Remover este documento"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                            lineNumber: 521,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 519,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 493,
                                                            columnNumber: 23
                                                        }, this),
                                                        docs.extras.map((ex, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-3 dark:border-[#222]",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "min-w-[200px] flex-1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "block text-sm font-medium text-gray-600 dark:text-gray-400",
                                                                                children: "Nome (máx. 100 caracteres)"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                                lineNumber: 529,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                type: "text",
                                                                                name: `DocumentosExtras[${i}].Nome`,
                                                                                maxLength: 100,
                                                                                value: ex.nome,
                                                                                onChange: (e)=>setExtraNome(ex.id, e.target.value),
                                                                                className: inputClass,
                                                                                placeholder: "Nome do documento"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                                lineNumber: 530,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                        lineNumber: 528,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "min-w-[200px] flex-1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "block text-sm font-medium text-gray-600 dark:text-gray-400",
                                                                                children: "Ficheiro"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                                lineNumber: 533,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                type: "file",
                                                                                name: `DocumentosExtras[${i}].Ficheiro`,
                                                                                accept: FILE_ACCEPT,
                                                                                className: `${inputClass} mt-1`,
                                                                                onChange: (e)=>{
                                                                                    setExtrasFiles((prev)=>{
                                                                                        const next = [
                                                                                            ...prev
                                                                                        ];
                                                                                        while(next.length <= i)next.push(null);
                                                                                        next[i] = e.target.files?.[0] ?? null;
                                                                                        return next;
                                                                                    });
                                                                                }
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                                lineNumber: 534,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                        lineNumber: 532,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: ()=>removeDocExtra(ex.id),
                                                                        className: "rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950",
                                                                        children: "Remover"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                        lineNumber: 549,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, ex.id, true, {
                                                                fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                lineNumber: 527,
                                                                columnNumber: 23
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 423,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 421,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                    lineNumber: 390,
                                    columnNumber: 13
                                }, this),
                                mostrarCriarConta ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].section, {
                                    initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                                    animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                                    transition: {
                                        ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                        delay: 0.15
                                    },
                                    className: cardClass,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-semibold text-gray-900 dark:text-white",
                                            children: "Conta de acesso ao sistema"
                                        }, void 0, false, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 559,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1 text-sm text-gray-600 dark:text-gray-400",
                                            children: "Este funcionário ainda não tem conta. Associar significa criar uma nova conta agora (email, palavra-passe, perfil) e ligá-la à ficha. Apenas utilizadores com permissão para gerir funcionários podem criar contas."
                                        }, void 0, false, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 560,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "mt-4 flex cursor-pointer items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: form.criarConta,
                                                    onChange: (e)=>setForm((f)=>({
                                                                ...f,
                                                                criarConta: e.target.checked
                                                            })),
                                                    className: "rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 562,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                    children: "Criar conta de acesso para este funcionário"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 563,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 561,
                                            columnNumber: 17
                                        }, this),
                                        form.criarConta && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-4 space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-gray-600 dark:text-gray-400",
                                                    children: "Email único no sistema; o sistema cria o utilizador, atribui o perfil e envia as credenciais e o link de confirmação por email."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 567,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "contaEmail",
                                                            className: labelClass,
                                                            children: "Email (para login, único no sistema) *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 568,
                                                            columnNumber: 26
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "contaEmail",
                                                            type: "email",
                                                            value: form.contaEmail,
                                                            onChange: (e)=>setForm((f)=>({
                                                                        ...f,
                                                                        contaEmail: e.target.value
                                                                    })),
                                                            className: inputClass,
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 568,
                                                            columnNumber: 123
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 568,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid gap-4 sm:grid-cols-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    htmlFor: "contaPassword",
                                                                    className: labelClass,
                                                                    children: "Palavra-passe"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 569,
                                                                    columnNumber: 69
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    id: "contaPassword",
                                                                    type: "password",
                                                                    value: form.contaPassword,
                                                                    onChange: (e)=>setForm((f)=>({
                                                                                ...f,
                                                                                contaPassword: e.target.value
                                                                            })),
                                                                    className: inputClass,
                                                                    placeholder: "Mín. 6 caracteres"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 569,
                                                                    columnNumber: 144
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 569,
                                                            columnNumber: 64
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    htmlFor: "contaConfirmar",
                                                                    className: labelClass,
                                                                    children: "Confirmar palavra-passe"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 569,
                                                                    columnNumber: 357
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    id: "contaConfirmar",
                                                                    type: "password",
                                                                    value: form.contaConfirmar,
                                                                    onChange: (e)=>setForm((f)=>({
                                                                                ...f,
                                                                                contaConfirmar: e.target.value
                                                                            })),
                                                                    className: inputClass
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                                    lineNumber: 569,
                                                                    columnNumber: 443
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 569,
                                                            columnNumber: 352
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 569,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "contaPerfil",
                                                            className: labelClass,
                                                            children: "Perfil de acesso (role)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 571,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "contaPerfil",
                                                            value: form.cargo,
                                                            readOnly: true,
                                                            className: inputClass
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 574,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-2 text-xs text-gray-500 dark:text-gray-400",
                                                            children: "O perfil é automaticamente igual ao cargo do funcionário."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                            lineNumber: 580,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                                    lineNumber: 570,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 566,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                    lineNumber: 558,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].section, {
                                    initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                                    animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                                    transition: {
                                        ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                        delay: 0.15
                                    },
                                    className: cardClass,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-semibold text-gray-900 dark:text-white",
                                            children: "Conta de acesso ao sistema"
                                        }, void 0, false, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 589,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 text-sm text-gray-600 dark:text-gray-400",
                                            children: "Este funcionário tem conta associada. O que altera em «O meu perfil» (nome, telefone) fica guardado na ficha do funcionário."
                                        }, void 0, false, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 590,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 font-medium text-gray-900 dark:text-white",
                                            children: [
                                                "Email da conta associada: ",
                                                funcionario.email ?? "—"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 591,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: `/funcionarios/${id}/desassociar`,
                                            "data-button": true,
                                            className: "mt-3 inline-block text-sm font-medium text-[#f97316] transition-[color] duration-200 hover:underline",
                                            children: "Desassociar conta"
                                        }, void 0, false, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 592,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                    lineNumber: 588,
                                    columnNumber: 15
                                }, this),
                                message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: `text-sm ${message.type === "error" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`,
                                    children: message.text
                                }, void 0, false, {
                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                    lineNumber: 596,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: btnPrimary,
                                            disabled: mutation.isPending,
                                            children: mutation.isPending ? "A guardar…" : "Guardar alterações"
                                        }, void 0, false, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 598,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: `/funcionarios/${id}`,
                                            className: btnSecondary,
                                            children: "Cancelar"
                                        }, void 0, false, {
                                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                                    lineNumber: 597,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                            lineNumber: 371,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                    lineNumber: 365,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
                lineNumber: 361,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/funcionarios/[id]/editar/page.tsx",
        lineNumber: 358,
        columnNumber: 5
    }, this);
}
_s(EditarFuncionarioPage, "TZYqa+HSB88VGw9oDdsDWJiYFqo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
_c = EditarFuncionarioPage;
var _c;
__turbopack_context__.k.register(_c, "EditarFuncionarioPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_c67d9a44._.js.map