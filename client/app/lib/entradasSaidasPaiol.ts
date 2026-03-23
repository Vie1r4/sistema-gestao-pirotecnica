/**
 * Tipos para entradas e saídas de paiol (stock).
 * Dados vêm apenas da API (api/entrada-paiol, api/saida-paiol). Sem localStorage.
 */

export type EntradaPaiol = {
  id: string;
  paiolId: string;
  produtoId: string;
  quantidade: number;
  dataEntrada: string;
  funcionarioRegistouUserId?: string;
  numeroLote?: string;
  dataFabrico?: string;
  dataValidade?: string;
};

export type SaidaPaiol = {
  id: string;
  paiolId: string;
  produtoId: string;
  quantidade: number;
  dataSaida: string;
  funcionarioRetirouUserId?: string;
  encomendaId?: string;
  entradaPaiolId?: string;
};

export type CargaPaiolItem = {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  nemPorUnidade: number;
  divisao: string;
};

export type EntradaComRestante = { entrada: EntradaPaiol; restante: number };
