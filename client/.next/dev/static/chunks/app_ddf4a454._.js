(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/lib/admin.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearAllDataApi",
    ()=>clearAllDataApi,
    "deleteUtilizador",
    ()=>deleteUtilizador,
    "fetchAdminDashboard",
    ()=>fetchAdminDashboard,
    "fetchAdminLogs",
    ()=>fetchAdminLogs,
    "fetchAdminStats",
    ()=>fetchAdminStats,
    "fetchUtilizadorParaEditar",
    ()=>fetchUtilizadorParaEditar,
    "fetchUtilizadores",
    ()=>fetchUtilizadores,
    "updateUtilizador",
    ()=>updateUtilizador
]);
/**
 * API do painel Admin: utilizadores, roles, associação utilizador ↔ funcionário.
 * Todas as rotas requerem role Admin.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiConfig.ts [app-client] (ecmascript)");
;
function mapUtilizador(raw) {
    const roles = raw.roles ?? raw.Roles;
    return {
        id: String(raw.id ?? raw.Id ?? ""),
        userName: String(raw.userName ?? raw.UserName ?? ""),
        email: String(raw.email ?? raw.Email ?? ""),
        roles: Array.isArray(roles) ? roles : [],
        funcionarioAssociadoNome: raw.funcionarioAssociadoNome != null || raw.FuncionarioAssociadoNome != null ? String(raw.funcionarioAssociadoNome ?? raw.FuncionarioAssociadoNome ?? "") : null
    };
}
function mapRoleItem(raw) {
    return {
        nome: String(raw.nome ?? raw.Nome ?? ""),
        atribuido: Boolean(raw.atribuido ?? raw.Atribuido)
    };
}
function authHeaders(token) {
    return {
        Authorization: `Bearer ${token}`
    };
}
async function fetchAdminStats(token) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/admin")}/stats`, {
        headers: authHeaders(token)
    });
    if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    const raw = await res.json();
    return {
        totalUtilizadores: Number(raw.totalUtilizadores ?? 0),
        totalEncomendas: Number(raw.totalEncomendas ?? 0),
        encomendasEsteMes: Number(raw.encomendasEsteMes ?? 0),
        totalServicos: Number(raw.totalServicos ?? 0),
        servicosEsteMes: Number(raw.servicosEsteMes ?? 0),
        totalClientes: Number(raw.totalClientes ?? 0),
        totalFuncionarios: Number(raw.totalFuncionarios ?? 0),
        totalProdutos: Number(raw.totalProdutos ?? 0),
        totalPaiois: Number(raw.totalPaiois ?? 0),
        totalLogs: Number(raw.totalLogs ?? 0)
    };
}
async function fetchAdminLogs(token, opts = {}) {
    const { pagina = 1, itensPorPagina = 50, acao = "" } = opts;
    const params = new URLSearchParams();
    params.set("pagina", String(pagina));
    params.set("itensPorPagina", String(itensPorPagina));
    if (acao) params.set("acao", acao);
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/admin")}/logs?${params}`, {
        headers: authHeaders(token)
    });
    if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    const raw = await res.json();
    const items = Array.isArray(raw.items) ? raw.items.map((l)=>({
            id: Number(l.id ?? l.Id ?? 0),
            acao: String(l.acao ?? l.Acao ?? ""),
            userId: l.userId != null || l.UserId != null ? String(l.userId ?? l.UserId ?? "") : null,
            userName: l.userName != null || l.UserName != null ? String(l.userName ?? l.UserName ?? "") : null,
            jsonDados: l.jsonDados != null || l.JsonDados != null ? String(l.jsonDados ?? l.JsonDados ?? "") : null,
            timestamp: String(l.timestamp ?? l.Timestamp ?? "")
        })) : [];
    return {
        items,
        paginaAtual: Number(raw.paginaAtual ?? raw.PaginaAtual ?? 1),
        itensPorPagina: Number(raw.itensPorPagina ?? raw.ItensPorPagina ?? 50),
        totalRegistos: Number(raw.totalRegistos ?? raw.TotalRegistos ?? 0)
    };
}
async function fetchAdminDashboard(token) {
    const res = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/admin"), {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    const data = await res.json();
    return {
        message: String(data.message ?? data.Message ?? "")
    };
}
async function fetchUtilizadores(token) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/admin")}/utilizadores`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [];
    return arr.map((u)=>mapUtilizador(u));
}
async function fetchUtilizadorParaEditar(token, id) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/admin")}/utilizadores/${encodeURIComponent(id)}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (res.status === 404) return null;
    if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    const data = await res.json();
    const modelRaw = data.model ?? data.Model;
    const funcRaw = data.funcionariosDisponiveis ?? data.FuncionariosDisponiveis;
    if (!modelRaw || typeof modelRaw !== "object") return null;
    const m = modelRaw;
    const rolesRaw = m.roles ?? m.Roles;
    return {
        model: {
            id: String(m.id ?? m.Id ?? ""),
            userName: String(m.userName ?? m.UserName ?? ""),
            email: String(m.email ?? m.Email ?? ""),
            roles: Array.isArray(rolesRaw) ? rolesRaw.map(mapRoleItem) : [],
            funcionarioId: m.funcionarioId != null || m.FuncionarioId != null ? Number(m.funcionarioId ?? m.FuncionarioId) : null
        },
        funcionariosDisponiveis: Array.isArray(funcRaw) ? funcRaw.map((f)=>({
                id: Number(f.id ?? f.Id ?? 0),
                nomeCompleto: String(f.nomeCompleto ?? f.NomeCompleto ?? "")
            })) : []
    };
}
async function updateUtilizador(token, id, model) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/admin")}/utilizadores/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: model.id,
            userName: model.userName,
            email: model.email,
            roles: model.roles,
            funcionarioId: model.funcionarioId
        })
    });
    if (res.status === 404) throw new Error("Utilizador não encontrado");
    if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
    if (!res.ok) {
        const body = await res.json().catch(()=>({}));
        const err = body.error ?? `Erro ${res.status}`;
        throw new Error(err);
    }
}
async function deleteUtilizador(token, id) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/admin")}/utilizadores/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (res.status === 404) throw new Error("Utilizador não encontrado");
    if (res.status === 400) {
        const body = await res.json().catch(()=>({}));
        const err = body.error ?? "Não foi possível eliminar.";
        throw new Error(err);
    }
    if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
    if (res.status !== 204 && res.status !== 200) throw new Error(`Erro ${res.status}`);
}
async function clearAllDataApi(token) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/admin")}/clear-all-data`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
    if (!res.ok) throw new Error(`Erro ${res.status}`);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/admin/_components/AdminBreadcrumb.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildBreadcrumbs",
    ()=>buildBreadcrumbs,
    "default",
    ()=>AdminBreadcrumb
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
"use client";
;
;
const LABELS = {
    admin: "Painel",
    utilizadores: "Utilizadores",
    logs: "Logs",
    definicoes: "Definições",
    editar: "Editar"
};
function pathSegmentToLabel(segment) {
    if (LABELS[segment]) return LABELS[segment];
    if (segment.match(/^[0-9a-f-]{36}$/i)) return "Detalhe";
    return segment;
}
function buildBreadcrumbs(pathname) {
    const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
    const items = [
        {
            label: "Admin",
            href: "/admin"
        }
    ];
    let acc = "/admin";
    for(let i = 0; i < segments.length; i++){
        const seg = segments[i];
        acc += `/${seg}`;
        const label = pathSegmentToLabel(seg);
        items.push(i === segments.length - 1 ? {
            label
        } : {
            label,
            href: acc
        });
    }
    return items;
}
function AdminBreadcrumb({ items }) {
    if (items.length <= 1) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        "aria-label": "Navegação",
        className: "mb-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
            className: "flex flex-wrap items-center gap-1.5 text-sm text-[#78716c] dark:text-[#888]",
            children: items.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                    className: "flex items-center gap-1.5",
                    children: [
                        i > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[#a8a29e] dark:text-[#555]",
                            "aria-hidden": true,
                            children: "/"
                        }, void 0, false, {
                            fileName: "[project]/app/admin/_components/AdminBreadcrumb.tsx",
                            lineNumber: 42,
                            columnNumber: 15
                        }, this),
                        item.href ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: item.href,
                            className: "hover:text-[#f97316] hover:underline dark:hover:text-[#f97316]",
                            children: item.label
                        }, void 0, false, {
                            fileName: "[project]/app/admin/_components/AdminBreadcrumb.tsx",
                            lineNumber: 47,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-medium text-[#57534e] dark:text-[#a3a3a3]",
                            children: item.label
                        }, void 0, false, {
                            fileName: "[project]/app/admin/_components/AdminBreadcrumb.tsx",
                            lineNumber: 54,
                            columnNumber: 15
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/app/admin/_components/AdminBreadcrumb.tsx",
                    lineNumber: 40,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/app/admin/_components/AdminBreadcrumb.tsx",
            lineNumber: 38,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/admin/_components/AdminBreadcrumb.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_c = AdminBreadcrumb;
var _c;
__turbopack_context__.k.register(_c, "AdminBreadcrumb");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/admin/_components/AdminPageHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminPageHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminBreadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/_components/AdminBreadcrumb.tsx [app-client] (ecmascript)");
"use client";
;
;
function AdminPageHeader({ title, description, breadcrumb, actions }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "space-y-2",
        children: [
            breadcrumb && breadcrumb.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminBreadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                items: breadcrumb
            }, void 0, false, {
                fileName: "[project]/app/admin/_components/AdminPageHeader.tsx",
                lineNumber: 21,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-start justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "font-heading text-2xl font-bold tracking-tight text-[#1c1917] dark:text-white sm:text-3xl",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/app/admin/_components/AdminPageHeader.tsx",
                                lineNumber: 25,
                                columnNumber: 11
                            }, this),
                            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-[#57534e] dark:text-[#888]",
                                children: description
                            }, void 0, false, {
                                fileName: "[project]/app/admin/_components/AdminPageHeader.tsx",
                                lineNumber: 29,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/_components/AdminPageHeader.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    actions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: actions
                    }, void 0, false, {
                        fileName: "[project]/app/admin/_components/AdminPageHeader.tsx",
                        lineNumber: 32,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/_components/AdminPageHeader.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/_components/AdminPageHeader.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_c = AdminPageHeader;
var _c;
__turbopack_context__.k.register(_c, "AdminPageHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/admin/_components/AdminCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminCard",
    ()=>AdminCard,
    "adminCardClass",
    ()=>adminCardClass
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
const CARD_CLASS = "rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:border-[#222] dark:bg-[#111] dark:hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)]";
function AdminCard({ children, className = "", padding = true, ...rest }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${CARD_CLASS} ${padding ? "p-5 sm:p-6" : ""} ${className}`.trim(),
        ...rest,
        children: children
    }, void 0, false, {
        fileName: "[project]/app/admin/_components/AdminCard.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = AdminCard;
const adminCardClass = CARD_CLASS;
var _c;
__turbopack_context__.k.register(_c, "AdminCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/admin/_components/AdminSection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function AdminSection({ title, description, children, action }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-sm font-semibold uppercase tracking-wider text-[#78716c] dark:text-[#666]",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/app/admin/_components/AdminSection.tsx",
                                lineNumber: 18,
                                columnNumber: 11
                            }, this),
                            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 text-sm text-[#57534e] dark:text-[#888]",
                                children: description
                            }, void 0, false, {
                                fileName: "[project]/app/admin/_components/AdminSection.tsx",
                                lineNumber: 22,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/_components/AdminSection.tsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this),
                    action
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/_components/AdminSection.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/_components/AdminSection.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = AdminSection;
var _c;
__turbopack_context__.k.register(_c, "AdminSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/admin/_components/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminBreadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/_components/AdminBreadcrumb.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminPageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/_components/AdminPageHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/_components/AdminCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminSection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/_components/AdminSection.tsx [app-client] (ecmascript)");
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/admin/_components/AdminPageHeader.tsx [app-client] (ecmascript) <export default as AdminPageHeader>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminPageHeader",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminPageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminPageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/_components/AdminPageHeader.tsx [app-client] (ecmascript)");
}),
"[project]/app/admin/utilizadores/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminUtilizadoresPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$admin$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/admin.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/admin/_components/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminPageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AdminPageHeader$3e$__ = __turbopack_context__.i("[project]/app/admin/_components/AdminPageHeader.tsx [app-client] (ecmascript) <export default as AdminPageHeader>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/_components/AdminCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminBreadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/_components/AdminBreadcrumb.tsx [app-client] (ecmascript)");
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
const BTN_SECONDARY = "rounded-xl border border-[#e7e5e4] px-4 py-2 text-sm font-medium text-[#57534e] hover:bg-[#fafaf9] dark:border-[#333] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a]";
function filterUtilizadores(list, query, roleFilter) {
    const q = query.trim().toLowerCase();
    const byRole = roleFilter === "" ? list : list.filter((u)=>u.roles.some((r)=>r.toLowerCase() === roleFilter.toLowerCase()));
    if (!q) return byRole;
    return byRole.filter((u)=>u.userName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.roles.some((r)=>r.toLowerCase().includes(q)) || (u.funcionarioAssociadoNome?.toLowerCase().includes(q) ?? false));
}
function AdminUtilizadoresPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const [eliminandoId, setEliminandoId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [roleFilter, setRoleFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])();
    const { data: utilizadores = [], isLoading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "admin",
            "utilizadores"
        ],
        queryFn: {
            "AdminUtilizadoresPage.useQuery": async ()=>{
                if (!token) {
                    router.replace("/login");
                    throw new Error("Sessão expirada.");
                }
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$admin$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchUtilizadores"])(token);
            }
        }["AdminUtilizadoresPage.useQuery"],
        enabled: !!token,
        staleTime: 30 * 1000
    });
    const rolesUnicos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AdminUtilizadoresPage.useMemo[rolesUnicos]": ()=>{
            const set = new Set();
            utilizadores.forEach({
                "AdminUtilizadoresPage.useMemo[rolesUnicos]": (u)=>u.roles.forEach({
                        "AdminUtilizadoresPage.useMemo[rolesUnicos]": (r)=>set.add(r)
                    }["AdminUtilizadoresPage.useMemo[rolesUnicos]"])
            }["AdminUtilizadoresPage.useMemo[rolesUnicos]"]);
            return Array.from(set).sort();
        }
    }["AdminUtilizadoresPage.useMemo[rolesUnicos]"], [
        utilizadores
    ]);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AdminUtilizadoresPage.useMemo[filtered]": ()=>filterUtilizadores(utilizadores, search, roleFilter)
    }["AdminUtilizadoresPage.useMemo[filtered]"], [
        utilizadores,
        search,
        roleFilter
    ]);
    const handleEliminar = async (id)=>{
        if (!window.confirm("Eliminar esta conta? A ação é irreversível.")) return;
        if (!token) return;
        setEliminandoId(id);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$admin$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteUtilizador"])(token, id);
            await queryClient.invalidateQueries({
                queryKey: [
                    "admin"
                ]
            });
        } catch (e) {
            alert(e instanceof Error ? e.message : "Erro ao eliminar.");
        } finally{
            setEliminandoId(null);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].initial,
        animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fadeInUp"].animate,
        transition: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transitionSmooth"],
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminPageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AdminPageHeader$3e$__["AdminPageHeader"], {
                title: "Utilizadores",
                description: "Contas no servidor. Edite roles e associe a funcionários. Novas contas em Registar primeiro utilizador.",
                breadcrumb: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminBreadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildBreadcrumbs"])("/admin/utilizadores"),
                actions: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/registar-primeiro-utilizador",
                    className: "rounded-xl bg-[#f97316] px-4 py-2 text-sm font-medium text-black hover:opacity-90",
                    children: "Registar utilizador"
                }, void 0, false, {
                    fileName: "[project]/app/admin/utilizadores/page.tsx",
                    lineNumber: 98,
                    columnNumber: 11
                }, void 0)
            }, void 0, false, {
                fileName: "[project]/app/admin/utilizadores/page.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400",
                children: error instanceof Error ? error.message : "Erro ao carregar."
            }, void 0, false, {
                fileName: "[project]/app/admin/utilizadores/page.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "search",
                        placeholder: "Pesquisar por nome, email ou role...",
                        value: search,
                        onChange: (e)=>setSearch(e.target.value),
                        className: "w-full min-w-[200px] max-w-sm rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-[#333] dark:bg-[#111] dark:text-white dark:placeholder:text-[#555]"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/utilizadores/page.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: roleFilter,
                        onChange: (e)=>setRoleFilter(e.target.value),
                        className: "rounded-xl border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm text-[#1c1917] focus:border-[#f97316] focus:outline-none dark:border-[#333] dark:bg-[#111] dark:text-white",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "Todas as roles"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/utilizadores/page.tsx",
                                lineNumber: 126,
                                columnNumber: 11
                            }, this),
                            rolesUnicos.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: r,
                                    children: r
                                }, r, false, {
                                    fileName: "[project]/app/admin/utilizadores/page.tsx",
                                    lineNumber: 128,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/utilizadores/page.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-[#78716c] dark:text-[#666]",
                        children: [
                            filtered.length,
                            " de ",
                            utilizadores.length,
                            " utilizador(es)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/utilizadores/page.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/utilizadores/page.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$_components$2f$AdminCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdminCard"], {
                padding: false,
                className: "overflow-hidden",
                children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-center py-16",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/utilizadores/page.tsx",
                        lineNumber: 141,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/admin/utilizadores/page.tsx",
                    lineNumber: 140,
                    columnNumber: 11
                }, this) : filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "py-12 text-center text-sm text-[#78716c] dark:text-[#888]",
                    children: utilizadores.length === 0 ? "Nenhum utilizador registado." : "Nenhum utilizador corresponde à pesquisa."
                }, void 0, false, {
                    fileName: "[project]/app/admin/utilizadores/page.tsx",
                    lineNumber: 144,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "overflow-x-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "w-full min-w-[640px] text-left text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-b border-[#e7e5e4] bg-[#fafaf9] dark:border-[#222] dark:bg-[#0a0a0a]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3 font-semibold text-[#57534e] dark:text-[#888]",
                                            children: "Nome / Email"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/utilizadores/page.tsx",
                                            lineNumber: 154,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3 font-semibold text-[#57534e] dark:text-[#888]",
                                            children: "Roles"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/utilizadores/page.tsx",
                                            lineNumber: 157,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3 font-semibold text-[#57534e] dark:text-[#888]",
                                            children: "Funcionário"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/utilizadores/page.tsx",
                                            lineNumber: 160,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3 font-semibold text-[#57534e] dark:text-[#888] text-right",
                                            children: "Ações"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/utilizadores/page.tsx",
                                            lineNumber: 163,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/utilizadores/page.tsx",
                                    lineNumber: 153,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/utilizadores/page.tsx",
                                lineNumber: 152,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: filtered.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "border-b border-[#e7e5e4] transition-colors last:border-0 hover:bg-[#fafaf9] dark:border-[#222] dark:hover:bg-[#0a0a0a]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium text-[#1c1917] dark:text-white",
                                                            children: u.userName
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                            lineNumber: 176,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                            fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                            lineNumber: 179,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[#57534e] dark:text-[#888]",
                                                            children: u.email
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                            lineNumber: 180,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                    lineNumber: 175,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                lineNumber: 174,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "flex flex-wrap gap-1",
                                                    children: u.roles.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded-full bg-[#e7e5e4] px-2 py-0.5 text-xs font-medium text-[#57534e] dark:bg-[#222] dark:text-[#a3a3a3]",
                                                            children: r
                                                        }, r, false, {
                                                            fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                            lineNumber: 186,
                                                            columnNumber: 27
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                    lineNumber: 184,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                lineNumber: 183,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3 text-[#57534e] dark:text-[#888]",
                                                children: u.funcionarioAssociadoNome ?? "—"
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                lineNumber: 195,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3 text-right",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-end gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: `/admin/utilizadores/${encodeURIComponent(u.id)}/editar`,
                                                            className: BTN_SECONDARY,
                                                            children: "Editar"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                            lineNumber: 200,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>handleEliminar(u.id),
                                                            disabled: eliminandoId === u.id,
                                                            className: "rounded-xl border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950",
                                                            children: eliminandoId === u.id ? "A eliminar…" : "Eliminar"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                            lineNumber: 206,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                    lineNumber: 199,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/admin/utilizadores/page.tsx",
                                                lineNumber: 198,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, u.id, true, {
                                        fileName: "[project]/app/admin/utilizadores/page.tsx",
                                        lineNumber: 170,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/admin/utilizadores/page.tsx",
                                lineNumber: 168,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/utilizadores/page.tsx",
                        lineNumber: 151,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/admin/utilizadores/page.tsx",
                    lineNumber: 150,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/admin/utilizadores/page.tsx",
                lineNumber: 138,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/utilizadores/page.tsx",
        lineNumber: 87,
        columnNumber: 5
    }, this);
}
_s(AdminUtilizadoresPage, "6kNEA8Igz4Bz4AEgWuJZ4QiGGjQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
_c = AdminUtilizadoresPage;
var _c;
__turbopack_context__.k.register(_c, "AdminUtilizadoresPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_ddf4a454._.js.map