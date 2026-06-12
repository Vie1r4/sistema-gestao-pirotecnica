/**
 * Tipos e helpers para a área Encomendas.
 * Dados vêm apenas da API (encomendasApi). Sem localStorage/sessionStorage.
 */

import type { Cliente } from "@/app/lib/clientes";
import type { Produto } from "@/app/lib/produtos";
import { lerCampo } from "@/app/lib/apiCase";

// --- Estados da encomenda ---
export const ESTADOS_ENCOMENDA = ["Pendente", "Aceite", "Rejeitada", "Em preparação", "Concluída"] as const;
export type EstadoEncomenda = (typeof ESTADOS_ENCOMENDA)[number];

/** Estados em que existe reserva de stock */
export const ESTADOS_COM_RESERVA: EstadoEncomenda[] = ["Pendente", "Aceite"];
export const TODOS_ESTADOS = [...ESTADOS_ENCOMENDA] as const;

// --- Tipos base ---
export type Encomenda = {
  id: string;
  clienteId: string;
  estado: EstadoEncomenda;
  dataCriacao: string;
  dataEntrega?: string;
  observacoes?: string;
  criadoPorUserId?: string;
  /** Nome de exibição; os UserIds do Identity não vêm na API de listagem/detalhe. */
  funcionarioAceiteNome?: string;
  funcionarioPreparouNome?: string;
  dataConclusao?: string;
  motivoRejeicao?: string;
  coordenadorPirotecnicoId?: string | null;
};

export type EncomendaItem = {
  id: string;
  encomendaId: string;
  produtoId: string;
  quantidadePedida: number;
};

export type Reserva = {
  id: string;
  encomendaId: string;
  encomendaItemId: string;
  produtoId: string;
  quantidade: number;
};

// --- ViewModels ---
export type EncomendaComClienteEItens = Encomenda & {
  cliente: Cliente | null;
  itens: (EncomendaItem & { produto?: Produto | null; produtoNome?: string })[];
  stockPorProduto: Map<string, number>;
};

export type EncomendaDraftViewModel = {
  clienteId: string;
  itens: EncomendaItemCriarViewModel[];
};

export type EncomendaItemCriarViewModel = {
  produtoId: string;
  quantidade: number;
  produtoNome?: string;
};

export type RetiradaPreparacaoInput = {
  encomendaItemId: string;
  paiolId: string;
  quantidade: number;
};

// --- Permissões ---
export function podeEditarEncomenda(
  encomenda: Encomenda,
  currentUserId: string | null,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;
  if (!currentUserId) return false;
  return encomenda.criadoPorUserId === currentUserId;
}

// --- Linha da listagem ---
export type EncomendaLinha = {
  id: string;
  clienteId: string;
  estado: EstadoEncomenda | string;
  dataCriacao: string;
  dataEntrega?: string;
  clienteNome?: string;
};

/** Mapeia um item da listagem da API para `EncomendaLinha`. */
export function mapApiToEncomendaLinha(e: Record<string, unknown>): EncomendaLinha {
  const id = e.id ?? e.Id;
  const clienteId = e.clienteId ?? e.ClienteId;
  const estadoVal = e.estado ?? e.Estado ?? "Pendente";
  const dataCriacao = e.dataCriacao ?? e.DataCriacao;
  const dataEntrega = e.dataEntrega ?? e.DataEntrega;
  const cliente = (e.cliente ?? e.Cliente) as { nome?: string } | undefined;
  return {
    id: String(id ?? ""),
    clienteId: String(clienteId ?? ""),
    estado: String(estadoVal),
    dataCriacao: typeof dataCriacao === "string" ? dataCriacao : new Date().toISOString(),
    dataEntrega: dataEntrega ? (typeof dataEntrega === "string" ? dataEntrega : "") : undefined,
    clienteNome: cliente?.nome,
  };
}

