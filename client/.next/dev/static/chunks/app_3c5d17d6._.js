(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/lib/apiConfig.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiPath",
    ()=>apiPath,
    "getApiBaseUrl",
    ()=>getApiBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * Base URL da API do backend.
 *
 * - **NEXT_PUBLIC_API_URL** no `.env` tem prioridade (ex.: produção ou porta personalizada).
 * - Sem variável: em **localhost** no browser usa `https://localhost:7225`.
 * - Se abrir o site pelo **IP da LAN** (ex.: `http://192.168.x.x:3000` no telemóvel), usa
 *   automaticamente `http://<mesmo-host>:5078` — o telemóvel não pode usar `localhost` para
 *   chegar ao PC. A API em Development deve escutar em `0.0.0.0` e não redirecionar HTTP→HTTPS.
 *
 * CORS em Development já aceita origens em IPs privados na porta 3000.
 */ const DEFAULT_HTTPS_PORT = 7225;
const DEFAULT_HTTP_PORT = 5078;
function getApiBaseUrl() {
    const fromEnv = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL?.trim();
    if (fromEnv) return fromEnv.replace(/\/$/, "");
    if ("TURBOPACK compile-time truthy", 1) {
        const hostname = window.location.hostname;
        if (hostname !== "localhost" && hostname !== "127.0.0.1") {
            return `http://${hostname}:${DEFAULT_HTTP_PORT}`;
        }
    }
    return `https://localhost:${DEFAULT_HTTPS_PORT}`;
}
function apiPath(path) {
    const p = path.startsWith("/") ? path.slice(1) : path;
    return `${getApiBaseUrl()}/${p}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRefreshToken",
    ()=>getRefreshToken,
    "getToken",
    ()=>getToken,
    "getTokenExpirationSeconds",
    ()=>getTokenExpirationSeconds,
    "isAuthenticated",
    ()=>isAuthenticated,
    "logout",
    ()=>logout,
    "refreshAccessToken",
    ()=>refreshAccessToken,
    "setTokens",
    ()=>setTokens
]);
/**
 * Autenticação: access token e refresh token no localStorage.
 * Renovação do JWT antes de expirar para evitar logout a cada 60 minutos.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiConfig.ts [app-client] (ecmascript)");
;
const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
function getToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch  {
        return null;
    }
}
function getRefreshToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch  {
        return null;
    }
}
function setTokens(token, refreshToken) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch  {}
}
function isAuthenticated() {
    const token = getToken();
    return token != null && token.length > 0;
}
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    try {
        const res = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/auth/refresh"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                refreshToken
            })
        });
        if (!res.ok) return null;
        const data = await res.json();
        const token = data.token;
        const newRefresh = data.refreshToken;
        if (token && newRefresh) {
            setTokens(token, newRefresh);
            return token;
        }
        return null;
    } catch  {
        return null;
    }
}
function logout() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const refreshToken = getRefreshToken();
    try {
        if (refreshToken) {
            fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/auth/logout"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    refreshToken
                })
            }).catch(()=>{});
        }
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem("pirofafe-user");
    } catch  {}
    window.location.href = "/login";
}
function getTokenExpirationSeconds(token) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        const exp = payload.exp;
        return typeof exp === "number" ? exp : null;
    } catch  {
        return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/stores/useToastStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useToastStore",
    ()=>useToastStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
"use client";
;
const AUTO_HIDE_MS = 6000;
let hideTimeout = null;
const useToastStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        message: null,
        type: "error",
        visible: false,
        show: (message, type = "error")=>{
            if (hideTimeout) clearTimeout(hideTimeout);
            set({
                message,
                type,
                visible: true
            });
            hideTimeout = setTimeout(()=>{
                set({
                    visible: false,
                    message: null
                });
                hideTimeout = null;
            }, AUTO_HIDE_MS);
        },
        hide: ()=>{
            if (hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = null;
            set({
                visible: false,
                message: null
            });
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QueryProvider",
    ()=>QueryProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useToastStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/stores/useToastStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function isAuthError(error) {
    const msg = error instanceof Error ? error.message : String(error);
    return msg.includes("Não autenticado") || msg.includes("Sessão expirada") || msg.includes("autenticado");
}
function getErrorMessage(error) {
    if (error instanceof Error) return error.message;
    return String(error);
}
function QueryProvider({ children }) {
    _s();
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "QueryProvider.useState": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]({
                defaultOptions: {
                    queries: {
                        staleTime: 20 * 1000,
                        retry: {
                            "QueryProvider.useState": (failureCount, error)=>{
                                if (isAuthError(error)) return false;
                                return failureCount < 2;
                            }
                        }["QueryProvider.useState"],
                        retryDelay: 600
                    },
                    mutations: {
                        onError: {
                            "QueryProvider.useState": (error)=>{
                                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                                ;
                                if (isAuthError(error)) {
                                    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useToastStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToastStore"].getState().show("Sessão expirada. A redirecionar para o início de sessão…", "error");
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logout"])();
                                } else {
                                    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useToastStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToastStore"].getState().show(getErrorMessage(error), "error");
                                }
                            }
                        }["QueryProvider.useState"]
                    }
                }
            })
    }["QueryProvider.useState"]);
    queryClient.getQueryCache().subscribe((event)=>{
        if (event?.type === "updated" && event.query.state.status === "error" && event.query.state.error) {
            const err = event.query.state.error;
            if (("TURBOPACK compile-time value", "object") !== "undefined" && isAuthError(err)) {
                __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useToastStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToastStore"].getState().show("Sessão expirada. A redirecionar para o início de sessão…", "error");
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logout"])();
            }
        }
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: children
    }, void 0, false, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
_s(QueryProvider, "VfxBAlcglg45L42khLXVs+bGsL0=");
_c = QueryProvider;
var _c;
__turbopack_context__.k.register(_c, "QueryProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/home.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getError",
    ()=>getError,
    "getHomeMessage",
    ()=>getHomeMessage,
    "getHomeStats",
    ()=>getHomeStats,
    "getLimparDados",
    ()=>getLimparDados,
    "getPerfil",
    ()=>getPerfil,
    "getPreferencias",
    ()=>getPreferencias,
    "getPrivacy",
    ()=>getPrivacy,
    "postAlterarPassword",
    ()=>postAlterarPassword,
    "postLimparDados",
    ()=>postLimparDados,
    "postPreferencias",
    ()=>postPreferencias,
    "putPerfil",
    ()=>putPerfil
]);
/**
 * API Home: página inicial, privacidade, erro, limpar-dados, preferências (tema), alterar-password.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiConfig.ts [app-client] (ecmascript)");
;
function authHeaders(token) {
    return {
        Authorization: `Bearer ${token}`
    };
}
async function getHomeMessage(token) {
    const res = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/home"), {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error("Falha ao obter página inicial");
    return res.json();
}
async function getHomeStats(token) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/home")}/stats`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error("Falha ao obter estatísticas");
    return res.json();
}
async function getPrivacy(token) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/home")}/privacy`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error("Falha ao obter política de privacidade");
    return res.json();
}
async function getError() {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/home")}/error`);
    if (!res.ok) throw new Error("Falha ao obter dados de erro");
    const data = await res.json();
    return {
        requestId: data.requestId,
        isDevelopment: data.isDevelopment
    };
}
async function getLimparDados(token) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/home")}/limpar-dados`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error("Falha ao obter confirmação de limpeza");
    return res.json();
}
async function postLimparDados(token) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/home")}/limpar-dados`, {
        method: "POST",
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error("Falha ao limpar dados");
    return res.json();
}
async function getPreferencias(token) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/home")}/preferencias`, {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error("Falha ao obter preferências");
    return res.json();
}
async function postPreferencias(token, tema) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/home")}/preferencias`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(token)
        },
        body: JSON.stringify({
            tema
        })
    });
    if (!res.ok) throw new Error("Falha ao guardar preferências");
    return res.json();
}
async function postAlterarPassword(token, payload) {
    const res = await fetch(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/home")}/alterar-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(token)
        },
        body: JSON.stringify({
            passwordAtual: payload.passwordAtual,
            novaPassword: payload.novaPassword,
            confirmarNovaPassword: payload.confirmarNovaPassword
        })
    });
    const data = await res.json();
    if (res.ok && data.passwordAlterada) return {
        passwordAlterada: true
    };
    const errors = data.errors && typeof data.errors === "object" ? data.errors : {};
    const messages = Object.values(errors).flatMap((v)=>Array.isArray(v) ? v : v && typeof v === "object" && "errors" in v && Array.isArray(v.errors) ? v.errors : []);
    throw new Error(messages.filter(Boolean).join(" ") || "Erro ao alterar palavra-passe");
}
async function getPerfil(token) {
    const res = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/home/perfil"), {
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error("Falha ao carregar perfil");
    return res.json();
}
async function putPerfil(token, body) {
    const res = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/home/perfil"), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(token)
        },
        body: JSON.stringify(body)
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error("Não foi possível guardar.");
    return data;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/stores/useUIStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyStoredThemeOnMount",
    ()=>applyStoredThemeOnMount,
    "useUIStore",
    ()=>useUIStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
