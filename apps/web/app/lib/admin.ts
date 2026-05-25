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
  emailConfirmed: boolean;
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
    emailConfirmed: Boolean(raw.emailConfirmed ?? raw.EmailConfirmed ?? false),
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
  utilizadoresSemEmailConfirmado: number;
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
    utilizadoresSemEmailConfirmado: Number(
      raw.utilizadoresSemEmailConfirmado ?? raw.UtilizadoresSemEmailConfirmado ?? 0
    ),
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

export type AdminHealth = {
  status: string;
  database: boolean;
  environment: string;
  version: string;
  utcNow: string;
};

/** GET api/admin/health — estado da API e base de dados */
export async function fetchAdminHealth(token: string): Promise<AdminHealth> {
  const res = await fetch(`${apiPath("api/admin")}/health`, { headers: authHeaders(token) });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const raw = (await res.json()) as Record<string, unknown>;
  return {
    status: String(raw.status ?? raw.Status ?? "unknown"),
    database: Boolean(raw.database ?? raw.Database ?? false),
    environment: String(raw.environment ?? raw.Environment ?? ""),
    version: String(raw.version ?? raw.Version ?? ""),
    utcNow: String(raw.utcNow ?? raw.UtcNow ?? ""),
  };
}

/** GET api/admin/logs — logs do sistema com paginação e filtros */
export async function fetchAdminLogs(
  token: string,
  opts: {
    pagina?: number;
    itensPorPagina?: number;
    acao?: string;
    userName?: string;
    entidade?: string;
    dataInicio?: string;
    dataFim?: string;
  } = {}
): Promise<AdminLogsResponse> {
  const {
    pagina = 1,
    itensPorPagina = 50,
    acao = "",
    userName = "",
    entidade = "",
    dataInicio = "",
    dataFim = "",
  } = opts;
  const params = new URLSearchParams();
  params.set("pagina", String(pagina));
  params.set("itensPorPagina", String(itensPorPagina));
  if (acao) params.set("acao", acao);
  if (userName) params.set("userName", userName);
  if (entidade) params.set("entidade", entidade);
  if (dataInicio) params.set("dataInicio", dataInicio);
  if (dataFim) params.set("dataFim", dataFim);
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

export type AdminUserAccountResponse = {
  success: boolean;
  message: string;
  userId?: string;
  errors?: string[];
};

async function parseAdminAccountResponse(res: Response): Promise<AdminUserAccountResponse> {
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const errorsRaw = body.errors ?? body.Errors;
  return {
    success: Boolean(body.success ?? body.Success ?? res.ok),
    message: String(body.message ?? body.Message ?? (res.ok ? "OK" : `Erro ${res.status}`)),
    userId: body.userId != null || body.UserId != null ? String(body.userId ?? body.UserId) : undefined,
    errors: Array.isArray(errorsRaw) ? errorsRaw.map(String) : undefined,
  };
}

function throwIfAccountFailed(result: AdminUserAccountResponse): void {
  if (!result.success) {
    const detail = result.errors?.length ? result.errors.join(" ") : result.message;
    throw new Error(detail || "Operação falhou.");
  }
}

export type CriarUtilizadorOpcoes = {
  roles: string[];
  funcionariosDisponiveis: FuncionarioDisponivel[];
};

/** GET api/admin/utilizadores/criar-opcoes */
export async function fetchCriarUtilizadorOpcoes(token: string): Promise<CriarUtilizadorOpcoes> {
  const res = await fetch(`${apiPath("api/admin")}/utilizadores/criar-opcoes`, {
    headers: authHeaders(token),
  });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const raw = (await res.json()) as Record<string, unknown>;
  const roles = (raw.roles ?? raw.Roles) as string[] | undefined;
  const funcRaw = raw.funcionariosDisponiveis ?? raw.FuncionariosDisponiveis;
  return {
    roles: Array.isArray(roles) ? roles : [],
    funcionariosDisponiveis: Array.isArray(funcRaw)
      ? (funcRaw as Record<string, unknown>[]).map((f) => ({
          id: Number(f.id ?? f.Id ?? 0),
          nomeCompleto: String(f.nomeCompleto ?? f.NomeCompleto ?? ""),
        }))
      : [],
  };
}

export type CreateUtilizadorPayload = {
  email: string;
  password: string;
  confirmPassword: string;
  roles: string[];
  funcionarioId: number | null;
  enviarEmailConfirmacao: boolean;
};

/** POST api/admin/utilizadores */
export async function createUtilizador(
  token: string,
  payload: CreateUtilizadorPayload
): Promise<AdminUserAccountResponse> {
  const res = await fetch(`${apiPath("api/admin")}/utilizadores`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      roles: payload.roles,
      funcionarioId: payload.funcionarioId,
      enviarEmailConfirmacao: payload.enviarEmailConfirmacao,
    }),
  });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  const result = await parseAdminAccountResponse(res);
  throwIfAccountFailed(result);
  return result;
}

