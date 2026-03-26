/**
 * Formulário GET api/entrada-paiol/registar + catálogo produtos (filtros).
 */

import { apiPath } from "./apiConfig";

export type PaiolOption = { id: number; nome: string; estado?: string; perfilRisco?: string };
export type ProdutoOption = {
  id: number;
  nome: string;
  familiaRisco?: string;
  nemPorUnidade: number;
  grupoCompatibilidade?: string;
  filtroTecnico?: string;
  calibre?: string;
};

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function mapProduto(p: Record<string, unknown>): ProdutoOption {
  return {
    id: Number(p.Id ?? p.id ?? 0),
    nome: String(p.Nome ?? p.nome ?? ""),
    familiaRisco: (p.FamiliaRisco ?? p.familiaRisco) as string | undefined,
    nemPorUnidade: Number(p.NEMPorUnidade ?? p.nemPorUnidade ?? 0),
    grupoCompatibilidade: (p.GrupoCompatibilidade ?? p.grupoCompatibilidade) as string | undefined,
    filtroTecnico: (p.FiltroTecnico ?? p.filtroTecnico) as string | undefined,
    calibre: (p.Calibre ?? p.calibre) as string | undefined,
  };
}

/** Dados para selects do formulário de entrada (paióis + produtos filtrados). */
export async function fetchEntradaRegistarForm(
  token: string,
  opts: {
    paiolId: string;
    classificacao: string;
    grupoCompatibilidade: string;
    filtroTecnico: string;
    calibre: string;
  }
): Promise<{ paiois: PaiolOption[]; produtos: ProdutoOption[] }> {
  const params = new URLSearchParams();
  if (opts.paiolId) params.set("paiolId", opts.paiolId);
  if (opts.classificacao) params.set("classificacao", opts.classificacao);
  if (opts.grupoCompatibilidade) params.set("grupoCompatibilidade", opts.grupoCompatibilidade);
  if (opts.filtroTecnico) params.set("filtroTecnico", opts.filtroTecnico);
  if (opts.calibre) params.set("calibre", opts.calibre);

  const auth = authHeaders(token);
  const q = params.toString();

  const [entradaRes, produtosRes] = await Promise.all([
    fetch(`${apiPath("api/entrada-paiol")}/registar?${q}`, { headers: auth }).then(async (res) => {
      if (res.status === 401) return null;
      const data: unknown = await res.json();
      return typeof data === "object" && data !== null ? (data as Record<string, unknown>) : null;
    }),
    fetch(`${apiPath("api/produtos")}?${q}`, { headers: auth }).then(async (res) => {
      if (res.status === 401) return null;
      const data: unknown = await res.json();
      return typeof data === "object" && data !== null ? (data as Record<string, unknown>) : null;
    }),
  ]);

  const paioisRaw = (entradaRes?.paióis ?? entradaRes?.paiois) as Array<Record<string, unknown>> | undefined;
  const paiois: PaiolOption[] = Array.isArray(paioisRaw)
    ? paioisRaw.map((p) => ({
        id: Number(p.Id ?? p.id ?? 0),
        nome: String(p.Nome ?? p.nome ?? ""),
        estado: (p.Estado ?? p.estado) as string | undefined,
        perfilRisco: (p.PerfilRisco ?? p.perfilRisco) as string | undefined,
      }))
    : [];

  const fromEntrada = (entradaRes?.produtos ?? entradaRes?.Produtos) as Array<Record<string, unknown>> | undefined;
  const fromCatalog = (produtosRes?.items ?? produtosRes?.Items) as Array<Record<string, unknown>> | undefined;
  const list = Array.isArray(fromCatalog) ? fromCatalog : Array.isArray(fromEntrada) ? fromEntrada : [];
  const produtos = list.map((x) => mapProduto(x));

  return { paiois, produtos };
}
