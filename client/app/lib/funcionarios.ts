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
  documentos?: DocumentosFuncionario;
};

/** Tipos e constantes para a área Funcionários. Dados vêm apenas da API (funcionariosApi). Sem localStorage. */
export const CARGOS: CargoFuncionario[] = ["Admin", "Armazém", "Gestor", "Comercial"];
