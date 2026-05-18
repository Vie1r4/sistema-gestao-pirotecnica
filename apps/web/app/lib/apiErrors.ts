/**
 * Helper para interpretar respostas de erro da API (ex.: 400 com ModelState ou message).
 * Permite mostrar mensagens do backend de forma consistente na UI.
 */

export type ApiErrorResult = {
  /** Mensagem única (primeira mensagem ou error global). */
  message: string;
  /** Todas as mensagens por campo (útil para mostrar junto a inputs). */
  byKey: Record<string, string>;
  /** Lista de mensagens para exibir em lista. */
  list: string[];
};

/**
 * Extrai mensagens de erro de uma resposta JSON da API.
 * Suporta: { error: string }, { errors: ModelState }, { message: string }.
 */
export function parseApiErrorBody(body: unknown): ApiErrorResult {
  const byKey: Record<string, string> = {};
  const list: string[] = [];

  if (body == null || typeof body !== "object") {
    return {
      message: "Erro ao processar pedido. Tente novamente.",
      byKey: {},
      list: [],
    };
  }

  const obj = body as Record<string, unknown>;

  // error ou message global
  const globalMsg =
    (typeof obj.error === "string" ? obj.error : undefined) ??
    (typeof obj.message === "string" ? obj.message : undefined) ??
    (typeof obj.Message === "string" ? obj.Message : undefined);
  if (globalMsg) list.push(globalMsg);

  // errors (ModelState: { "Cliente.Nome": ["O nome é obrigatório."], ... })
  const errors = obj.errors ?? obj.Errors;
  if (errors != null && typeof errors === "object") {
    const errObj = errors as Record<string, unknown>;
    for (const [key, value] of Object.entries(errObj)) {
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

  const message = list.length > 0 ? list[0] : (globalMsg ?? "Erro ao processar pedido. Tente novamente.");
  return { message, byKey, list };
}

/**
 * Dado um Response e o body já parseado (opcional), devolve um ApiErrorResult.
 * Se body não for passado, tenta fazer response.json() (consome o body).
 */
export async function parseApiErrorResponse(
  response: Response,
  body?: unknown
): Promise<ApiErrorResult> {
  let parsed = body;
  if (parsed === undefined) {
    try {
      parsed = await response.json();
    } catch {
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
