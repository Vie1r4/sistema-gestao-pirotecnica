/**
 * Resumo legível do campo `jsonDados` de um log, para mostrar inline na lista
 * sem obrigar a abrir o JSON completo. Função pura (testável).
 */

export type LogResumoCampo = { chave: string; valor: string };

/** Identificadores — mostrados sempre primeiro. */
const CHAVE_ID = /^(id|.*id)$/i;

/** Outras chaves úteis numa auditoria — logo a seguir aos identificadores. */
const CHAVE_PRIORITARIA =
  /^(nome|name|t[ií]tulo|titulo|email|estado|status|tipo|refer[eê]ncia|n[uú]mero|numero)$/i;

/** Rótulos amigáveis para chaves comuns (resto fica como veio). */
const ROTULOS: Record<string, string> = {
  id: "ID",
  nome: "Nome",
  name: "Nome",
  email: "Email",
  estado: "Estado",
  status: "Estado",
  tipo: "Tipo",
};

export function rotuloChave(chave: string): string {
  return ROTULOS[chave.toLowerCase()] ?? chave;
}

function truncar(valor: string, max = 60): string {
  const s = valor.trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/**
 * Extrai até `max` pares chave/valor primitivos do JSON, priorizando
 * campos identificadores (id, nome, estado…). Devolve [] se inválido/vazio.
 */
export function summarizeLogJson(
  json: string | null | undefined,
  max = 3
): LogResumoCampo[] {
  if (!json) return [];

  let obj: unknown;
  try {
    obj = JSON.parse(json);
  } catch {
    return [];
  }

  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];

  const entries = Object.entries(obj as Record<string, unknown>).filter(
    ([, v]) =>
      v !== null &&
      v !== "" &&
      (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
  );

  if (entries.length === 0) return [];

  const score = (k: string) => (CHAVE_ID.test(k) ? 0 : CHAVE_PRIORITARIA.test(k) ? 1 : 2);
  const ordenadas = entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => score(a.e[0]) - score(b.e[0]) || a.i - b.i)
    .map(({ e }) => e);

  return ordenadas.slice(0, max).map(([chave, valor]) => ({
    chave,
    valor: truncar(String(valor)),
  }));
}
