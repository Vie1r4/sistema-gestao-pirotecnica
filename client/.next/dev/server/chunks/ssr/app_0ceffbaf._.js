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
"[project]/app/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "safeParseJson",
    ()=>safeParseJson
]);
/**
 * Helpers para chamadas à API.
 * Evita o erro "Unexpected token '<'" quando o servidor devolve HTML em vez de JSON
 * (ex.: 404, API em baixo, URL errado).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiConfig.ts [app-ssr] (ecmascript)");
;
async function safeParseJson(res) {
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
        const text = await res.text();
        const isHtml = text.trimStart().startsWith("<");
        throw new Error(isHtml ? `O servidor devolveu uma página HTML em vez de JSON. Verifique se a API está a correr (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApiBaseUrl"])()}) e se o URL está correto.` : text || `Erro ${res.status}`);
    }
    return res.json();
}
}),
"[project]/app/lib/apiErrors.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/app/lib/encomendasApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchAdicionarItens",
    ()=>fetchAdicionarItens,
    "fetchCreate",
    ()=>fetchCreate,
    "fetchEncomendaDetalhe",
    ()=>fetchEncomendaDetalhe,
    "fetchEncomendaDetalheParaPagina",
    ()=>fetchEncomendaDetalheParaPagina,
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
/**
 * API Encomendas: lista, criar (create + adicionar-itens + adicionar/remover item + submeter),
 * detalhe, aceitar, rejeitar, preparar, registar-preparacao, concluir.
 * Para o fluxo de criação (draft no servidor) usar credentials: 'include' para manter sessão.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiConfig.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiErrors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiErrors.ts [app-ssr] (ecmascript)");
;
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}?${params}`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error(`Lista encomendas: ${res.status}`);
    return res.json();
}
async function fetchCreate(token, clienteId) {
    const q = clienteId != null ? `?clienteId=${clienteId}` : "";
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/create${q}`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error(`Create: ${res.status}`);
    return res.json();
}
async function postCreate(token, body) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/create`, {
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
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiErrors$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseApiErrorBody"])(data).message);
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/adicionar-itens?${params}`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/adicionar-item?${q}`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/remover-item?${q}`, {
        method: "POST",
        headers: authHeaders(token),
        credentials: "include"
    });
    if (!res.ok) throw new Error(`Remover-item: ${res.status}`);
    return res.json();
}
async function postSubmeter(token, body) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/submeter`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}/aceitar`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}/rejeitar`, {
        headers: authHeaders(token)
    });
    if (!res.ok) {
        const d = await res.json().catch(()=>({}));
        throw new Error(d.error ?? `Rejeitar GET: ${res.status}`);
    }
    return res.json();
}
async function postRejeitar(token, id, body) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}/rejeitar`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}/preparar`, {
        headers: authHeaders(token)
    });
    if (!res.ok) {
        const d = await res.json().catch(()=>({}));
        throw new Error(d.error ?? `Preparar: ${res.status}`);
    }
    return res.json();
}
async function postRegistarPreparacao(token, id, retiradas) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}/registar-preparacao`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}/concluir`, {
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}`, {
        headers: authHeaders(token)
    });
    if (res.status === 404) throw new Error("NOT_FOUND");
    if (!res.ok) throw new Error(`Detalhe: ${res.status}`);
    return res.json();
}
async function fetchEncomendaDetalheParaPagina(token, id) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}`, {
        headers: authHeaders(token)
    });
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeParseJson"])(res);
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
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPath"])("api/encomendas")}/${id}`, {
        method: "PUT",
        headers: jsonHeaders(token),
        body: JSON.stringify(payload)
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(data.error ?? `Atualizar: ${res.status}`);
    return data;
}
}),
"[project]/app/encomendas/[id]/preparar/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PrepararEncomendaPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/Navbar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$encomendasApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/encomendasApi.ts [app-ssr] (ecmascript)");
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
const inputClass = "w-20 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-right text-sm text-gray-900 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white";
const btnPrimary = "data-button rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-[opacity,background-color] duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]";
const btnDanger = "data-button rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950";
const btnSecondary = "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";
const TOL = 0.0001;
function PrepararEncomendaPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const id = params.id;
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [retiradas, setRetiradas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [expandedItemId, setExpandedItemId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /** Checklist visual por linha (não é enviado ao servidor). */ const [itensMarcados, setItensMarcados] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [erro, setErro] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const submittingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [apiData, setApiData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadingApi, setLoadingApi] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const idNum = parseInt(id, 10);
    const isApiId = !Number.isNaN(idNum);
    const stockPaiolProduto = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const m = new Map();
        if (apiData?.stockPaiolProduto) {
            for (const [k, v] of Object.entries(apiData.stockPaiolProduto))m.set(k, Number(v));
        }
        return m;
    }, [
        apiData?.stockPaiolProduto
    ]);
    const stockPorProdutoMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const m = new Map();
        if (apiData?.stockPorProduto) {
            for (const [k, v] of Object.entries(apiData.stockPorProduto))m.set(k, Number(v));
        }
        return m;
    }, [
        apiData?.stockPorProduto
    ]);
    const encomenda = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const base = apiData?.encomenda;
        if (!base) return null;
        return {
            ...base,
            stockPorProduto: stockPorProdutoMap
        };
    }, [
        apiData?.encomenda,
        stockPorProdutoMap
    ]);
    const paiois = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>apiData?.paiois ?? [], [
        apiData?.paiois
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
    }, [
        id
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!mounted || !isApiId) {
            setApiData(null);
            setLoadingApi(false);
            return;
        }
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getToken"])();
        if (!token) {
            setApiData(null);
            setLoadingApi(false);
            return;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$encomendasApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchPreparar"])(token, idNum).then((data)=>{
            const enc = data.encomenda;
            const itensRaw = enc?.itens ?? enc?.Itens ?? [];
            const itens = Array.isArray(itensRaw) ? itensRaw.map((i)=>{
                const gi = (k)=>i[k] ?? i[k.charAt(0).toUpperCase() + k.slice(1)];
                const prod = gi("produto") ?? gi("Produto");
                const prodObj = prod && typeof prod === "object" ? prod : null;
                return {
                    id: String(gi("id") ?? gi("Id") ?? ""),
                    produtoId: String(gi("produtoId") ?? gi("ProdutoId") ?? ""),
                    quantidadePedida: Number(gi("quantidadePedida") ?? gi("QuantidadePedida") ?? 0),
                    produto: prodObj ? {
                        nome: String(prodObj.nome ?? prodObj.Nome ?? "")
                    } : null,
                    produtoNome: prodObj ? String(prodObj.nome ?? prodObj.Nome ?? "") : undefined
                };
            }) : [];
            const dataAny = data;
            const paioisRaw = dataAny["paióis"] ?? dataAny["paiois"] ?? [];
            const paioisMapped = Array.isArray(paioisRaw) ? paioisRaw.map((p)=>({
                    id: String(p.id ?? ""),
                    nome: String(p.nome ?? "")
                })) : [];
            setApiData({
                encomenda: {
                    itens: itens,
                    cliente: enc?.cliente ?? enc?.Cliente,
                    clienteId: String(enc?.clienteId ?? enc?.ClienteId ?? "")
                },
                paiois: paioisMapped,
                stockPorProduto: data.stockPorProduto ?? {},
                stockPaiolProduto: data.stockPaiolProduto ?? {}
            });
        }).catch(()=>setApiData(null)).finally(()=>setLoadingApi(false));
    }, [
        mounted,
        id,
        idNum,
        isApiId
    ]);
    const toggleItemMarcado = (encomendaItemId)=>{
        setItensMarcados((prev)=>({
                ...prev,
                [encomendaItemId]: !prev[encomendaItemId]
            }));
    };
    const setRetirada = (encomendaItemId, paiolId, value)=>{
        setRetiradas((prev)=>{
            const next = {
                ...prev
            };
            if (!next[encomendaItemId]) next[encomendaItemId] = {};
            next[encomendaItemId] = {
                ...next[encomendaItemId],
                [paiolId]: value
            };
            return next;
        });
    };
    const getRetirada = (encomendaItemId, paiolId)=>retiradas[encomendaItemId]?.[paiolId] ?? 0;
    /** Paióis que têm stock deste produto (para mostrar só os relevantes na linha expandida) */ const paioisComStockPorItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        if (!encomenda) return map;
        for (const item of encomenda.itens){
            const lista = paiois.filter((p)=>(stockPaiolProduto.get(`${p.id}_${item.produtoId}`) ?? 0) > 0);
            map.set(item.id, lista);
        }
        return map;
    }, [
        encomenda,
        paiois,
        stockPaiolProduto
    ]);
    /** Texto resumo "P1: 5, P2: 3" para a coluna Retirar de */ const resumoRetiradas = (itemId)=>{
        const itemRet = retiradas[itemId];
        if (!itemRet) return "—";
        const partes = Object.entries(itemRet).filter(([, q])=>q > 0).map(([paiolId])=>{
            const p = paiois.find((x)=>x.id === paiolId);
            return p ? `${p.nome}: ${Number(itemRet[paiolId]).toFixed(4)}` : "";
        }).filter(Boolean);
        return partes.length > 0 ? partes.join(", ") : "—";
    };
    const somaPorItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        if (!encomenda) return map;
        for (const item of encomenda.itens){
            let s = 0;
            const itemRet = retiradas[item.id];
            if (itemRet) for (const q of Object.values(itemRet))s += q;
            map.set(item.id, s);
        }
        return map;
    }, [
        encomenda,
        retiradas
    ]);
    const validacaoOk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!encomenda) return false;
        return encomenda.itens.every((item)=>Math.abs((somaPorItem.get(item.id) ?? 0) - item.quantidadePedida) <= TOL);
    }, [
        encomenda,
        somaPorItem
    ]);
    const algumSemStockTotal = encomenda?.itens.some((item)=>(encomenda.stockPorProduto.get(item.produtoId) ?? 0) < item.quantidadePedida);
    if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
            }, void 0, false, {
                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                lineNumber: 194,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
            lineNumber: 193,
            columnNumber: 7
        }, this);
    }
    if (loadingApi && isApiId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getToken"])()) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
            }, void 0, false, {
                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                lineNumber: 202,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
            lineNumber: 201,
            columnNumber: 7
        }, this);
    }
    if (!encomenda) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                    lineNumber: 210,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    style: {
                        paddingTop: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CONTENT_OFFSET_TOP"]
                    },
                    className: "p-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600 dark:text-gray-400",
                            children: "Encomenda não encontrada ou estado não permite preparação (tem de estar Aceite)."
                        }, void 0, false, {
                            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                            lineNumber: 212,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/encomendas",
                            className: "mt-4 inline-block text-[#f97316] hover:underline",
                            children: "← Voltar às Encomendas"
                        }, void 0, false, {
                            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                            lineNumber: 215,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                    lineNumber: 211,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
            lineNumber: 209,
            columnNumber: 7
        }, this);
    }
    const handleRegistar = async (e)=>{
        e.preventDefault();
        if (submittingRef.current) return;
        setErro(null);
        if (!validacaoOk) {
            setErro("A soma das quantidades por produto deve ser igual à quantidade pedida.");
            return;
        }
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getToken"])();
        if (!isApiId || !token) {
            setErro("Sessão inválida. Faça login.");
            return;
        }
        const listaApi = [];
        for (const item of encomenda.itens){
            for (const p of paiois){
                const q = getRetirada(item.id, p.id);
                if (q > 0) {
                    listaApi.push({
                        encomendaItemId: parseInt(item.id, 10),
                        paiolId: parseInt(p.id, 10),
                        quantidade: q
                    });
                }
            }
        }
        submittingRef.current = true;
        setSubmitting(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$encomendasApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["postRegistarPreparacao"])(token, idNum, listaApi);
            router.push(`/encomendas/${id}?preparacao=1`);
        } catch (err) {
            setErro(err instanceof Error ? err.message : "Erro ao registar preparação.");
        } finally{
            submittingRef.current = false;
            setSubmitting(false);
        }
    };
    const clienteNome = encomenda.cliente?.nome ?? encomenda.clienteId;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                lineNumber: 266,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "relative px-6 pt-14 pb-10 sm:px-8",
                style: {
                    paddingTop: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CONTENT_OFFSET_TOP"]
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-5xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transitionSmooth"],
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "font-heading text-2xl tracking-tight sm:text-3xl",
                                    children: "Registar preparação"
                                }, void 0, false, {
                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                    lineNumber: 278,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-[#57534e] dark:text-gray-400",
                                    children: [
                                        "Encomenda #",
                                        id,
                                        " · Cliente: ",
                                        clienteNome
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                    lineNumber: 281,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                            lineNumber: 273,
                            columnNumber: 11
                        }, this),
                        algumSemStockTotal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: {
                                ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                delay: 0.03
                            },
                            className: "mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-amber-800 dark:text-amber-200",
                                children: "Algum item tem stock total insuficiente. Ajuste as quantidades por paiol ou rejeite a encomenda."
                            }, void 0, false, {
                                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                lineNumber: 293,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                            lineNumber: 287,
                            columnNumber: 13
                        }, this),
                        erro && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-6 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400",
                            children: erro
                        }, void 0, false, {
                            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                            lineNumber: 300,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: {
                                ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                delay: 0.05
                            },
                            className: "card-hover mt-10 rounded-2xl border border-[#e7e5e4] bg-white p-6 dark:border-[#1f1f1f] dark:bg-[#111] sm:p-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mb-4 text-sm text-[#57534e] dark:text-gray-400",
                                    children: "Para cada produto, indique de que paiol(s) retirar. A soma por produto deve ser igual à quantidade pedida. O sistema usa FIFO (primeiro a entrar, primeiro a sair). Use a coluna à esquerda para marcar o que já tem em mãos."
                                }, void 0, false, {
                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                    lineNumber: 311,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                    onSubmit: handleRegistar,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "overflow-x-auto",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                className: "w-full text-left text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "border-b border-[#e7e5e4] dark:border-[#222]",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "w-12 pb-2 pr-2 font-semibold text-[#444] dark:text-gray-300",
                                                                    scope: "col",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "sr-only",
                                                                        children: "Material pronto"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                        lineNumber: 321,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                    lineNumber: 320,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300",
                                                                    children: "Produto"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                    lineNumber: 323,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300",
                                                                    children: "Qtd pedida"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                    lineNumber: 324,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300",
                                                                    children: "Em stock"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                    lineNumber: 325,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300",
                                                                    children: "Retirar de"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                    lineNumber: 326,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "whitespace-nowrap pb-2 pr-4 font-semibold text-[#444] dark:text-gray-300",
                                                                    children: "Soma"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                    lineNumber: 327,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                            lineNumber: 319,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                        lineNumber: 318,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                        children: encomenda.itens.map((item)=>{
                                                            const stockTotal = encomenda.stockPorProduto.get(item.produtoId) ?? 0;
                                                            const soma = somaPorItem.get(item.id) ?? 0;
                                                            const ok = Math.abs(soma - item.quantidadePedida) <= TOL;
                                                            const paioisComStock = paioisComStockPorItem.get(item.id) ?? [];
                                                            const isExpanded = expandedItemId === item.id;
                                                            const marcado = !!itensMarcados[item.id];
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                        className: `border-b border-[#f5f5f4] dark:border-[#1a1a1a] ${marcado ? "bg-emerald-50/60 dark:bg-emerald-950/20" : ""}`,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "py-2 pr-2 align-middle",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    type: "button",
                                                                                    role: "checkbox",
                                                                                    "aria-checked": marcado,
                                                                                    "aria-label": `Marcar material pronto: ${item.produto?.nome ?? item.produtoId}`,
                                                                                    onClick: ()=>toggleItemMarcado(item.id),
                                                                                    className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 text-base leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316] ${marcado ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-600" : "border-[#d6d3d1] bg-white text-transparent hover:border-[#a8a29e] dark:border-[#444] dark:bg-[#1a1a1a] dark:hover:border-[#666]"}`,
                                                                                    children: marcado ? "✓" : "\u00a0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                    lineNumber: 344,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                lineNumber: 343,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "py-2 pr-4 font-medium text-[#1c1917] dark:text-white",
                                                                                children: item.produto?.nome ?? item.produtoId
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                lineNumber: 359,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400",
                                                                                children: item.quantidadePedida
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                lineNumber: 362,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "whitespace-nowrap py-2 pr-4 text-[#57534e] dark:text-gray-400",
                                                                                children: stockTotal
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                lineNumber: 365,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "py-2 pr-4",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-[#57534e] dark:text-gray-400",
                                                                                        children: resumoRetiradas(item.id)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                        lineNumber: 369,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    paioisComStock.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                        type: "button",
                                                                                        onClick: ()=>setExpandedItemId(isExpanded ? null : item.id),
                                                                                        className: "ml-2 rounded-lg border border-[#e7e5e4] bg-white px-2 py-1 text-xs font-medium text-[#57534e] hover:bg-[#fafaf9] dark:border-[#333] dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:bg-[#222]",
                                                                                        children: isExpanded ? "Fechar" : "Definir"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                        lineNumber: 371,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                lineNumber: 368,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: `whitespace-nowrap py-2 pr-4 font-medium ${ok ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`,
                                                                                children: soma.toFixed(4)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                lineNumber: 380,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                        lineNumber: 340,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    isExpanded && paioisComStock.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                        className: "border-b border-[#f5f5f4] bg-[#fafaf9] dark:border-[#1a1a1a] dark:bg-[#0d0d0d]",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                            colSpan: 6,
                                                                            className: "px-4 py-3",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "mb-2 text-xs font-medium uppercase tracking-wider text-[#78716c] dark:text-gray-500",
                                                                                    children: [
                                                                                        "Quantidade a retirar de cada paiol (soma = ",
                                                                                        item.quantidadePedida,
                                                                                        ")"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                    lineNumber: 387,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex flex-wrap gap-4",
                                                                                    children: paioisComStock.map((p)=>{
                                                                                        const key = `${p.id}_${item.produtoId}`;
                                                                                        const stockAqui = stockPaiolProduto.get(key) ?? 0;
                                                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex items-center gap-2",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                    htmlFor: `ret-${item.id}-${p.id}`,
                                                                                                    className: "min-w-[100px] text-sm text-[#57534e] dark:text-gray-400",
                                                                                                    children: [
                                                                                                        p.nome,
                                                                                                        " ",
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                            className: "text-[#78716c]",
                                                                                                            children: [
                                                                                                                "(máx. ",
                                                                                                                stockAqui,
                                                                                                                ")"
                                                                                                            ]
                                                                                                        }, void 0, true, {
                                                                                                            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                                            lineNumber: 397,
                                                                                                            columnNumber: 52
                                                                                                        }, this)
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                                    lineNumber: 396,
                                                                                                    columnNumber: 41
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    id: `ret-${item.id}-${p.id}`,
                                                                                                    type: "number",
                                                                                                    min: 0,
                                                                                                    max: stockAqui,
                                                                                                    step: "any",
                                                                                                    value: getRetirada(item.id, p.id) || "",
                                                                                                    onChange: (e)=>{
                                                                                                        const v = parseFloat(e.target.value.replace(",", "."));
                                                                                                        setRetirada(item.id, p.id, Number.isNaN(v) ? 0 : v);
                                                                                                    },
                                                                                                    className: inputClass,
                                                                                                    placeholder: "0"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                                    lineNumber: 399,
                                                                                                    columnNumber: 41
                                                                                                }, this)
                                                                                            ]
                                                                                        }, p.id, true, {
                                                                                            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                            lineNumber: 395,
                                                                                            columnNumber: 39
                                                                                        }, this);
                                                                                    })
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                                    lineNumber: 390,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                            lineNumber: 386,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                        lineNumber: 385,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, item.id, true, {
                                                                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                                lineNumber: 339,
                                                                columnNumber: 25
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                        lineNumber: 330,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                lineNumber: 317,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                            lineNumber: 316,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-8 flex flex-wrap gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    className: btnPrimary,
                                                    disabled: submitting || !validacaoOk,
                                                    children: submitting ? "A registar…" : "Registar preparação"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                    lineNumber: 428,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    href: `/encomendas/${id}/rejeitar`,
                                                    className: btnDanger,
                                                    children: "Rejeitar encomenda"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                    lineNumber: 431,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    href: `/encomendas/${id}`,
                                                    className: btnSecondary,
                                                    children: "Cancelar"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                                    lineNumber: 434,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                            lineNumber: 427,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                                    lineNumber: 315,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                            lineNumber: 305,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                    lineNumber: 272,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
                lineNumber: 268,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/encomendas/[id]/preparar/page.tsx",
        lineNumber: 265,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_0ceffbaf._.js.map