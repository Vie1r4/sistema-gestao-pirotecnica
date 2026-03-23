/**
 * Helpers para chamadas à API.
 * Evita o erro "Unexpected token '<'" quando o servidor devolve HTML em vez de JSON
 * (ex.: 404, API em baixo, URL errado).
 */

import { API_BASE_URL } from "./apiConfig";

/**
 * Faz parse do body da Response como JSON.
 * Se o Content-Type não for application/json (ex.: HTML), lê o corpo como texto
 * e lança um erro com mensagem clara em vez de falhar no JSON.parse.
 */
export async function safeParseJson(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    const isHtml = text.trimStart().startsWith("<");
    throw new Error(
      isHtml
        ? `O servidor devolveu uma página HTML em vez de JSON. Verifique se a API está a correr (${API_BASE_URL}) e se o URL está correto.`
        : text || `Erro ${res.status}`
    );
  }
  return res.json();
}
