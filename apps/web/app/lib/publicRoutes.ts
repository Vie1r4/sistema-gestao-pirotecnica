/** Rotas acessíveis sem login (não redireciona para /login). */
export const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/registar-primeiro-utilizador",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
] as const;

/** Rotas onde não há sessão — não chamar refresh nem /api/auth/me. */
export const ROTAS_SEM_BOOTSTRAP_AUTH = [
  "/login",
  "/registar-primeiro-utilizador",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
] as const;

export function isRotaPublica(pathname: string | null): boolean {
  if (!pathname) return false;
  return ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

export function isRotaSemBootstrapAuth(pathname: string | null): boolean {
  if (!pathname) return false;
  return ROTAS_SEM_BOOTSTRAP_AUTH.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );
}
