/**
 * Normaliza o token do query string do link de reset.
 * Clientes de email podem inserir quebras de linha ou espaços no meio do token longo.
 */
export function normalizeResetTokenFromUrl(token: string): string {
  return token.trim().replace(/\s+/g, "");
}
