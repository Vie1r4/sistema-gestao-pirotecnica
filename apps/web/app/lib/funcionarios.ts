export type CargoFuncionario = "Admin" | "Armazém" | "Gestor" | "Comercial";

export type DocExtra = { id: string; nome: string };

export type DocumentosFuncionario = {
  cartaoCidadao?: string;
  adr?: string;
  licencaOperador?: string;
  outros?: string;
  extras: DocExtra[];
};

export type Funcionario = {
  id: string;
  nomeCompleto: string;
  /** N.º credencial pirotécnica (CRED) — usado na declaração PSP. */
  numeroCredencial?: string;
  nif?: string;
  email?: string;
  telefone?: string;
  morada?: string;
  nss?: string;
  iban?: string;
  cargo: CargoFuncionario;
  notas?: string;
  dataRegisto: string;
  contaAssociada: boolean;
  emailConfirmado?: boolean;
  userId?: string;
  /** Definido no GET detalhe quando a API indica conta do utilizador atual (sem depender do UserId no JSON). */
  associadoAoUtilizadorAtual?: boolean;
  /** False após eliminação lógica da ficha (nome mantém-se no histórico). */
  disponivel?: boolean;
  documentos?: DocumentosFuncionario;
};

/** Tipos e constantes para a área Funcionários. Dados vêm apenas da API (funcionariosApi). Sem localStorage. */
export const CARGOS: CargoFuncionario[] = ["Admin", "Armazém", "Gestor", "Comercial"];