/** POST api/admin/utilizadores/{id}/resend-confirm-email */
export async function resendConfirmEmailAdmin(token: string, id: string): Promise<string> {
  const res = await fetch(
    `${apiPath("api/admin")}/utilizadores/${encodeURIComponent(id)}/resend-confirm-email`,
    { method: "POST", headers: authHeaders(token) }
  );
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  const result = await parseAdminAccountResponse(res);
  throwIfAccountFailed(result);
  return result.message;
}

/** POST api/admin/utilizadores/{id}/confirm-email */
export async function confirmEmailAdmin(token: string, id: string): Promise<string> {
  const res = await fetch(
    `${apiPath("api/admin")}/utilizadores/${encodeURIComponent(id)}/confirm-email`,
    { method: "POST", headers: authHeaders(token) }
  );
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  const result = await parseAdminAccountResponse(res);
  throwIfAccountFailed(result);
  return result.message;
}

/** POST api/admin/utilizadores/{id}/send-password-reset */
export async function sendPasswordResetAdmin(token: string, id: string): Promise<string> {
  const res = await fetch(
    `${apiPath("api/admin")}/utilizadores/${encodeURIComponent(id)}/send-password-reset`,
    { method: "POST", headers: authHeaders(token) }
  );
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  const result = await parseAdminAccountResponse(res);
  throwIfAccountFailed(result);
  return result.message;
}

