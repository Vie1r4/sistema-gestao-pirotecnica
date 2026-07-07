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
  /** Validade da credencial pirotécnica (ISO ou yyyy-mm-dd). */
  dataValidadeLicencaOperador?: string;
  /** Estado calculado: Ausente, Incompleta, Valida, AExpirar, Expirada. */
  estadoLicencaOperador?: string;
  /** Validade do cartão de cidadão (ISO ou yyyy-mm-dd). */
  dataValidadeCartaoCidadao?: string;
  /** Estado calculado do cartão de cidadão. */
  estadoCartaoCidadao?: string;
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

/**
 * Mapeia um item da listagem da API para `Funcionario`.
 * A API devolve `contaAssociada` / `contaEmailConfirmada` por item (sem UserId na listagem).
 */
export function mapApiToFuncionario(item: Record<string, unknown>): Funcionario {
  const nome = (item.nomeCompleto ?? item.nome ?? "") as string;
  const userId = (item.userId ?? item.UserId) as string | undefined;
  const contaAssociada = Boolean(item.contaAssociada ?? item.ContaAssociada ?? userId);
  const apiConf = item.contaEmailConfirmada ?? item.ContaEmailConfirmada;
  const emailConfirmado = typeof apiConf === "boolean" ? apiConf : undefined;
  return {
    id: String(item.id ?? item.Id ?? ""),
    nomeCompleto: nome,
    numeroCredencial: (item.numeroCredencial ?? item.NumeroCredencial) as string | undefined,
    dataValidadeLicencaOperador: (item.dataValidadeLicencaOperador ?? item.DataValidadeLicencaOperador) as
      | string
      | undefined,
    estadoLicencaOperador: (item.estadoLicencaOperador ?? item.EstadoLicencaOperador) as string | undefined,
    dataValidadeCartaoCidadao: (item.dataValidadeCartaoCidadao ?? item.DataValidadeCartaoCidadao) as
      | string
      | undefined,
    estadoCartaoCidadao: (item.estadoCartaoCidadao ?? item.EstadoCartaoCidadao) as string | undefined,
    nif: (item.nif ?? item.NIF) as string | undefined,
    email: (item.email ?? item.Email) as string | undefined,
    telefone: (item.telefone ?? item.Telefone) as string | undefined,
    morada: (item.morada ?? item.Morada) as string | undefined,
    cargo: (item.cargo ?? item.Cargo ?? "Comercial") as CargoFuncionario,
    dataRegisto: String(item.dataRegisto ?? item.DataRegisto ?? new Date().toISOString()),
    contaAssociada,
    emailConfirmado,
    userId,
  };
}
