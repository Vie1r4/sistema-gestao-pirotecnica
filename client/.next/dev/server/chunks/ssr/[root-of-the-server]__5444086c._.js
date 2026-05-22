module.exports = [
"[project]/app/components/Navbar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/UserContext.tsx [app-ssr] (ecmascript)");
"use client";
;
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
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const userName = user?.nome ?? null;
    const permissions = user?.permissions ?? [];
    const roles = user?.roles ?? [];
    const isAdminOrGestor = roles.includes("Admin") || roles.includes("Gestor");
    const visibleLinks = NAV_LINKS.filter((link)=>link.permission.some((p)=>permissions.includes(p))).filter((link)=>link.href === "/documentacao" ? isAdminOrGestor : true);
    const [scrolled, setScrolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sidebarOpen, setSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const hideTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onScroll = ()=>setScrolled(("TURBOPACK compile-time value", "undefined") !== "undefined" && window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, {
            passive: true
        });
        return ()=>window.removeEventListener("scroll", onScroll);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>clearHideTimeout();
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].header, {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                    user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/perfil",
                        "data-button": true,
                        className: "rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-4 py-2 text-sm font-medium text-[#444] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-[#d6d3d1] hover:bg-[#f5f5f4] hover:text-[#1c1917] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] dark:border-[#222] dark:bg-[#111]/80 dark:text-[#a0a0a0] dark:shadow-none dark:hover:border-[#333] dark:hover:bg-[#161616] dark:hover:text-white",
                        children: userName?.trim() ? userName : "Perfil"
                    }, void 0, false, {
                        fileName: "[project]/app/components/Navbar.tsx",
                        lineNumber: 115,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: user && sidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].aside, {
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
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-1 flex-col p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                className: "flex flex-col gap-2",
                                children: visibleLinks.map(({ label, href })=>{
                                    const isActive = pathname === href || pathname.startsWith(href + "/");
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        variants: navItem,
                                        transition: {
                                            duration: 0.35
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
}),
"[project]/app/lib/servicosApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiConfig.ts [app-ssr] (ecmascript)");
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}?${params}`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error(res.status === 401 ? "Não autenticado" : `Erro ${res.status}`);
    return res.json();
}
async function fetchServicosCreate(token, encomendaId) {
    const q = encomendaId != null ? `?encomendaId=${encomendaId}` : "";
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/create${q}`, {
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
    const res = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos"), {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}/edit`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}/delete`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}`, {
        method: "DELETE",
        headers: authHeaders(token)
    });
    if (!res.ok && res.status !== 204) throw new Error(`Erro ${res.status}`);
}
function documentoUrl(id, extraId) {
    const n = typeof id === "string" ? id : String(id);
    const e = typeof extraId === "string" ? extraId : String(extraId);
    return `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${n}/documentos/${e}`;
}
function licencaFicheiroUrl(id, licencaId) {
    const n = typeof id === "string" ? id : String(id);
    const l = typeof licencaId === "string" ? licencaId : String(licencaId);
    return `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${n}/licenca/${l}/ficheiro`;
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}/upload-licenca?${params}`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}/upload-licenca?${params}`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/servicos")}/${numId}/distancia-seguranca/${dId}`, {
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
}),
"[project]/app/lib/servicos.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicosApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/servicosApi.ts [app-ssr] (ecmascript)");
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
    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicosApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchServicos"](token, f, pagina, itensPorPagina);
    const lista = (res.lista ?? []).map((s)=>mapApiServicoToList(s));
    return {
        lista,
        total: res.totalRegistos ?? 0,
        clientes: res.clientes ?? []
    };
}
async function fetchServicoDetalheFromApi(token, id) {
    try {
        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicosApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchServicoById"](token, id);
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
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/worker_threads [external] (worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("worker_threads", () => require("worker_threads"));

module.exports = mod;
}),
"[project]/app/lib/documentacaoPdf.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "gerarAutorizacaoTestePdf",
    ()=>gerarAutorizacaoTestePdf,
    "gerarDeclaracaoTestePdf",
    ()=>gerarDeclaracaoTestePdf,
    "gerarLicencaTestePdf",
    ()=>gerarLicencaTestePdf
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.node.min.js [app-ssr] (ecmascript)");
;
function safe(v) {
    return v?.trim() ? v : "N/D";
}
function drawBrandHeader(doc, titulo, subtitulo, color) {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(0, 0, 210, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PIROFAFE", 20, 11.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Modelo de teste", 165, 11.5);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(titulo, 20, 28);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(subtitulo, 20, 34);
}
function drawQrPlaceholder(doc, x, y) {
    doc.setDrawColor(120, 120, 120);
    doc.rect(x, y, 28, 28);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("QR", x + 10, y + 15);
    doc.setFontSize(7);
    doc.text("placeholder", x + 4, y + 24);
}
function gerarDeclaracaoTestePdf(data) {
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsPDF"]({
        unit: "mm",
        format: "a4"
    });
    const hoje = new Date();
    const nomeFicheiro = `declaracao-teste-servico-${data.servicoId}.pdf`;
    drawBrandHeader(doc, "DECLARACAO (TESTE)", "Documento de exemplo gerado automaticamente para validacao de fluxo.", [
        194,
        65,
        12
    ]);
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 38, 190, 38);
    doc.setFontSize(12);
    doc.text(`Servico: #${safe(data.servicoId)}`, 20, 50);
    doc.text(`Cliente: ${safe(data.clienteNome)}`, 20, 58);
    doc.text(`Data do servico: ${safe(data.dataServico)}`, 20, 66);
    doc.text(`Local: ${safe(data.local)}`, 20, 74);
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Gerado em: ${hoje.toLocaleDateString("pt-PT")} ${hoje.toLocaleTimeString("pt-PT")}`, 20, 90);
    doc.text("Nota: este PDF e apenas um modelo temporario de teste.", 20, 97);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text("Assinatura:", 20, 124);
    doc.line(45, 124, 120, 124);
    drawQrPlaceholder(doc, 158, 112);
    doc.save(nomeFicheiro);
}
function gerarLicencaTestePdf(data) {
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsPDF"]({
        unit: "mm",
        format: "a4"
    });
    const hoje = new Date();
    const nomeFicheiro = `licenca-teste-servico-${data.servicoId}.pdf`;
    drawBrandHeader(doc, "LICENCA (MODELO DE TESTE)", "Documento provisório para validacao visual", [
        37,
        99,
        235
    ]);
    doc.setDrawColor(180, 180, 180);
    doc.rect(20, 40, 170, 46);
    doc.setFontSize(11);
    doc.text(`Servico: #${safe(data.servicoId)}`, 24, 50);
    doc.text(`Cliente: ${safe(data.clienteNome)}`, 24, 58);
    doc.text(`Data do servico: ${safe(data.dataServico)}`, 24, 66);
    doc.text(`Local: ${safe(data.local)}`, 24, 74);
    doc.setFont("helvetica", "bold");
    doc.text("Termos (teste):", 20, 100);
    doc.setFont("helvetica", "normal");
    const termos = [
        "- Este documento nao substitui licencas oficiais.",
        "- Usar apenas para validar layout e fluxo de geracao.",
        "- Campos e texto serao ajustados quando existir modelo final."
    ];
    termos.forEach((linha, i)=>doc.text(linha, 24, 108 + i * 7));
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Gerado em ${hoje.toLocaleDateString("pt-PT")} ${hoje.toLocaleTimeString("pt-PT")}`, 20, 136);
    doc.setTextColor(0, 0, 0);
    doc.line(20, 164, 85, 164);
    doc.line(125, 164, 190, 164);
    doc.text("Responsavel", 20, 170);
    doc.text("Entidade", 125, 170);
    drawQrPlaceholder(doc, 158, 112);
    doc.save(nomeFicheiro);
}
function gerarAutorizacaoTestePdf(data) {
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsPDF"]({
        unit: "mm",
        format: "a4"
    });
    const hoje = new Date();
    const nomeFicheiro = `autorizacao-teste-servico-${data.servicoId}.pdf`;
    drawBrandHeader(doc, "AUTORIZACAO DE EVENTO (TESTE)", "Modelo demonstrativo para validacao de processo", [
        22,
        163,
        74
    ]);
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    const texto1 = `Declara-se, para efeitos de teste de sistema, que o serviço #${safe(data.servicoId)} ` + `relativo ao cliente ${safe(data.clienteNome)} encontra-se registado para a data ${safe(data.dataServico)}.`;
    const texto2 = "Este modelo e meramente demonstrativo para validar o processo de geracao de PDFs e " + "a futura integracao com templates oficiais.";
    const linhas1 = doc.splitTextToSize(texto1, 170);
    const linhas2 = doc.splitTextToSize(texto2, 170);
    doc.text(linhas1, 20, 44);
    doc.text(linhas2, 20, 62);
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.text("Referencia interna: AUT-TESTE", 20, 88);
    doc.text(`Emitido em: ${hoje.toLocaleDateString("pt-PT")}`, 20, 94);
    doc.setFont("times", "normal");
    doc.rect(20, 108, 170, 56);
    doc.text("Observacoes:", 24, 116);
    doc.text("- Campo reservado para texto legal definitivo.", 24, 124);
    doc.text("- Campo reservado para referencias normativas.", 24, 132);
    doc.text("- Campo reservado para assinatura digital/QR.", 24, 140);
    doc.line(120, 188, 190, 188);
    doc.text("Assinatura", 145, 194);
    drawQrPlaceholder(doc, 158, 70);
    doc.save(nomeFicheiro);
}
}),
"[project]/app/documentacao/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DocumentacaoPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/Navbar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/UserContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicos$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/lib/servicos.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$documentacaoPdf$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/documentacaoPdf.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/animations.ts [app-ssr] (ecmascript)");
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
const btnSecondary = "data-button rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#333] dark:bg-[#111] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";
function DocumentacaoPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const { user, loading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getToken"])();
    const roles = user?.roles ?? [];
    const isAdminOrGestor = roles.includes("Admin") || roles.includes("Gestor");
    const selectedServicoId = searchParams.get("servicoId") ?? "";
    const [gerandoPdf, setGerandoPdf] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (loading) return;
        if (!user) return;
        if (!isAdminOrGestor) router.replace("/");
    }, [
        loading,
        user,
        isAdminOrGestor,
        router
    ]);
    const { data, isLoading, error, isRefetching } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "documentacao",
            "servicos-picker"
        ],
        queryFn: async ()=>{
            const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getToken"])();
            if (!t) throw new Error("Sessão expirada.");
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicos$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fetchServicosFromApi"])(t, undefined, 1, 200);
            return res.lista ?? [];
        },
        enabled: !!token && isAdminOrGestor,
        staleTime: 30 * 1000,
        retry: 2
    });
    const servicos = data ?? [];
    const selectedServico = servicos.find((s)=>String(s.id) === String(selectedServicoId)) ?? null;
    const dadosPdfBase = selectedServico ? {
        servicoId: String(selectedServico.id),
        dataServico: selectedServico.dataServico ? new Date(selectedServico.dataServico).toLocaleDateString("pt-PT") : undefined,
        clienteNome: selectedServico.cliente?.nome ?? selectedServico.clienteId,
        local: undefined
    } : null;
    const setServico = (servicoId)=>{
        const p = new URLSearchParams(searchParams.toString());
        if (servicoId) p.set("servicoId", servicoId);
        else p.delete("servicoId");
        router.replace(`/documentacao${p.toString() ? `?${p.toString()}` : ""}`);
    };
    const handleGerarDeclaracaoTeste = ()=>{
        if (!dadosPdfBase) return;
        setGerandoPdf(true);
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$documentacaoPdf$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["gerarDeclaracaoTestePdf"])(dadosPdfBase);
        } finally{
            setGerandoPdf(false);
        }
    };
    const handleGerarLicencaTeste = ()=>{
        if (!dadosPdfBase) return;
        setGerandoPdf(true);
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$documentacaoPdf$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["gerarLicencaTestePdf"])(dadosPdfBase);
        } finally{
            setGerandoPdf(false);
        }
    };
    const handleGerarAutorizacaoTeste = ()=>{
        if (!dadosPdfBase) return;
        setGerandoPdf(true);
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$documentacaoPdf$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["gerarAutorizacaoTestePdf"])(dadosPdfBase);
        } finally{
            setGerandoPdf(false);
        }
    };
    if (loading || user && !isAdminOrGestor) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
            }, void 0, false, {
                fileName: "[project]/app/documentacao/page.tsx",
                lineNumber: 109,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/documentacao/page.tsx",
            lineNumber: 108,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/documentacao/page.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "relative px-6 pt-14 pb-10 sm:px-8",
                style: {
                    paddingTop: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CONTENT_OFFSET_TOP"]
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-6xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transitionSmooth"],
                            className: "flex flex-col gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "font-heading text-2xl tracking-tight sm:text-3xl",
                                    children: "Documentação"
                                }, void 0, false, {
                                    fileName: "[project]/app/documentacao/page.tsx",
                                    lineNumber: 125,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-[#57534e] dark:text-gray-400",
                                    children: [
                                        "Esta página é apenas para gerar documentos de teste. O upload/anexo é feito no detalhe do serviço.",
                                        isRefetching && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "ml-2 text-xs text-[#78716c] dark:text-gray-500",
                                            children: "A atualizar…"
                                        }, void 0, false, {
                                            fileName: "[project]/app/documentacao/page.tsx",
                                            lineNumber: 128,
                                            columnNumber: 32
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/documentacao/page.tsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/documentacao/page.tsx",
                            lineNumber: 119,
                            columnNumber: 11
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-5 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400",
                            children: error instanceof Error ? error.message : "Erro ao carregar serviços."
                        }, void 0, false, {
                            fileName: "[project]/app/documentacao/page.tsx",
                            lineNumber: 133,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].section, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: {
                                ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                delay: 0.05
                            },
                            className: "mt-8 rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111] sm:p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "servico-doc-select",
                                    className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                                    children: "Serviço"
                                }, void 0, false, {
                                    fileName: "[project]/app/documentacao/page.tsx",
                                    lineNumber: 144,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    id: "servico-doc-select",
                                    value: selectedServicoId,
                                    onChange: (e)=>setServico(e.target.value),
                                    className: "mt-2 w-full max-w-xl rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white",
                                    disabled: isLoading,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "— Selecionar serviço —"
                                        }, void 0, false, {
                                            fileName: "[project]/app/documentacao/page.tsx",
                                            lineNumber: 154,
                                            columnNumber: 15
                                        }, this),
                                        servicos.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: s.id,
                                                children: [
                                                    "#",
                                                    s.id,
                                                    " · ",
                                                    new Date(s.dataServico).toLocaleDateString("pt-PT"),
                                                    " · ",
                                                    s.cliente?.nome ?? s.clienteId
                                                ]
                                            }, s.id, true, {
                                                fileName: "[project]/app/documentacao/page.tsx",
                                                lineNumber: 156,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/documentacao/page.tsx",
                                    lineNumber: 147,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/documentacao/page.tsx",
                            lineNumber: 138,
                            columnNumber: 11
                        }, this),
                        selectedServico && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].section, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: {
                                ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                delay: 0.08
                            },
                            className: "mt-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold",
                                    children: [
                                        "Gerar documentos - Serviço #",
                                        selectedServico.id
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/documentacao/page.tsx",
                                    lineNumber: 170,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-sm text-[#57534e] dark:text-gray-400",
                                    children: [
                                        new Date(selectedServico.dataServico).toLocaleDateString("pt-PT"),
                                        " · ",
                                        selectedServico.cliente?.nome ?? selectedServico.clienteId
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/documentacao/page.tsx",
                                    lineNumber: 171,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-5 flex flex-wrap gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleGerarDeclaracaoTeste,
                                            disabled: gerandoPdf,
                                            className: "rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#444] dark:text-gray-300 dark:hover:bg-[#1a1a1a]",
                                            children: gerandoPdf ? "A gerar PDF..." : "Gerar declaração (teste)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/documentacao/page.tsx",
                                            lineNumber: 176,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleGerarLicencaTeste,
                                            disabled: gerandoPdf,
                                            className: "rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#444] dark:text-gray-300 dark:hover:bg-[#1a1a1a]",
                                            children: gerandoPdf ? "A gerar PDF..." : "Gerar licença (teste)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/documentacao/page.tsx",
                                            lineNumber: 184,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleGerarAutorizacaoTeste,
                                            disabled: gerandoPdf,
                                            className: "rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#444] dark:text-gray-300 dark:hover:bg-[#1a1a1a]",
                                            children: gerandoPdf ? "A gerar PDF..." : "Gerar autorização (teste)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/documentacao/page.tsx",
                                            lineNumber: 192,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/documentacao/page.tsx",
                                    lineNumber: 175,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-4 text-sm text-[#57534e] dark:text-gray-400",
                                    children: "Depois de validar o ficheiro gerado, anexe-o na secção de documentação do detalhe do serviço."
                                }, void 0, false, {
                                    fileName: "[project]/app/documentacao/page.tsx",
                                    lineNumber: 201,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/servicos/${selectedServico.id}`,
                                    className: btnSecondary + " mt-4 inline-flex",
                                    children: "Abrir detalhe do serviço"
                                }, void 0, false, {
                                    fileName: "[project]/app/documentacao/page.tsx",
                                    lineNumber: 204,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/documentacao/page.tsx",
                            lineNumber: 164,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/documentacao/page.tsx",
                    lineNumber: 118,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/documentacao/page.tsx",
                lineNumber: 117,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/documentacao/page.tsx",
        lineNumber: 115,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5444086c._.js.map