/** Mapeia a resposta de detalhe da API para o ViewModel completo (cliente + itens + stock). */
export function mapApiToEncomendaDetalhe(data: Record<string, unknown>): EncomendaComClienteEItens | null {
  const enc = data?.encomenda ?? data?.Encomenda;
  if (!enc || typeof enc !== "object") return null;
  const e = enc as Record<string, unknown>;
  const get = (key: string) => lerCampo(e, key);
  const funcionarioAceiteNome = (data?.funcionarioAceiteNome ?? data?.FuncionarioAceiteNome) as string | undefined;
  const funcionarioPreparouNome = (data?.funcionarioPreparouNome ?? data?.FuncionarioPreparouNome) as string | undefined;
  const stockPorProdutoRaw = data?.stockPorProduto ?? data?.StockPorProduto;
  const stockMap = new Map<string, number>();
  if (stockPorProdutoRaw && typeof stockPorProdutoRaw === "object") {
    for (const [k, v] of Object.entries(stockPorProdutoRaw)) {
      if (typeof v === "number") stockMap.set(String(k), v);
    }
  }
  const dataCriacao = get("dataCriacao");
  const dataEntrega = get("dataEntrega");
  const dataConclusao = get("dataConclusao");
  const clienteRaw = get("cliente");
  const clienteObj = clienteRaw && typeof clienteRaw === "object" ? (clienteRaw as Record<string, unknown>) : null;
  const itensRaw = get("itens");
  const itensArr = Array.isArray(itensRaw) ? itensRaw : [];
  return {
    id: String(get("id") ?? ""),
    clienteId: String(get("clienteId") ?? ""),
    estado: (get("estado") ?? "Pendente") as EstadoEncomenda,
    dataCriacao: dataCriacao ? (typeof dataCriacao === "string" ? dataCriacao : new Date(dataCriacao as string).toISOString()) : new Date().toISOString(),
    dataEntrega: dataEntrega ? (typeof dataEntrega === "string" ? dataEntrega : new Date(dataEntrega as string).toISOString().slice(0, 10)) : undefined,
    observacoes: get("observacoes") as string | undefined,
    motivoRejeicao: get("motivoRejeicao") as string | undefined,
    funcionarioAceiteNome,
    funcionarioPreparouNome,
    dataConclusao: dataConclusao ? (typeof dataConclusao === "string" ? dataConclusao : new Date(dataConclusao as string).toISOString()) : undefined,
    cliente: clienteObj
      ? ({
          id: String(clienteObj.id ?? clienteObj.Id ?? ""),
          nome: String(clienteObj.nome ?? clienteObj.Nome ?? ""),
          tipoCliente: "Empresa" as const,
          dataRegisto: new Date().toISOString(),
          documentosExtras: [],
          disponivel: (clienteObj.disponivel ?? clienteObj.Disponivel ?? true) as boolean,
        } as Cliente & { disponivel?: boolean })
      : null,
    itens: itensArr.map((i: Record<string, unknown>) => {
      const gi = (k: string) => lerCampo(i, k);
      const prod = gi("produto");
      const prodObj = prod && typeof prod === "object" ? (prod as Record<string, unknown>) : null;
      return {
        id: String(gi("id") ?? ""),
        encomendaId: String(gi("encomendaId") ?? ""),
        produtoId: String(gi("produtoId") ?? ""),
        quantidadePedida: Number(gi("quantidadePedida") ?? 0),
        produto: prodObj ? { id: String(prodObj.id ?? prodObj.Id ?? ""), nome: String(prodObj.nome ?? prodObj.Nome ?? "") } as Produto : null,
        produtoNome: prodObj ? String(prodObj.nome ?? prodObj.Nome ?? "") : undefined,
      };
    }) as (EncomendaItem & { produto?: Produto | null; produtoNome?: string })[],
    stockPorProduto: stockMap,
  };
}

// --- Formulário de edição ---
export type EncomendaItemEdit = { produtoId: string; produtoNome: string; quantidade: number };

export type EncomendaFormData = {
  id: string;
  clienteId: string;
  clienteNome: string;
  estado: string;
  dataEntrega: string;
  observacoes: string;
  coordenadorPirotecnicoId: string;
  itens: EncomendaItemEdit[];
};

/** Mapeia a resposta de detalhe para o formulário de edição. */
export function mapApiToEncomendaForm(data: { encomenda: Record<string, unknown> }): EncomendaFormData {
  const e = data.encomenda;
  const get = (k: string) => lerCampo(e, k);
  const itensRaw = get("itens") as Array<Record<string, unknown>> | undefined;
  const itens: EncomendaItemEdit[] = (itensRaw ?? []).map((i) => {
    const gi = (key: string) => lerCampo(i, key);
    const prod = gi("produto");
    const prodObj = prod && typeof prod === "object" ? (prod as Record<string, unknown>) : null;
    const nome = prodObj ? String(prodObj.nome ?? prodObj.Nome ?? "") : "";
    return {
      produtoId: String(gi("produtoId") ?? ""),
      produtoNome: nome,
      quantidade: Number(gi("quantidadePedida") ?? 0),
    };
  });
  const cliente = get("cliente");
  const clienteObj = cliente && typeof cliente === "object" ? (cliente as Record<string, unknown>) : null;
  const dataEntregaRaw = get("dataEntrega");
  const dataEntregaStr =
    dataEntregaRaw != null
      ? typeof dataEntregaRaw === "string"
        ? dataEntregaRaw.slice(0, 10)
        : new Date(dataEntregaRaw as string).toISOString().slice(0, 10)
      : "";
  const coordRaw = get("coordenadorPirotecnicoId");
  return {
    id: String(get("id") ?? ""),
    clienteId: String(get("clienteId") ?? ""),
    clienteNome: clienteObj ? String(clienteObj.nome ?? clienteObj.Nome ?? "") : "",
    estado: String(get("estado") ?? "Pendente"),
    dataEntrega: dataEntregaStr,
    observacoes: String(get("observacoes") ?? ""),
    coordenadorPirotecnicoId: coordRaw != null ? String(coordRaw) : "",
    itens,
  };
}

// --- Cor para estado (CSS classes) ---
export function corEstado(estado: EstadoEncomenda | string): string {
  switch (estado) {
    case "Pendente":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "Aceite":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    case "Rejeitada":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    case "Em preparação":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
    case "Concluída":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
}
