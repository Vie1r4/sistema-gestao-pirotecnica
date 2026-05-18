/**
 * API do painel Admin: utilizadores, roles, associação utilizador ↔ funcionário.
 * Todas as rotas requerem role Admin.
 */

import { apiPath } from "./apiConfig";

export type UtilizadorComRoles = {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  funcionarioAssociadoNome: string | null;
};

export type RoleItem = { nome: string; atribuido: boolean };

export type EditarUtilizadorModel = {
  id: string;
  userName: string;
  email: string;
  roles: RoleItem[];
  funcionarioId: number | null;
};

export type FuncionarioDisponivel = { id: number; nomeCompleto: string };

function mapUtilizador(raw: Record<string, unknown>): UtilizadorComRoles {
  const roles = (raw.roles ?? raw.Roles) as string[] | undefined;
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    userName: String(raw.userName ?? raw.UserName ?? ""),
    email: String(raw.email ?? raw.Email ?? ""),
    roles: Array.isArray(roles) ? roles : [],
    funcionarioAssociadoNome:
      raw.funcionarioAssociadoNome != null || raw.FuncionarioAssociadoNome != null
        ? String(raw.funcionarioAssociadoNome ?? raw.FuncionarioAssociadoNome ?? "")
        : null,
  };
}

function mapRoleItem(raw: Record<string, unknown>): RoleItem {
  return {
    nome: String(raw.nome ?? raw.Nome ?? ""),
    atribuido: Boolean(raw.atribuido ?? raw.Atribuido),
  };
}

export type AdminStats = {
  totalUtilizadores: number;
  totalEncomendas: number;
  encomendasEsteMes: number;
  totalServicos: number;
  servicosEsteMes: number;
  totalClientes: number;
  totalFuncionarios: number;
  totalProdutos: number;
  totalPaiois: number;
  totalLogs: number;
};

export type LogSistemaItem = {
  id: number;
  acao: string;
  userId: string | null;
  userName: string | null;
  jsonDados: string | null;
  timestamp: string;
};

export type AdminLogsResponse = {
  items: LogSistemaItem[];
  paginaAtual: number;
  itensPorPagina: number;
  totalRegistos: number;
};

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** GET api/admin/stats — estatísticas para o dashboard admin */
export async function fetchAdminStats(token: string): Promise<AdminStats> {
  const res = await fetch(`${apiPath("api/admin")}/stats`, { headers: authHeaders(token) });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const raw = (await res.json()) as Record<string, unknown>;
  return {
    totalUtilizadores: Number(raw.totalUtilizadores ?? 0),
    totalEncomendas: Number(raw.totalEncomendas ?? 0),
    encomendasEsteMes: Number(raw.encomendasEsteMes ?? 0),
    totalServicos: Number(raw.totalServicos ?? 0),
    servicosEsteMes: Number(raw.servicosEsteMes ?? 0),
    totalClientes: Number(raw.totalClientes ?? 0),
    totalFuncionarios: Number(raw.totalFuncionarios ?? 0),
    totalProdutos: Number(raw.totalProdutos ?? 0),
    totalPaiois: Number(raw.totalPaiois ?? 0),
    totalLogs: Number(raw.totalLogs ?? 0),
  };
}

/** GET api/admin/logs — logs do sistema com paginação */
export async function fetchAdminLogs(
  token: string,
  opts: { pagina?: number; itensPorPagina?: number; acao?: string } = {}
): Promise<AdminLogsResponse> {
  const { pagina = 1, itensPorPagina = 50, acao = "" } = opts;
  const params = new URLSearchParams();
  params.set("pagina", String(pagina));
  params.set("itensPorPagina", String(itensPorPagina));
  if (acao) params.set("acao", acao);
  const res = await fetch(`${apiPath("api/admin")}/logs?${params}`, { headers: authHeaders(token) });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const raw = (await res.json()) as Record<string, unknown>;
  const items = Array.isArray(raw.items) ? (raw.items as Record<string, unknown>[]).map((l) => ({
    id: Number(l.id ?? l.Id ?? 0),
    acao: String(l.acao ?? l.Acao ?? ""),
    userId: l.userId != null || l.UserId != null ? String(l.userId ?? l.UserId ?? "") : null,
    userName: l.userName != null || l.UserName != null ? String(l.userName ?? l.UserName ?? "") : null,
    jsonDados: l.jsonDados != null || l.JsonDados != null ? String(l.jsonDados ?? l.JsonDados ?? "") : null,
    timestamp: String(l.timestamp ?? l.Timestamp ?? ""),
  })) : [];
  return {
    items,
    paginaAtual: Number(raw.paginaAtual ?? raw.PaginaAtual ?? 1),
    itensPorPagina: Number(raw.itensPorPagina ?? raw.ItensPorPagina ?? 50),
    totalRegistos: Number(raw.totalRegistos ?? raw.TotalRegistos ?? 0),
  };
}

