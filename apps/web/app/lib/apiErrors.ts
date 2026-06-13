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

function pushUnique(list: string[], msg: string) {
  const trimmed = msg.trim();
  if (trimmed && !list.includes(trimmed)) list.push(trimmed);
}

/** Remove prefixo técnico [ERRO_00X] mantendo o texto legível para o utilizador. */
export function humanizeValidationMessage(msg: string): string {
  return msg.replace(/^\[ERRO_\d+\]\s*/i, "").trim() || msg.trim();
}

/** Extrai mensagens de um nó ModelState (string, array ou objeto ASP.NET). */
function collectValidationMessages(value: unknown, list: string[], byKey: Record<string, string>, key: string) {
  if (value == null) return;

  if (typeof value === "string") {
    if (value.trim()) {
      byKey[key] = value.trim();
      pushUnique(list, value);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string") {
        pushUnique(list, item);
      } else if (item != null && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const em = obj.errorMessage ?? obj.ErrorMessage;
        if (typeof em === "string") pushUnique(list, em);
      }
    }
    if (list.length > 0 && key) byKey[key] = list[list.length - 1];
    return;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const direct = obj.errorMessage ?? obj.ErrorMessage;
    if (typeof direct === "string") pushUnique(list, direct);

    const nested = obj.errors ?? obj.Errors;
    if (nested != null) collectValidationMessages(nested, list, byKey, key);

    // ModelState serializado como dicionário campo → entrada
    for (const [childKey, childValue] of Object.entries(obj)) {
      if (childKey === "errors" || childKey === "Errors") continue;
      if (childKey === "rawValue" || childKey === "attemptedValue" || childKey === "validationState") continue;
      collectValidationMessages(childValue, list, byKey, childKey);
    }
  }
}

/**
 * Extrai mensagens de erro de uma resposta JSON da API.
 * Suporta: { error }, { message }, { erros: string[] }, { errors: ModelState }.
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

  const globalMsg =
    (typeof obj.error === "string" ? obj.error : undefined) ??
    (typeof obj.message === "string" ? obj.message : undefined) ??
    (typeof obj.Message === "string" ? obj.Message : undefined);
  if (globalMsg) pushUnique(list, globalMsg);

  const errosTop = obj.erros ?? obj.Erros;
  if (Array.isArray(errosTop)) {
    for (const item of errosTop) {
      if (typeof item === "string") pushUnique(list, item);
    }
  }

  const errors = obj.errors ?? obj.Errors;
  if (errors != null && typeof errors === "object") {
    const errObj = errors as Record<string, unknown>;
    for (const [key, value] of Object.entries(errObj)) {
      collectValidationMessages(value, list, byKey, key);
    }
  }

  const humanized = list.map(humanizeValidationMessage);
  const message =
    humanized.length > 0
      ? humanized.join(" ")
      : globalMsg?.trim() ?? "Erro ao processar pedido. Tente novamente.";

  return { message, byKey, list: humanized.length > 0 ? humanized : list };
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
