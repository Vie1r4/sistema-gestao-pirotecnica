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
"[project]/app/lib/geocoding.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/app/components/MapaCoordenadas.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapaCoordenadas
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Bloco reutilizável: mapa Leaflet + campos Latitude/Longitude.
 * Em modo edição, ao clicar no mapa as coordenadas são preenchidas e, opcionalmente, local/distrito/cidade/concelho (geocodificação inversa).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$geocoding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/geocoding.ts [app-ssr] (ecmascript)");
;
"use client";
;
;
;
;
const MapaLeaflet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/app/components/MapaLeaflet.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const inputClass = "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500";
function MapaCoordenadas({ readOnly = false, lat = "", lng = "", raioMetros: raioProp, onLatChange, onLngChange, onRaioChange, onAddressFromCoords, mapContainerId = "mapa-paiol-container", className = "" }) {
    const [geocodeLoading, setGeocodeLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const latStr = lat !== undefined && lat !== "" ? String(lat) : "";
    const lngStr = lng !== undefined && lng !== "" ? String(lng) : "";
    const raioStr = raioProp !== undefined && raioProp !== "" ? String(raioProp) : "";
    const latNum = latStr ? Number(latStr) : undefined;
    const lngNum = lngStr ? Number(lngStr) : undefined;
    const raioNum = raioStr ? Number(raioStr) : undefined;
    const temCoordenadas = latNum != null && lngNum != null && Number.isFinite(latNum) && Number.isFinite(lngNum);
    const mostraRaio = onRaioChange != null;
    const handleMapClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (latVal, lngVal)=>{
        if (readOnly) return;
        onLatChange?.(String(latVal));
        onLngChange?.(String(lngVal));
        if (onAddressFromCoords) {
            setGeocodeLoading(true);
            try {
                const address = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$geocoding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEnderecoFromCoords"])(latVal, lngVal);
                onAddressFromCoords(address);
            } catch  {
            // falha silenciosa; coordenadas já foram preenchidas
            } finally{
                setGeocodeLoading(false);
            }
        }
    }, [
        readOnly,
        onLatChange,
        onLngChange,
        onAddressFromCoords
    ]);
    const center = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (temCoordenadas) return [
            latNum,
            lngNum
        ];
        return [
            39.5,
            -8
        ];
    }, [
        temCoordenadas,
        latNum,
        lngNum
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: className,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: mapContainerId,
                className: "rounded-xl overflow-hidden border border-gray-200 dark:border-[#222]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MapaLeaflet, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 grid gap-4 sm:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "coordenadas-lat",
                                className: labelClass,
                                children: "Latitude"
                            }, void 0, false, {
                                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this),
                            readOnly ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                id: "coordenadas-lat",
                                className: "mt-1 text-gray-900 dark:text-white",
                                children: latStr || "—"
                            }, void 0, false, {
                                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                                lineNumber: 105,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "coordenadas-lng",
                                className: labelClass,
                                children: "Longitude"
                            }, void 0, false, {
                                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                                lineNumber: 122,
                                columnNumber: 11
                            }, this),
                            readOnly ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                id: "coordenadas-lng",
                                className: "mt-1 text-gray-900 dark:text-white",
                                children: lngStr || "—"
                            }, void 0, false, {
                                fileName: "[project]/app/components/MapaCoordenadas.tsx",
                                lineNumber: 126,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
            mostraRaio && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "raio-publico-mapa",
                        className: labelClass,
                        children: "Raio ao público (m)"
                    }, void 0, false, {
                        fileName: "[project]/app/components/MapaCoordenadas.tsx",
                        lineNumber: 145,
                        columnNumber: 11
                    }, this),
                    readOnly ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        id: "raio-publico-mapa",
                        className: "mt-1 text-gray-900 dark:text-white",
                        children: raioStr || "—"
                    }, void 0, false, {
                        fileName: "[project]/app/components/MapaCoordenadas.tsx",
                        lineNumber: 149,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
}),
"[project]/app/lib/produtos.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Catálogo de produtos (artigos) para stock no armazém.
 * Alinhado ao backend: Produto (NEM por unidade, FamiliaRisco, GrupoCompatibilidade, FiltroTecnico, Calibre).
 */ __turbopack_context__.s([
    "CALIBRES",
    ()=>CALIBRES,
    "CLASSIFICACOES_RISCO",
    ()=>CLASSIFICACOES_RISCO,
    "FILTROS_TECNICOS",
    ()=>FILTROS_TECNICOS,
    "GRUPOS_COMPATIBILIDADE",
    ()=>GRUPOS_COMPATIBILIDADE,
    "textoCalibre",
    ()=>textoCalibre,
    "textoClassificacao",
    ()=>textoClassificacao,
    "textoFiltroTecnico",
    ()=>textoFiltroTecnico,
    "textoGrupo",
    ()=>textoGrupo,
    "validarNemPorUnidade",
    ()=>validarNemPorUnidade
]);
const CLASSIFICACOES_RISCO = [
    "1.1",
    "1.2",
    "1.3",
    "1.4",
    "1.4S",
    "1.5",
    "1.6"
];
const GRUPOS_COMPATIBILIDADE = [
    {
        value: "G",
        text: "G — Artigos pirotécnicos (foguetes, morteiros, F3/F4)"
    },
    {
        value: "S",
        text: "S — Artigos muito seguros (F1/F2)"
    },
    {
        value: "C",
        text: "C — Pólvoras / propulsoras"
    },
    {
        value: "B",
        text: "B — Iniciadores (detonadores, espoletas)"
    },
    {
        value: "D",
        text: "D — Explosivos secundários sem espoleta"
    }
];
const FILTROS_TECNICOS = [
    {
        value: "Baterias",
        text: "Baterias (Cakes)"
    },
    {
        value: "BombasArremesso",
        text: "Bombas de Arremesso (Shells)"
    },
    {
        value: "Morteiros",
        text: "Morteiros (Mortars)"
    },
    {
        value: "Foguetes",
        text: "Foguetes (Rockets)"
    },
    {
        value: "Cascatas",
        text: "Cascatas / Fontes"
    },
    {
        value: "Bengalas",
        text: "Bengalas (Sparklers)"
    },
    {
        value: "Candelas",
        text: "Candelas (Roman Candles)"
    },
    {
        value: "Monotiros",
        text: "Monotiros (Single Shots)"
    },
    {
        value: "GerbsVulcoes",
        text: "Gerbs / Vulcões"
    }
];
const CALIBRES = [
    {
        value: "MuitoPequeno",
        text: "< 20 mm"
    },
    {
        value: "BateriasPadrao",
        text: "20–30 mm"
    },
    {
        value: "BombasPequenas",
        text: "50–75 mm"
    },
    {
        value: "BombasMedias",
        text: "100–125 mm"
    },
    {
        value: "BombasGrandes",
        text: "> 150 mm"
    }
];
function validarNemPorUnidade(val) {
    return typeof val === "number" && !Number.isNaN(val) && val >= 0.0001;
}
function textoClassificacao(valor) {
    if (!valor) return "—";
    return valor === "1.4S" ? valor : `${valor}G`;
}
function textoGrupo(valor) {
    if (!valor) return "—";
    const g = GRUPOS_COMPATIBILIDADE.find((x)=>x.value === valor);
    return g?.text ?? valor;
}
function textoFiltroTecnico(valor) {
    if (!valor) return "—";
    const f = FILTROS_TECNICOS.find((x)=>x.value === valor);
    return f?.text ?? valor;
}
function textoCalibre(valor) {
    if (!valor) return "—";
    const c = CALIBRES.find((x)=>x.value === valor);
    return c?.text ?? valor;
}
}),
"[project]/app/servicos/[id]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ServicoDetalhePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/Navbar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$MapaCoordenadas$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/MapaCoordenadas.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/UserContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicos$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/lib/servicos.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$produtos$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/produtos.ts [app-ssr] (ecmascript)");
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
;
const btnSecondary = "data-button rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]";
const btnDanger = "data-button rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950";
function ServicoDetalhePage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const id = params.id;
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const permissions = user?.permissions ?? [];
    const canGerirServicos = permissions.includes("servicos.gerir");
    const canApagarServicos = permissions.includes("servicos.apagar");
    const [coordsCopied, setCoordsCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const { data: servico, isLoading: loadingApi, isRefetching, error: queryError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "servicos",
            id
        ],
        queryFn: async ()=>{
            const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getToken"])();
            if (!token) throw new Error("Sessão expirada.");
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$servicos$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fetchServicoDetalheFromApi"])(token, id);
        },
        staleTime: 30 * 1000,
        retry: 2,
        enabled: !!id && !!(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getToken"])()
    });
    const equipaOrdenada = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const eq = servico?.equipa;
        if (!eq?.length) return [];
        return [
            ...eq
        ].sort((a, b)=>(a.funcionario?.nomeCompleto ?? "").localeCompare(b.funcionario?.nomeCompleto ?? "", "pt", {
                sensitivity: "base"
            }));
    }, [
        servico?.equipa
    ]);
    const copyCoords = ()=>{
        if (servico?.coordenadasLat != null && servico?.coordenadasLng != null && ("TURBOPACK compile-time value", "undefined") !== "undefined") //TURBOPACK unreachable
        ;
    };
    if (loadingApi) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
            }, void 0, false, {
                fileName: "[project]/app/servicos/[id]/page.tsx",
                lineNumber: 68,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/servicos/[id]/page.tsx",
            lineNumber: 67,
            columnNumber: 7
        }, this);
    }
    if (queryError || !servico) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#f8f7f5] dark:bg-[#0a0a0a]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/app/servicos/[id]/page.tsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "px-6 pt-14 pb-10",
                    style: {
                        paddingTop: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CONTENT_OFFSET_TOP"]
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-auto max-w-2xl rounded-xl border border-[#e7e5e4] bg-white p-8 dark:border-[#1f1f1f] dark:bg-[#111]",
                        children: [
                            queryError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400",
                                children: queryError instanceof Error ? queryError.message : "Erro ao carregar serviço."
                            }, void 0, false, {
                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                lineNumber: 80,
                                columnNumber: 15
                            }, this),
                            !queryError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[#57534e] dark:text-gray-400",
                                children: "Serviço não encontrado."
                            }, void 0, false, {
                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                lineNumber: 84,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/servicos",
                                className: "mt-4 inline-block text-[#f97316] hover:underline",
                                children: "← Voltar à lista"
                            }, void 0, false, {
                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                lineNumber: 85,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/servicos/[id]/page.tsx",
                        lineNumber: 78,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/servicos/[id]/page.tsx",
                    lineNumber: 77,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/servicos/[id]/page.tsx",
            lineNumber: 75,
            columnNumber: 7
        }, this);
    }
    const localizacaoPartes = [
        servico.distrito,
        servico.cidade,
        servico.municipio
    ].filter(Boolean);
    const googleMapsUrl = servico.coordenadasLat != null && servico.coordenadasLng != null ? `https://www.google.com/maps?q=${servico.coordenadasLat},${servico.coordenadasLng}&z=17` : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#f8f7f5] text-[#1c1917] dark:bg-[#0a0a0a] dark:text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/servicos/[id]/page.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "relative px-6 pt-14 pb-10 sm:px-8",
                style: {
                    paddingTop: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CONTENT_OFFSET_TOP"]
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-4xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transitionSmooth"],
                            className: "flex flex-wrap items-start justify-between gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-2xl font-semibold tracking-tight sm:text-3xl",
                                            children: [
                                                "Serviço #",
                                                servico.id
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                            lineNumber: 113,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1 flex items-center gap-2 text-[#57534e] dark:text-gray-400",
                                            children: [
                                                new Date(servico.dataServico).toLocaleDateString("pt-PT"),
                                                " · ",
                                                servico.cliente?.nome ?? servico.clienteId,
                                                isRefetching && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1.5 text-xs text-[#78716c] dark:text-gray-500",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#f97316]"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                                            lineNumber: 118,
                                                            columnNumber: 21
                                                        }, this),
                                                        "A atualizar"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                                    lineNumber: 117,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                            lineNumber: 114,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-2",
                                    children: [
                                        servico.encomendaId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: `/encomendas/${servico.encomendaId}`,
                                            className: "rounded-xl border border-[#e7e5e4] bg-white px-4 py-2 text-sm font-medium dark:border-[#333] dark:bg-[#111]",
                                            children: [
                                                "Ver encomenda #",
                                                servico.encomendaId
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                            lineNumber: 126,
                                            columnNumber: 17
                                        }, this),
                                        canGerirServicos && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: `/servicos/${servico.id}/editar`,
                                            className: btnSecondary,
                                            children: "Editar"
                                        }, void 0, false, {
                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                            lineNumber: 134,
                                            columnNumber: 17
                                        }, this),
                                        canApagarServicos && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: `/servicos/${servico.id}/eliminar`,
                                            className: btnDanger,
                                            children: "Eliminar"
                                        }, void 0, false, {
                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                            lineNumber: 139,
                                            columnNumber: 17
                                        }, this),
                                        (user?.roles ?? []).some((r)=>r === "Admin" || r === "Gestor") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: `/documentacao?servicoId=${encodeURIComponent(String(servico.id))}`,
                                            className: btnSecondary,
                                            children: "Documentação"
                                        }, void 0, false, {
                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                            lineNumber: 144,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/servicos",
                                            className: btnSecondary,
                                            children: "Voltar à lista"
                                        }, void 0, false, {
                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                            lineNumber: 148,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 124,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/servicos/[id]/page.tsx",
                            lineNumber: 106,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].section, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: {
                                ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                delay: 0.05
                            },
                            className: "mt-8 overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-b border-[#e7e5e4] bg-[#fafaf9] px-5 py-4 sm:px-6 dark:border-[#222] dark:bg-[#141414]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold tracking-tight text-[#1c1917] dark:text-white",
                                        children: "Dados do serviço"
                                    }, void 0, false, {
                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                        lineNumber: 162,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 161,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col lg:flex-row lg:items-stretch",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0 flex-1 px-5 py-5 sm:px-6 sm:py-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                                className: "grid gap-x-6 gap-y-3.5 text-sm sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:gap-y-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                        className: "text-[#57534e] dark:text-gray-400 sm:pt-0.5",
                                                        children: "Cliente"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                                        lineNumber: 167,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                        className: "text-[#1c1917] dark:text-gray-100",
                                                        children: servico.cliente?.nome ?? servico.clienteId
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                                        lineNumber: 168,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                        className: "text-[#57534e] dark:text-gray-400 sm:pt-0.5",
                                                        children: "Data"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                                        lineNumber: 169,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                        className: "text-[#1c1917] dark:text-gray-100",
                                                        children: new Date(servico.dataServico).toLocaleDateString("pt-PT")
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                                        lineNumber: 170,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                        className: "text-[#57534e] dark:text-gray-400 sm:pt-0.5",
                                                        children: "Público / Privado"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                                        lineNumber: 173,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                        className: "text-[#1c1917] dark:text-gray-100",
                                                        children: servico.publicoPrivado ?? "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                                        lineNumber: 174,
                                                        columnNumber: 19
                                                    }, this),
                                                    servico.raioPublico != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                                className: "text-[#57534e] dark:text-gray-400 sm:pt-0.5",
                                                                children: "Raio público"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 177,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                                className: "text-[#1c1917] dark:text-gray-100",
                                                                children: [
                                                                    servico.raioPublico,
                                                                    " m"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 178,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true),
                                                    servico.local && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                                className: "text-[#57534e] dark:text-gray-400 sm:pt-0.5",
                                                                children: "Local"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 183,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                                className: "text-[#1c1917] dark:text-gray-100",
                                                                children: servico.local
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 184,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true),
                                                    localizacaoPartes.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                                className: "text-[#57534e] dark:text-gray-400 sm:pt-0.5",
                                                                children: "Localização"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 189,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                                className: "text-[#1c1917] dark:text-gray-100",
                                                                children: localizacaoPartes.join(" · ")
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 190,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true),
                                                    servico.coordenadasLat != null && servico.coordenadasLng != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                                className: "text-[#57534e] dark:text-gray-400 sm:pt-0.5",
                                                                children: "Coordenadas"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 195,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                                className: "flex flex-wrap items-center gap-2 text-[#1c1917] dark:text-gray-100",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "font-mono text-[0.8125rem]",
                                                                        children: [
                                                                            Number(servico.coordenadasLat).toFixed(4),
                                                                            "° N, ",
                                                                            Number(servico.coordenadasLng).toFixed(4),
                                                                            "° W"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                        lineNumber: 197,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    googleMapsUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                        href: googleMapsUrl,
                                                                        target: "_blank",
                                                                        rel: "noopener noreferrer",
                                                                        className: "text-[#f97316] hover:underline",
                                                                        children: "Abrir no Google Maps"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                        lineNumber: 201,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: copyCoords,
                                                                        className: "rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#333]",
                                                                        children: coordsCopied ? "Copiado" : "Copiar"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                        lineNumber: 210,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 196,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true),
                                                    servico.observacoes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                                className: "self-start text-[#57534e] dark:text-gray-400 sm:pt-0.5",
                                                                children: "Observações"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 222,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                                className: "whitespace-pre-wrap rounded-lg bg-[#fafaf9] p-3 text-[#292524] dark:bg-[#1a1a1a] dark:text-gray-200",
                                                                children: servico.observacoes
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 223,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                lineNumber: 166,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                            lineNumber: 165,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                                            className: "shrink-0 border-t border-[#e7e5e4] bg-[#fafaf9]/80 px-5 py-5 sm:px-6 sm:py-6 lg:w-[min(100%,18rem)] lg:border-t-0 lg:border-l lg:border-[#e7e5e4] dark:border-[#222] dark:bg-[#141414]/80",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "mb-4 text-sm font-semibold uppercase tracking-wide text-[#78716c] dark:text-gray-500",
                                                    children: "Equipa"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                                    lineNumber: 231,
                                                    columnNumber: 17
                                                }, this),
                                                equipaOrdenada.length === 0 && !servico.responsavelTecnico ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm leading-relaxed text-[#57534e] dark:text-gray-400",
                                                    children: "Nenhum funcionário foi associado a este serviço."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                                    lineNumber: 235,
                                                    columnNumber: 19
                                                }, this) : equipaOrdenada.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                    className: "space-y-1",
                                                    children: equipaOrdenada.map((m, equipaIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            className: "flex flex-wrap items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-white/80 dark:hover:bg-[#1f1f1f]/80",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                    href: `/funcionarios/${m.funcionarioId}`,
                                                                    className: "min-w-0 flex-1 font-medium text-[#1c1917] hover:text-[#f97316] hover:underline dark:text-white dark:hover:text-[#fdba74]",
                                                                    children: m.funcionario?.nomeCompleto ?? (m.funcionarioId ? `Funcionário #${m.funcionarioId}` : "—")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                    lineNumber: 245,
                                                                    columnNumber: 25
                                                                }, this),
                                                                String(servico.responsavelTecnicoId ?? "") === String(m.funcionarioId ?? "") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "shrink-0 rounded-md bg-white px-2 py-0.5 text-[0.7rem] font-medium text-[#57534e] ring-1 ring-[#e7e5e4] dark:bg-[#1a1a1a] dark:text-gray-300 dark:ring-[#333]",
                                                                    children: "Responsável técnico"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                    lineNumber: 252,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, `equipa-${equipaIndex}-${m.funcionarioId || m.funcionario?.id || "x"}`, true, {
                                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                                            lineNumber: 241,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                                    lineNumber: 239,
                                                    columnNumber: 19
                                                }, this) : servico.responsavelTecnico && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "rounded-lg bg-white/90 p-3 ring-1 ring-[#e7e5e4] dark:bg-[#1a1a1a] dark:ring-[#333]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[0.65rem] font-semibold uppercase tracking-wide text-[#78716c] dark:text-gray-500",
                                                            children: "Responsável técnico"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                                            lineNumber: 262,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                            href: `/funcionarios/${servico.responsavelTecnicoId}`,
                                                            className: "mt-1 inline-block font-medium text-[#1c1917] hover:text-[#f97316] hover:underline dark:text-white dark:hover:text-[#fdba74]",
                                                            children: servico.responsavelTecnico.nomeCompleto
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                                            lineNumber: 265,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                                    lineNumber: 261,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                            lineNumber: 230,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 164,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/servicos/[id]/page.tsx",
                            lineNumber: 155,
                            columnNumber: 11
                        }, this),
                        servico.coordenadasLat != null && servico.coordenadasLng != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].section, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: {
                                ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                delay: 0.06
                            },
                            className: "mt-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "mb-4 text-lg font-semibold",
                                    children: "Localização no mapa"
                                }, void 0, false, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 286,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$MapaCoordenadas$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    readOnly: true,
                                    lat: servico.coordenadasLat,
                                    lng: servico.coordenadasLng,
                                    raioMetros: servico.raioPublico,
                                    mapContainerId: "mapa-servico-detalhe"
                                }, void 0, false, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 287,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/servicos/[id]/page.tsx",
                            lineNumber: 280,
                            columnNumber: 13
                        }, this),
                        servico.itensEncomenda.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].section, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: {
                                ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                delay: 0.08
                            },
                            className: "mt-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "mb-4 text-lg font-semibold",
                                    children: [
                                        "Material utilizado — Encomenda #",
                                        servico.encomendaId
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 305,
                                    columnNumber: 15
                                }, this),
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
                                                            className: "pb-2 pr-4 font-semibold",
                                                            children: "Produto"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                                            lineNumber: 310,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "pb-2 pr-4 font-semibold",
                                                            children: "Calibre"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                                            lineNumber: 311,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "pb-2 pr-4 font-semibold",
                                                            children: "Grupo risco"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                                            lineNumber: 312,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "pb-2 pr-4 font-semibold",
                                                            children: "Qtd pedida"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                                            lineNumber: 313,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                                    lineNumber: 309,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                lineNumber: 308,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                children: servico.itensEncomenda.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        className: "border-b border-[#f5f5f4] dark:border-[#1a1a1a]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-2 pr-4",
                                                                children: item.produto?.nome ?? item.produtoId
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 319,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-2 pr-4",
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$produtos$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["textoCalibre"])(item.produto?.calibre)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 320,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-2 pr-4",
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$produtos$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["textoGrupo"])(item.produto?.grupoCompatibilidade)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 321,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-2 pr-4",
                                                                children: Number(item.quantidadePedida).toFixed(2)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 322,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, item.id, true, {
                                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                                        lineNumber: 318,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                lineNumber: 316,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                        lineNumber: 307,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 306,
                                    columnNumber: 15
                                }, this),
                                servico.resumoMaterial && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-[#fafaf9] p-3 text-sm dark:bg-[#0a0a0a]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                servico.resumoMaterial.numeroProdutos,
                                                " produtos · ",
                                                servico.resumoMaterial.totalUnidades.toFixed(0),
                                                " unidades · MLE total:",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: [
                                                        servico.resumoMaterial.mleTotalKg.toFixed(1),
                                                        " kg"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                                    lineNumber: 332,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                            lineNumber: 330,
                                            columnNumber: 19
                                        }, this),
                                        servico.resumoMaterial.divisaoDominante && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `rounded-full px-2 py-0.5 text-xs font-medium ${servico.resumoMaterial.corDivisaoDominante === "danger" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : servico.resumoMaterial.corDivisaoDominante === "warning" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : servico.resumoMaterial.corDivisaoDominante === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`,
                                            children: servico.resumoMaterial.divisaoDominante
                                        }, void 0, false, {
                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                            lineNumber: 335,
                                            columnNumber: 21
                                        }, this),
                                        servico.resumoMaterial.categoriasPresentes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[#57534e] dark:text-gray-400",
                                            children: [
                                                "Categorias ADR: ",
                                                servico.resumoMaterial.categoriasPresentes
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                            lineNumber: 350,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 329,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/encomendas/${servico.encomendaId}`,
                                    className: "mt-3 inline-block text-[#f97316] hover:underline",
                                    children: [
                                        "Ver encomenda #",
                                        servico.encomendaId
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 356,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/servicos/[id]/page.tsx",
                            lineNumber: 299,
                            columnNumber: 13
                        }, this),
                        servico.distanciasSeguranca.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].section, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: {
                                ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                delay: 0.1
                            },
                            className: "mt-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "mb-4 text-lg font-semibold",
                                    children: "Distâncias de segurança"
                                }, void 0, false, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 373,
                                    columnNumber: 15
                                }, this),
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
                                                            className: "pb-2 pr-4 font-semibold",
                                                            children: "Tipo"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                                            lineNumber: 378,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "pb-2 pr-4 text-right font-semibold",
                                                            children: "Mínimo (m)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/servicos/[id]/page.tsx",
                                                            lineNumber: 379,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                                    lineNumber: 377,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                lineNumber: 376,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                children: servico.distanciasSeguranca.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        className: "border-b border-[#f5f5f4] dark:border-[#1a1a1a]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-2 pr-4",
                                                                children: d.descricaoReferencia
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 385,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-2 pr-4 text-right",
                                                                children: d.distanciaMinima_m
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                                lineNumber: 386,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, d.id, true, {
                                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                                        lineNumber: 384,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/servicos/[id]/page.tsx",
                                                lineNumber: 382,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/servicos/[id]/page.tsx",
                                        lineNumber: 375,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 374,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/servicos/[id]/page.tsx",
                            lineNumber: 367,
                            columnNumber: 13
                        }, this),
                        (servico.licencasEvento.length > 0 || servico.documentosExtras.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].section, {
                            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
                            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
                            transition: {
                                ...__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transitionSmooth"],
                                delay: 0.12
                            },
                            className: "mt-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#111]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold",
                                    children: "Documentação"
                                }, void 0, false, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 402,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-sm text-[#57534e] dark:text-gray-400",
                                    children: "A gestão de licenças, declarações e restantes documentos deste serviço está na nova aba de documentação."
                                }, void 0, false, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 403,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/documentacao?servicoId=${encodeURIComponent(String(servico.id))}`,
                                    className: "mt-4 inline-flex rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#1a1a1a]",
                                    children: "Abrir documentação do serviço"
                                }, void 0, false, {
                                    fileName: "[project]/app/servicos/[id]/page.tsx",
                                    lineNumber: 406,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/servicos/[id]/page.tsx",
                            lineNumber: 396,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/servicos/[id]/page.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/servicos/[id]/page.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/servicos/[id]/page.tsx",
        lineNumber: 101,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_9d79af58._.js.map