"use client";
;
;
const STORAGE_KEY = "pirofafe-theme";
function applyThemeToDom(theme) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    root.setAttribute("data-theme", theme);
}
const useUIStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        theme: "dark",
        _hydrated: false,
        setTheme: (theme)=>{
            set({
                theme
            });
            applyThemeToDom(theme);
        },
        toggleTheme: ()=>{
            set((state)=>{
                const next = state.theme === "dark" ? "light" : "dark";
                applyThemeToDom(next);
                return {
                    theme: next
                };
            });
        },
        setHydrated: ()=>set({
                _hydrated: true
            })
    }), {
    name: STORAGE_KEY,
    partialize: (s)=>({
            theme: s.theme
        }),
    storage: {
        getItem: (name)=>{
            const raw = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : localStorage.getItem(name);
            if (!raw) return null;
            try {
                const parsed = JSON.parse(raw);
                if (parsed?.state?.theme) return {
                    state: {
                        theme: parsed.state.theme
                    },
                    version: parsed.version ?? 0
                };
                // Compatibilidade: valor antigo era localStorage.setItem(key, "dark"|"light")
                if (raw === "dark" || raw === "light") {
                    return {
                        state: {
                            theme: raw
                        },
                        version: 0
                    };
                }
                return null;
            } catch  {
                return null;
            }
        },
        setItem: (name, value)=>{
            try {
                localStorage.setItem(name, JSON.stringify(value));
            } catch  {}
        },
        removeItem: (name)=>{
            try {
                localStorage.removeItem(name);
            } catch  {}
        }
    },
    onRehydrateStorage: ()=>(state)=>{
            if (state?.theme) applyThemeToDom(state.theme);
        }
}));
function applyStoredThemeOnMount() {
    const theme = useUIStore.getState().theme;
    if (typeof document !== "undefined") applyThemeToDom(theme);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/ThemeSync.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThemeSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$home$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/home.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useUIStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/stores/useUIStore.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ThemeSync() {
    _s();
    const setTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useUIStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"])({
        "ThemeSync.useUIStore[setTheme]": (s)=>s.setTheme
    }["ThemeSync.useUIStore[setTheme]"]);
    const applied = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeSync.useEffect": ()=>{
            if (applied.current) return;
            const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])();
            if (!token) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$home$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPreferencias"])(token).then({
                "ThemeSync.useEffect": ({ tema })=>{
                    const value = tema === "Dark" ? "dark" : "light";
                    setTheme(value);
                    applied.current = true;
                }
            }["ThemeSync.useEffect"]).catch({
                "ThemeSync.useEffect": ()=>{}
            }["ThemeSync.useEffect"]);
        }
    }["ThemeSync.useEffect"], [
        setTheme
    ]);
    return null;
}
_s(ThemeSync, "QDl57fcYt6tUkgR0Xf1mplIfBNA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useUIStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"]
    ];
});
_c = ThemeSync;
var _c;
__turbopack_context__.k.register(_c, "ThemeSync");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/GlobalToast.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GlobalToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useToastStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/stores/useToastStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function GlobalToast() {
    _s();
    const { message, type, visible, hide } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useToastStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToastStore"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GlobalToast.useEffect": ()=>{
            return ({
                "GlobalToast.useEffect": ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useToastStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToastStore"].getState().hide();
                }
            })["GlobalToast.useEffect"];
        }
    }["GlobalToast.useEffect"], []);
    const bgClass = type === "error" ? "bg-red-600 text-white dark:bg-red-700" : type === "success" ? "bg-green-600 text-white dark:bg-green-700" : "bg-gray-800 text-white dark:bg-gray-700";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pointer-events-none fixed inset-0 z-[9999] flex items-end justify-end p-4 sm:p-6",
        "aria-live": "polite",
        "aria-atomic": "true",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
            children: visible && message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    y: 24,
                    scale: 0.96
                },
                animate: {
                    opacity: 1,
                    y: 0,
                    scale: 1
                },
                exit: {
                    opacity: 0,
                    y: 12,
                    scale: 0.96
                },
                transition: {
                    type: "spring",
                    damping: 25,
                    stiffness: 300
                },
                className: `pointer-events-auto max-w-md rounded-xl px-4 py-3 shadow-lg ${bgClass}`,
                role: "alert",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "flex-1 text-sm font-medium",
                            children: message
                        }, void 0, false, {
                            fileName: "[project]/app/components/GlobalToast.tsx",
                            lineNumber: 40,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: hide,
                            className: "shrink-0 rounded p-1 opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50",
                            "aria-label": "Fechar",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "sr-only",
                                    children: "Fechar"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/GlobalToast.tsx",
                                    lineNumber: 47,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "h-4 w-4",
                                    fill: "currentColor",
                                    viewBox: "0 0 20 20",
                                    "aria-hidden": true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        fillRule: "evenodd",
                                        d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                                        clipRule: "evenodd"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/GlobalToast.tsx",
                                        lineNumber: 49,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/GlobalToast.tsx",
                                    lineNumber: 48,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/GlobalToast.tsx",
                            lineNumber: 41,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/GlobalToast.tsx",
                    lineNumber: 39,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/GlobalToast.tsx",
                lineNumber: 31,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/GlobalToast.tsx",
            lineNumber: 29,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/GlobalToast.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_s(GlobalToast, "eUUrfDitMU/CZi1Gi3hOBJ6c1cU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$stores$2f$useToastStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToastStore"]
    ];
});
_c = GlobalToast;
var _c;
__turbopack_context__.k.register(_c, "GlobalToast");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/context/UserContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserProvider",
    ()=>UserProvider,
    "useUser",
    ()=>useUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/apiConfig.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const UserContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function parseMeData(data) {
    const nome = data.nome ?? data.Nome ?? "";
    const roles = data.roles ?? data.Roles ?? [];
    const permissions = data.permissions ?? data.Permissions ?? [];
    return {
        id: String(data.id ?? data.Id ?? ""),
        email: data.email ?? data.Email ?? data.userName ?? data.UserName,
        nome: nome || (data.userName ?? data.UserName) || "",
        roles: Array.isArray(roles) ? roles : [],
        permissions: Array.isArray(permissions) ? permissions : []
    };
}
/** Agenda a renovação do JWT 5 minutos antes de expirar. */ function useRefreshTokenScheduler() {
    _s();
    const timeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useRefreshTokenScheduler.useEffect": ()=>{
            function scheduleRefresh() {
                const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])();
                const refreshToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRefreshToken"])();
                if (!token || !refreshToken) return;
                const exp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTokenExpirationSeconds"])(token);
                if (exp == null) return;
                const nowSec = Date.now() / 1000;
                const refreshAtSec = exp - 5 * 60; // 5 min before expiry
                const delayMs = Math.max(0, (refreshAtSec - nowSec) * 1000);
                if (delayMs <= 0) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["refreshAccessToken"])().then({
                        "useRefreshTokenScheduler.useEffect.scheduleRefresh": (newToken)=>{
                            if (newToken) scheduleRefresh();
                            else (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logout"])();
                        }
                    }["useRefreshTokenScheduler.useEffect.scheduleRefresh"]);
                    return;
                }
                timeoutRef.current = setTimeout({
                    "useRefreshTokenScheduler.useEffect.scheduleRefresh": ()=>{
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["refreshAccessToken"])().then({
                            "useRefreshTokenScheduler.useEffect.scheduleRefresh": (newToken)=>{
                                if (newToken) scheduleRefresh();
                                else (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logout"])();
                            }
                        }["useRefreshTokenScheduler.useEffect.scheduleRefresh"]);
                    }
                }["useRefreshTokenScheduler.useEffect.scheduleRefresh"], delayMs);
            }
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])() || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRefreshToken"])()) return;
            scheduleRefresh();
            return ({
                "useRefreshTokenScheduler.useEffect": ()=>{
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }
            })["useRefreshTokenScheduler.useEffect"];
        }
    }["useRefreshTokenScheduler.useEffect"], []);
}
_s(useRefreshTokenScheduler, "lXIkKenX1wXIs2/Ah8A4QzJneGI=");
function UserProvider({ children }) {
    _s1();
    useRefreshTokenScheduler();
    const { data, isLoading, refetch: queryRefetch, isFetching } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "auth",
            "me"
        ],
        queryFn: {
            "UserProvider.useQuery": async ()=>{
                const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])();
                if (!token) return null;
                const res = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$apiConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPath"])("api/auth/me"), {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.status === 401 || !res.ok) return null;
                const raw = await res.json();
                return parseMeData(raw);
            }
        }["UserProvider.useQuery"],
        staleTime: 2 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: true
    });
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "UserProvider.useMemo[value]": ()=>({
                user: data ?? null,
                loading: isLoading || isFetching,
                refetch: ({
                    "UserProvider.useMemo[value]": ()=>queryRefetch()
                })["UserProvider.useMemo[value]"]
            })
    }["UserProvider.useMemo[value]"], [
        data,
        isLoading,
        isFetching,
        queryRefetch
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UserContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/app/context/UserContext.tsx",
        lineNumber: 114,
        columnNumber: 5
    }, this);
}
_s1(UserProvider, "CqUFhVcsioeBbqNfq43miwEMsbQ=", false, function() {
    return [
        useRefreshTokenScheduler,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
_c = UserProvider;
function useUser() {
    _s2();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(UserContext);
    if (!ctx) {
        return {
            user: null,
            loading: false,
            refetch: ()=>{}
        };
    }
    return ctx;
}
_s2(useUser, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "UserProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/routePermissions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Mapeamento de rotas para permissões necessárias.
 * Retorna a lista de permissões (qualquer uma basta) ou null se a rota for acessível a qualquer utilizador autenticado.
 * Ordem: rotas mais específicas primeiro.
 */ __turbopack_context__.s([
    "getRequiredPermissionsForPath",
    ()=>getRequiredPermissionsForPath
]);
function getRequiredPermissionsForPath(pathname) {
    if (!pathname) return null;
    // Admin
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return [
        "admin"
    ];
    // Funcionários
    if (pathname === "/funcionarios" || pathname.startsWith("/funcionarios/")) return [
        "funcionarios.gerir"
    ];
    // Clientes
    if (pathname === "/clientes" || pathname.startsWith("/clientes/")) return [
        "clientes.gerir"
    ];
    // Armazém: gestão e movimentos exigem armazem.gerir
    if (pathname === "/armazem/movimentos" || pathname.startsWith("/armazem/movimentos/")) return [
        "armazem.gerir"
    ];
    if (pathname === "/armazem/gestao" || pathname.startsWith("/armazem/gestao/")) return [
        "armazem.gerir"
    ];
    if (pathname === "/armazem/novo") return [
        "armazem.gerir"
    ];
    if (pathname.match(/^\/armazem\/[^/]+\/editar(\/|$)/)) return [
        "armazem.gerir"
    ];
    if (pathname.match(/^\/armazem\/[^/]+\/eliminar(\/|$)/)) return [
        "armazem.gerir"
    ];
    // Armazém: lista, stock, entradas, saídas, detalhe, conteúdo
    if (pathname.startsWith("/armazem")) return [
        "armazem.stock",
        "armazem.gerir"
    ];
    // Produtos: gerir, novo, editar, eliminar
    if (pathname === "/produtos/gerir" || pathname.startsWith("/produtos/gerir/")) return [
        "produtos.gerir"
    ];
    if (pathname === "/produtos/novo") return [
        "produtos.gerir"
    ];
    if (pathname.match(/^\/produtos\/[^/]+\/editar(\/|$)/)) return [
        "produtos.gerir"
    ];
    if (pathname.match(/^\/produtos\/[^/]+\/eliminar(\/|$)/)) return [
        "produtos.gerir"
    ];
    // Catálogo (lista e detalhe)
    if (pathname === "/produtos" || pathname.startsWith("/produtos/")) return [
        "produtos.ver",
        "produtos.gerir"
    ];
    // Encomendas
    if (pathname === "/encomendas" || pathname.startsWith("/encomendas/")) return [
        "encomendas.gerir"
    ];
    // Serviços
    if (pathname === "/servicos" || pathname.startsWith("/servicos/")) return [
        "servicos.gerir"
    ];
    // Documentação (acesso final validado por role na própria página)
    if (pathname === "/documentacao" || pathname.startsWith("/documentacao/")) return [
        "servicos.gerir"
    ];
    return null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/auth/RoutePermissionGuard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RoutePermissionGuard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/UserContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$routePermissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/routePermissions.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function RoutePermissionGuard({ children }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { user, loading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    const required = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RoutePermissionGuard.useMemo[required]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$routePermissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRequiredPermissionsForPath"])(pathname)
    }["RoutePermissionGuard.useMemo[required]"], [
        pathname
    ]);
    const permissions = user?.permissions ?? [];
    const hasPermission = required === null || required.some((p)=>permissions.includes(p));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RoutePermissionGuard.useEffect": ()=>{
            if (required === null) return;
            if (loading) return;
            if (!hasPermission) {
                router.replace("/");
            }
        }
    }["RoutePermissionGuard.useEffect"], [
        pathname,
        required,
        loading,
        hasPermission,
        router
    ]);
    if (required !== null && (loading || !hasPermission)) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
            }, void 0, false, {
                fileName: "[project]/app/components/auth/RoutePermissionGuard.tsx",
                lineNumber: 36,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/auth/RoutePermissionGuard.tsx",
            lineNumber: 35,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(RoutePermissionGuard, "7feiiUynjPDIOl/mA0YWalPcuLQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"]
    ];
});
_c = RoutePermissionGuard;
var _c;
__turbopack_context__.k.register(_c, "RoutePermissionGuard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/auth/ProtectedRoute.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProtectedRoute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/UserContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$auth$2f$RoutePermissionGuard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/auth/RoutePermissionGuard.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
/** Rotas acessíveis sem login (exceção à proteção). */ const ROTAS_PUBLICAS = [
    "/",
    "/login",
    "/registar-primeiro-utilizador"
];
function isRotaPublica(pathname) {
    if (!pathname) return false;
    return ROTAS_PUBLICAS.some((rota)=>pathname === rota || pathname.startsWith(rota + "/"));
}
function ProtectedRoute({ children }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProtectedRoute.useEffect": ()=>{
            setMounted(true);
        }
    }["ProtectedRoute.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProtectedRoute.useEffect": ()=>{
            if (!mounted) return;
            if (isRotaPublica(pathname)) return;
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isAuthenticated"])()) {
                router.replace("/login");
            }
        }
    }["ProtectedRoute.useEffect"], [
        mounted,
        pathname,
        router
    ]);
    if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
            }, void 0, false, {
                fileName: "[project]/app/components/auth/ProtectedRoute.tsx",
                lineNumber: 41,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/auth/ProtectedRoute.tsx",
            lineNumber: 40,
            columnNumber: 7
        }, this);
    }
    if (isRotaPublica(pathname)) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserProvider"], {
            children: children
        }, void 0, false, {
            fileName: "[project]/app/components/auth/ProtectedRoute.tsx",
            lineNumber: 48,
            columnNumber: 7
        }, this);
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isAuthenticated"])()) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
            }, void 0, false, {
                fileName: "[project]/app/components/auth/ProtectedRoute.tsx",
                lineNumber: 57,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/auth/ProtectedRoute.tsx",
            lineNumber: 56,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$auth$2f$RoutePermissionGuard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            children: children
        }, void 0, false, {
            fileName: "[project]/app/components/auth/ProtectedRoute.tsx",
            lineNumber: 64,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/auth/ProtectedRoute.tsx",
        lineNumber: 63,
        columnNumber: 5
    }, this);
}
_s(ProtectedRoute, "i8Z4HRi26W/tLofVgqZIS0DZ7io=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ProtectedRoute;
var _c;
__turbopack_context__.k.register(_c, "ProtectedRoute");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/animations.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Variantes de animação suaves e profissionais (framer-motion).
 * Entrada: fade in de baixo para cima ao carregar.
 */ __turbopack_context__.s([
    "fadeInUp",
    ()=>fadeInUp,
    "fadeInUpStagger",
    ()=>fadeInUpStagger,
    "pageTransition",
    ()=>pageTransition,
    "pageTransitionConfig",
    ()=>pageTransitionConfig,
    "staggerContainer",
    ()=>staggerContainer,
    "staggerItem",
    ()=>staggerItem,
    "transitionFast",
    ()=>transitionFast,
    "transitionSmooth",
    ()=>transitionSmooth
]);
const fadeInUp = {
    initial: {
        opacity: 0,
        y: 16
    },
    animate: {
        opacity: 1,
        y: 0
    }
};
const fadeInUpStagger = {
    initial: {
        opacity: 0,
        y: 16
    },
    animate: {
        opacity: 1,
        y: 0
    }
};
const transitionSmooth = {
    duration: 0.4,
    ease: [
        0.25,
        0.46,
        0.45,
        0.94
    ]
};
const transitionFast = {
    duration: 0.2,
    ease: "easeOut"
};
const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1
        }
    }
};
const staggerItem = {
    initial: {
        opacity: 0,
        y: 12
    },
    animate: {
        opacity: 1,
        y: 0
    }
};
const pageTransition = {
    initial: {
        opacity: 0
    },
    animate: {
        opacity: 1
    },
    exit: {
        opacity: 0
    }
};
const pageTransitionConfig = {
    duration: 0.18,
    ease: [
        0.32,
        0.72,
        0,
        1
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/PageTransition.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PageTransition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/animations.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function PageTransition({ children }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        mode: "wait",
        initial: false,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pageTransition"].initial,
            animate: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pageTransition"].animate,
            exit: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pageTransition"].exit,
            transition: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$animations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pageTransitionConfig"],
            className: "min-h-full",
            children: children
        }, pathname, false, {
            fileName: "[project]/app/components/PageTransition.tsx",
            lineNumber: 20,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/PageTransition.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_s(PageTransition, "xbyQPtUVMO7MNj7WjJlpdWqRcTo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = PageTransition;
var _c;
__turbopack_context__.k.register(_c, "PageTransition");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_3c5d17d6._.js.map