import { calcularEstadoCartaoCidadao } from "./cartaoCidadaoConformidade";

export type CartaoCidadaoFormState = {
  ativa: boolean;
  nif: string;
  morada: string;
  dataValidade: string;
};

export const CARTAO_CIDADAO_VAZIO: CartaoCidadaoFormState = {
  ativa: false,
  nif: "",
  morada: "",
  dataValidade: "",
};

export const FILE_ACCEPT_CARTAO_CIDADAO = ".pdf,.jpg,.jpeg,.png";

export function temFicheiroCartaoCidadao(opts: {
  mode: "create" | "edit";
  ccFile: File | null;
  existingDoc?: boolean;
  removerDoc?: boolean;
}): boolean {
  if (opts.ccFile) return true;
  if (opts.mode === "create") return false;
  return Boolean(opts.existingDoc && !opts.removerDoc);
}

export function validarCartaoCidadaoForm(opts: {
  ativa: boolean;
  nif: string;
  morada: string;
  dataValidade: string;
  temFicheiro: boolean;
}): string | null {
  if (!opts.ativa) return null;
  const nif = opts.nif.replace(/\s/g, "");
  if (!nif) {
    return "Preencha o NIF do cartão de cidadão.";
  }
  if (!/^\d{9}$/.test(nif)) {
    return "O NIF deve ter nove dígitos.";
  }
  if (!opts.morada.trim()) {
    return "Indique a morada do cartão de cidadão.";
  }
  if (!opts.dataValidade.trim()) {
    return "Indique a data de validade do cartão de cidadão.";
  }
  const validade = new Date(opts.dataValidade);
  if (Number.isNaN(validade.getTime())) {
    return "A data de validade do cartão não é válida.";
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (validade < hoje) {
    return "A data de validade não pode ser anterior a hoje.";
  }
  if (!opts.temFicheiro) {
    return "Anexe o documento do cartão de cidadão.";
  }
  return null;
}

export function appendCartaoCidadaoFormData(
  fd: FormData,
  cartao: CartaoCidadaoFormState,
  ccFile: File | null
): void {
  fd.append("RegistarCartaoCidadao", cartao.ativa ? "true" : "false");
  if (cartao.ativa) {
    fd.append("Funcionario.NIF", cartao.nif.replace(/\s/g, "").trim());
    fd.append("Funcionario.Morada", cartao.morada.trim());
    fd.append("Funcionario.DataValidadeCartaoCidadao", cartao.dataValidade.trim());
    if (ccFile) fd.append("CartaoCidadaoFicheiro", ccFile);
  } else {
    fd.append("Funcionario.NIF", "");
    fd.append("Funcionario.Morada", "");
    fd.append("Funcionario.DataValidadeCartaoCidadao", "");
  }
}

export function estadoCartaoCidadaoAtualForm(
  cartao: CartaoCidadaoFormState,
  temFicheiro: boolean
) {
  return calcularEstadoCartaoCidadao(
    temFicheiro,
    cartao.nif,
    cartao.morada,
    cartao.dataValidade
  );
}
