/**
 * API Funcionários: GET {id} (detalhe), create (GET/POST), delete (GET/DELETE), desassociar (POST).
 * `fetchFuncionarioPorId` + `mapApiItemToFuncionarioDetalhe` alimentam detalhe e desassociar; lista/edit usam `fetchFuncionariosLista`, `fetchFuncionarioEditGet`, `putFuncionario`.
 */

import { safeParseJson } from "./api";
import { apiPath } from "./apiConfig";
import { parseApiErrorBody } from "./apiErrors";
import type { CargoFuncionario, Funcionario } from "./funcionarios";

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** GET api/funcionarios — lista + userIdsConfirmados (mesmo contrato que a página de listagem). */
export async function fetchFuncionariosLista(token: string): Promise<{
  items: Array<Record<string, unknown>>;
  userIdsConfirmados: string[];
}> {
  const res = await fetch(apiPath("api/funcionarios"), { headers: authHeaders(token) });
  if (!res.ok) {
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    throw new Error(
      res.status === 404 ? "Recurso não encontrado." : "Erro ao carregar funcionários."
    );
  }
  const data = (await safeParseJson(res)) as unknown;
  const dataObj = data as { items?: unknown[]; userIdsConfirmados?: string[] } | null;
  const arr = Array.isArray(dataObj?.items) ? dataObj.items : [];
  const userIdsConfirmados = Array.isArray(dataObj?.userIdsConfirmados) ? dataObj.userIdsConfirmados : [];
  return { items: arr as Array<Record<string, unknown>>, userIdsConfirmados };
}

/** GET api/funcionarios/{id}/edit — dados para o formulário de edição (Admin). */
export async function fetchFuncionarioEditGet(
  token: string,
  id: string
): Promise<{ item?: Record<string, unknown>; contaEmail?: string }> {
  const res = await fetch(`${apiPath("api/funcionarios")}/${id}/edit`, { headers: authHeaders(token) });
  if (!res.ok) {
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    const text = await res.text();
    throw new Error(res.status === 404 ? "Funcionário não encontrado." : text || `Erro ${res.status}`);
  }
  return safeParseJson(res) as Promise<{ item?: Record<string, unknown>; contaEmail?: string }>;
}

/** PUT api/funcionarios/{id} — atualizar ficha (FormData). */
export async function putFuncionario(token: string, id: string, formData: FormData): Promise<void> {
  const res = await fetch(`${apiPath("api/funcionarios")}/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ${res.status}`);
  }
}

/**
 * Mapeia o item JSON de GET api/funcionarios/{id} para o modelo de UI (secção Documentos com flags Has*).
 */
export function mapApiItemToFuncionarioDetalhe(item: Record<string, unknown>, contaEmailConfirmada?: boolean): Funcionario {
  const nome = (item.nomeCompleto ?? item.NomeCompleto ?? item.nome ?? "") as string;
  const hasCc = Boolean(item.hasCartaoCidadao ?? item.HasCartaoCidadao ?? item.cartaoCidadaoCaminho ?? item.CartaoCidadaoCaminho);
  const hasAdr = Boolean(item.hasDocumentoADR ?? item.HasDocumentoADR ?? item.documentoADDRCaminho ?? item.DocumentoADDRCaminho);
  const hasLic = Boolean(item.hasLicencaOperador ?? item.HasLicencaOperador ?? item.licencaOperadorCaminho ?? item.LicencaOperadorCaminho);
  const hasOutros = Boolean(item.hasOutros ?? item.HasOutros ?? item.outrosCaminho ?? item.OutrosCaminho);
  const apiExtras = (item.documentosExtras ?? item.DocumentosExtras ?? []) as Record<string, unknown>[];
  const extras = apiExtras.map((ex) => ({
    id: String(ex.id ?? ex.Id ?? ""),
    nome: String(ex.nome ?? ex.Nome ?? ""),
  }));
  const documentos: Funcionario["documentos"] =
    hasCc || hasAdr || hasLic || hasOutros || extras.length > 0
      ? {
          cartaoCidadao: hasCc ? "cc" : undefined,
          adr: hasAdr ? "adr" : undefined,
          licencaOperador: hasLic ? "licenca" : undefined,
          outros: hasOutros ? "outros" : undefined,
          extras,
        }
      : undefined;
  return {
    id: String(item.id ?? item.Id ?? ""),
    nomeCompleto: nome,
    nif: (item.nif ?? item.NIF) as string | undefined,
    email: (item.email ?? item.Email) as string | undefined,
    telefone: (item.telefone ?? item.Telefone) as string | undefined,
    morada: (item.morada ?? item.Morada) as string | undefined,
    nss: (item.nss ?? item.NSS) as string | undefined,
    iban: (item.iban ?? item.IBAN) as string | undefined,
    cargo: (item.cargo ?? item.Cargo ?? "Comercial") as CargoFuncionario,
    notas: (item.notas ?? item.Notas) as string | undefined,
    dataRegisto: String(item.dataRegisto ?? item.DataRegisto ?? new Date().toISOString()),
    contaAssociada: Boolean(item.userId ?? item.UserId),
    emailConfirmado: contaEmailConfirmada ?? (item.emailConfirmado as boolean | undefined),
    userId: (item.userId ?? item.UserId) as string | undefined,
    documentos,
  };
}

