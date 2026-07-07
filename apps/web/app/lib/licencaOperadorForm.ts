import { calcularEstadoLicencaOperador } from "./licencaOperadorConformidade";

export type LicencaOperadorFormState = {
  ativa: boolean;
  numeroCredencial: string;
  dataValidade: string;
};

export const LICENCA_OPERADOR_VAZIA: LicencaOperadorFormState = {
  ativa: false,
  numeroCredencial: "",
  dataValidade: "",
};

export const FILE_ACCEPT_LICENCA = ".pdf,.jpg,.jpeg,.png";

export function temFicheiroLicencaOperador(opts: {
  mode: "create" | "edit";
  licFile: File | null;
  existingDoc?: boolean;
  removerDoc?: boolean;
}): boolean {
  if (opts.licFile) return true;
  if (opts.mode === "create") return false;
  return Boolean(opts.existingDoc && !opts.removerDoc);
}

export function validarLicencaOperadorForm(opts: {
  ativa: boolean;
  numeroCredencial: string;
  dataValidade: string;
  temFicheiro: boolean;
}): string | null {
  if (!opts.ativa) return null;
  if (!opts.numeroCredencial.trim()) {
    return "Preencha o n.º de credencial (CRED).";
  }
  if (!opts.dataValidade.trim()) {
    return "Indique a data de validade da credencial.";
  }
  const validade = new Date(opts.dataValidade);
  if (Number.isNaN(validade.getTime())) {
    return "A data de validade da credencial não é válida.";
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (validade < hoje) {
    return "A data de validade não pode ser anterior a hoje.";
  }
  if (!opts.temFicheiro) {
    return "Anexe o documento da credencial.";
  }
  return null;
}

export function appendLicencaOperadorFormData(
  fd: FormData,
  licenca: LicencaOperadorFormState,
  licFile: File | null
): void {
  fd.append("RegistarLicencaOperador", licenca.ativa ? "true" : "false");
  if (licenca.ativa) {
    fd.append("Funcionario.NumeroCredencial", licenca.numeroCredencial.trim());
    fd.append("Funcionario.DataValidadeLicencaOperador", licenca.dataValidade.trim());
    if (licFile) fd.append("LicencaOperadorFicheiro", licFile);
  } else {
    fd.append("Funcionario.NumeroCredencial", "");
    fd.append("Funcionario.DataValidadeLicencaOperador", "");
  }
}

export function estadoLicencaAtualForm(
  licenca: LicencaOperadorFormState,
  temFicheiro: boolean
) {
  return calcularEstadoLicencaOperador(
    temFicheiro,
    licenca.numeroCredencial,
    licenca.dataValidade
  );
}