/** PUT api/admin/utilizadores/{id}/credenciais */
export async function updateUtilizadorCredenciais(
  token: string,
  id: string,
  email: string
): Promise<string> {
  const res = await fetch(
    `${apiPath("api/admin")}/utilizadores/${encodeURIComponent(id)}/credenciais`,
    {
      method: "PUT",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  const result = await parseAdminAccountResponse(res);
  throwIfAccountFailed(result);
  return result.message;
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
export async function clearAllDataApi(token: string): Promise<{ message: string }> {
  const res = await fetch(`${apiPath("api/admin")}/clear-all-data`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(String(data.error ?? data.Error ?? `Erro ${res.status}`));
  }
  return { message: String(data.message ?? data.Message ?? "Dados limpos.") };
}

export type BackupResult = {
  message: string;
  nomeFicheiro: string;
  tamanhoBytes: number;
  nomeFicheiroDocumentos?: string;
  tamanhoDocumentosBytes?: number;
};

export type BackupListItem = {
  nomeFicheiro: string;
  tamanhoBytes: number;
  dataCriacao: string;
  temDocumentos: boolean;
  nomeFicheiroDocumentos?: string;
  tamanhoDocumentosBytes: number;
};

export type BackupCatalogResumo = {
  total: number;
  semContasNaBd: boolean;
  backupsDeInstalacaoAnterior: boolean;
};

export type BackupsPageData = {
  items: BackupListItem[];
  resumo: BackupCatalogResumo;
};

function mapBackupItem(b: Record<string, unknown>): BackupListItem {
  return {
    nomeFicheiro: String(b.nomeFicheiro ?? b.NomeFicheiro ?? ""),
    tamanhoBytes: Number(b.tamanhoBytes ?? b.TamanhoBytes ?? 0),
    dataCriacao: String(b.dataCriacao ?? b.DataCriacao ?? ""),
    temDocumentos: Boolean(b.temDocumentos ?? b.TemDocumentos),
    nomeFicheiroDocumentos: b.nomeFicheiroDocumentos ?? b.NomeFicheiroDocumentos
      ? String(b.nomeFicheiroDocumentos ?? b.NomeFicheiroDocumentos)
      : undefined,
    tamanhoDocumentosBytes: Number(b.tamanhoDocumentosBytes ?? b.TamanhoDocumentosBytes ?? 0),
  };
}

/** GET api/admin/backups — lista backups e resumo (BD vazia vs ficheiros antigos em disco) */
export async function fetchBackups(token: string): Promise<BackupsPageData> {
  const res = await fetch(`${apiPath("api/admin")}/backups`, { headers: authHeaders(token) });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const raw = (await res.json()) as Record<string, unknown>;
  const arr = (raw.items ?? raw.Items ?? []) as Record<string, unknown>[];
  const r = (raw.resumo ?? raw.Resumo ?? {}) as Record<string, unknown>;
  return {
    items: Array.isArray(arr) ? arr.map(mapBackupItem) : [],
    resumo: {
      total: Number(r.total ?? r.Total ?? 0),
      semContasNaBd: Boolean(r.semContasNaBd ?? r.SemContasNaBd),
      backupsDeInstalacaoAnterior: Boolean(
        r.backupsDeInstalacaoAnterior ?? r.BackupsDeInstalacaoAnterior
      ),
    },
  };
}

/** DELETE api/admin/backups/{nome}.bak — apaga .bak e ZIP associado */
export async function deleteBackup(token: string, nomeFicheiro: string): Promise<void> {
  const nome = encodeURIComponent(nomeFicheiro);
  const res = await fetch(`${apiPath("api/admin")}/backups/${nome}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(String(data.error ?? data.Error ?? `Erro ${res.status}`));
  }
}

/** GET api/admin/backups/{nome}/download — descarrega .bak ou ZIP de documentos */
export async function downloadBackup(token: string, nomeFicheiro: string): Promise<void> {
  const nome = encodeURIComponent(nomeFicheiro);
  const res = await fetch(`${apiPath("api/admin")}/backups/${nome}/download`, {
    headers: authHeaders(token),
  });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeFicheiro;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export type RestoreBackupResult = {
  message: string;
  nomeFicheiro: string;
};

/** POST api/admin/backups/restore — substitui a BD pelo backup indicado */
export async function restoreBackup(token: string, nomeFicheiro: string): Promise<RestoreBackupResult> {
  const res = await fetch(`${apiPath("api/admin")}/backups/restore`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ nomeFicheiro }),
  });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(String(data.error ?? data.Error ?? `Erro ${res.status}`));
  }
  return {
    message: String(data.message ?? data.Message ?? "Restauro concluído."),
    nomeFicheiro: String(data.nomeFicheiro ?? data.NomeFicheiro ?? nomeFicheiro),
  };
}

/** POST api/admin/backups/run — executa backup manual imediato. Requer Admin. */
export async function runBackupNow(token: string): Promise<BackupResult> {
  const res = await fetch(`${apiPath("api/admin")}/backups/run`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) throw new Error("Não autorizado");
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(String(data.error ?? data.Error ?? `Erro ${res.status}`));
  }
  const docName = data.nomeFicheiroDocumentos ?? data.NomeFicheiroDocumentos;
  return {
    message: String(data.message ?? data.Message ?? ""),
    nomeFicheiro: String(data.nomeFicheiro ?? data.NomeFicheiro ?? ""),
    tamanhoBytes: Number(data.tamanhoBytes ?? data.TamanhoBytes ?? 0),
    nomeFicheiroDocumentos: docName ? String(docName) : undefined,
    tamanhoDocumentosBytes: Number(data.tamanhoDocumentosBytes ?? data.TamanhoDocumentosBytes ?? 0),
  };
}