export type FetchFuncionarioPorIdOpts = {
  /** Chamado antes de lançar quando a API devolve 401 (ex.: redirect para login). */
  onUnauthorized?: () => void;
};

/** GET api/funcionarios/{id} — detalhe (mesmo contrato para página de detalhe e desassociar). */
export async function fetchFuncionarioPorId(
  token: string,
  id: string,
  opts?: FetchFuncionarioPorIdOpts
): Promise<Funcionario | null> {
  const res = await fetch(`${apiPath("api/funcionarios")}/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    if (res.status === 401) {
      opts?.onUnauthorized?.();
      throw new Error("Sessão expirada.");
    }
    const text = await res.text();
    throw new Error(res.status === 404 ? "Funcionário não encontrado." : text || `Erro ${res.status}`);
  }
  const value = (await safeParseJson(res)) as unknown;
  const data = value as { item?: Record<string, unknown>; contaEmailConfirmada?: boolean };
  const raw = data?.item ?? data;
  if (raw && typeof raw === "object")
    return mapApiItemToFuncionarioDetalhe(raw as Record<string, unknown>, data.contaEmailConfirmada);
  return null;
}

/** GET api/funcionarios/create — opções para formulário (Admin) */
export async function fetchCreate(token: string): Promise<{
  funcionario: Record<string, unknown>;
  cargos: string[];
  rolesConta: string[];
}> {
  const res = await fetch(`${apiPath("api/funcionarios")}/create`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Falha ao carregar formulário");
  return res.json();
}

/** POST api/funcionarios — criar funcionário (Admin). Enviar FormData (multipart/form-data). */
export async function postCreate(token: string, formData: FormData): Promise<{ funcionario: Record<string, unknown>; funcionarioCriado: boolean }> {
  const res = await fetch(apiPath("api/funcionarios"), {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiErrorBody(data).message);
  return data as { funcionario: Record<string, unknown>; funcionarioCriado: boolean };
}

/** GET api/funcionarios/{id}/delete — dados para página eliminar (Admin) */
export async function fetchDeleteGet(token: string, id: number): Promise<Record<string, unknown>> {
  const res = await fetch(`${apiPath("api/funcionarios")}/${id}/delete`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Funcionário não encontrado");
  return res.json();
}

/** DELETE api/funcionarios/{id} — eliminar funcionário (Admin) */
export async function deleteFuncionarioApi(token: string, id: number): Promise<void> {
  const res = await fetch(`${apiPath("api/funcionarios")}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok && res.status !== 204) throw new Error("Falha ao eliminar");
}

/** POST api/funcionarios/{id}/desassociar — desassociar conta Identity da ficha (Admin) */
export async function postDesassociarConta(token: string, id: string): Promise<void> {
  const res = await fetch(`${apiPath("api/funcionarios")}/${id}/desassociar`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (res.ok) return;
  const data = (await safeParseJson(res).catch(() => ({}))) as { error?: string };
  if (res.status === 400 && data.error) throw new Error(data.error);
  if (res.status === 403) throw new Error("Sem permissão para desassociar contas.");
  throw new Error(data.error || "Ocorreu um erro ao desassociar a conta.");
}
