/**
 * API saída de paiol: GET/POST api/saida-paiol/registar.
 */

import { apiPath } from "./apiConfig";
import { safeParseJson } from "./api";
import { parseApiErrorBody } from "./apiErrors";

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export type SaidaRegistarFormResult = {
  paiolNome: string;
  produtoNome: string;
  stockDisponivel: number;
};

/** GET api/saida-paiol/registar?paiolId=&produtoId= — metadados para o formulário. */
export async function fetchSaidaRegistarForm(
  token: string,
  paiolId: number,
  produtoId: number
): Promise<SaidaRegistarFormResult> {
  const res = await fetch(
    `${apiPath("api/saida-paiol/registar")}?paiolId=${paiolId}&produtoId=${produtoId}`,
    { headers: authHeaders(token) }
  );
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (res.status === 403 || res.status === 404 || !res.ok) {
    return { paiolNome: "", produtoNome: "", stockDisponivel: 0 };
  }
  const data = (await res.json()) as Record<string, unknown>;
  const nomePaiol = (data.paiolNome ?? data.PaiolNome) as string | undefined;
  const nomeProduto = (data.produtoNome ?? data.ProdutoNome) as string | undefined;
  const stock = data.stockDisponivel ?? data.StockDisponivel;
  const stockNum = typeof stock === "number" ? stock : Number(stock);
  return {
    paiolNome: String(nomePaiol ?? ""),
    produtoNome: String(nomeProduto ?? ""),
    stockDisponivel: Number.isFinite(stockNum) ? Math.max(0, stockNum) : 0,
  };
}

export type RegistarSaidaBody = {
  PaiolId: number;
  ProdutoId: number;
  Quantidade: number;
};

/** POST api/saida-paiol/registar */
export async function postRegistarSaida(token: string, body: RegistarSaidaBody): Promise<unknown> {
  const res = await fetch(apiPath("api/saida-paiol/registar"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(parseApiErrorBody(data).message);
  }
  return safeParseJson(res);
}