/** GET api/admin — confirma acesso à área admin. */
export async function fetchAdminDashboard(token: string): Promise<{ message: string }> {
  const res = await fetch(apiPath("api/admin"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  return { message: String(data.message ?? data.Message ?? "") };
}

/** GET api/admin/utilizadores — lista de utilizadores com roles e funcionário associado. */
export async function fetchUtilizadores(token: string): Promise<UtilizadorComRoles[]> {
  const res = await fetch(`${apiPath("api/admin")}/utilizadores`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = (await res.json()) as unknown;
  const arr = Array.isArray(data) ? data : [];
  return arr.map((u: Record<string, unknown>) => mapUtilizador(u));
}

/** GET api/admin/utilizadores/{id} — dados para editar roles e funcionário. */
export async function fetchUtilizadorParaEditar(
  token: string,
  id: string
): Promise<{ model: EditarUtilizadorModel; funcionariosDisponiveis: FuncionarioDisponivel[] } | null> {
  const res = await fetch(`${apiPath("api/admin")}/utilizadores/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const modelRaw = data.model ?? data.Model;
  const funcRaw = data.funcionariosDisponiveis ?? data.FuncionariosDisponiveis;
  if (!modelRaw || typeof modelRaw !== "object") return null;
  const m = modelRaw as Record<string, unknown>;
  const rolesRaw = (m.roles ?? m.Roles) as Array<Record<string, unknown>> | undefined;
  return {
    model: {
      id: String(m.id ?? m.Id ?? ""),
      userName: String(m.userName ?? m.UserName ?? ""),
      email: String(m.email ?? m.Email ?? ""),
      roles: Array.isArray(rolesRaw) ? rolesRaw.map(mapRoleItem) : [],
      funcionarioId:
        m.funcionarioId != null || m.FuncionarioId != null
          ? Number(m.funcionarioId ?? m.FuncionarioId)
          : null,
    },
    funcionariosDisponiveis: Array.isArray(funcRaw)
      ? (funcRaw as Record<string, unknown>[]).map((f) => ({
          id: Number(f.id ?? f.Id ?? 0),
          nomeCompleto: String(f.nomeCompleto ?? f.NomeCompleto ?? ""),
        }))
      : [],
  };
}

/** PUT api/admin/utilizadores/{id} — atualizar roles e funcionário associado. */
export async function updateUtilizador(
  token: string,
  id: string,
  model: EditarUtilizadorModel
): Promise<void> {
  const res = await fetch(`${apiPath("api/admin")}/utilizadores/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: model.id,
      userName: model.userName,
      email: model.email,
      roles: model.roles,
      funcionarioId: model.funcionarioId,
    }),
  });
  if (res.status === 404) throw new Error("Utilizador não encontrado");
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = (body as { error?: string }).error ?? `Erro ${res.status}`;
    throw new Error(err);
  }
}

/** DELETE api/admin/utilizadores/{id} — eliminar utilizador (não permite eliminar a própria conta). */
export async function deleteUtilizador(token: string, id: string): Promise<void> {
  const res = await fetch(`${apiPath("api/admin")}/utilizadores/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) throw new Error("Utilizador não encontrado");
  if (res.status === 400) {
    const body = await res.json().catch(() => ({}));
    const err = (body as { error?: string }).error ?? "Não foi possível eliminar.";
    throw new Error(err);
  }
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  if (res.status !== 204 && res.status !== 200) throw new Error(`Erro ${res.status}`);
}

/** POST api/admin/clear-all-data — apaga todos os dados e contas (apenas testes). Requer Admin. */
export async function clearAllDataApi(token: string): Promise<void> {
  const res = await fetch(`${apiPath("api/admin")}/clear-all-data`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  if (!res.ok) throw new Error(`Erro ${res.status}`);
}
