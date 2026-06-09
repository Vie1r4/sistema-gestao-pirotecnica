/**
 * Tipos e helpers para a área Encomendas.
 * Dados vêm apenas da API (encomendasApi). Sem localStorage/sessionStorage.
 */

import type { Cliente } from "@/app/lib/clientes";
import type { Produto } from "@/app/lib/produtos";

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
