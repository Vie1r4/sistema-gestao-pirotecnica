/** Opções de funcionário no formulário de serviço (create/edit). */

export type FuncionarioServicoOpt = {
  id: string;
  nomeCompleto: string;
  numeroCredencial?: string;
  hasDocumentoADR: boolean;
  hasLicencaOperador: boolean;
};

export function mapFuncionarioServicoOpt(raw: Record<string, unknown>): FuncionarioServicoOpt {
  const cred = (raw.numeroCredencial ?? raw.NumeroCredencial) as string | undefined;
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    nomeCompleto: String(raw.nomeCompleto ?? raw.NomeCompleto ?? "").trim(),
    numeroCredencial: cred?.trim() || undefined,
    hasDocumentoADR: Boolean(raw.hasDocumentoADR ?? raw.HasDocumentoADR),
    hasLicencaOperador: Boolean(raw.hasLicencaOperador ?? raw.HasLicencaOperador),
  };
}

export function mapFuncionariosServico(raw: unknown): FuncionarioServicoOpt[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => mapFuncionarioServicoOpt(item as Record<string, unknown>))
    .filter((f) => f.id && f.nomeCompleto);
}

/** Licença de operador — exigida para coordenador pirotécnico (PSP). */
export function elegivelEquipa(f: FuncionarioServicoOpt): boolean {
  return f.hasLicencaOperador;
}

/** Coordenador na declaração PSP: licença + n.º CRED na ficha. */
export function elegivelCoordenadorPirotecnico(f: FuncionarioServicoOpt): boolean {
  return f.hasLicencaOperador && Boolean(f.numeroCredencial);
}

export function motivoInelegivelEquipa(f: FuncionarioServicoOpt): string {
  return f.hasLicencaOperador ? "" : " (falta licença de operador)";
}

export function rotuloCoordenadorPirotecnico(f: FuncionarioServicoOpt): string {
  if (!f.hasLicencaOperador) return `${f.nomeCompleto} (falta licença de operador)`;
  if (!f.numeroCredencial) return `${f.nomeCompleto} (falta n.º CRED na ficha)`;
  return `${f.nomeCompleto} — CRED ${f.numeroCredencial}`;
}

export function membrosEquipaParaZonas(
  funcionarios: FuncionarioServicoOpt[],
  equipaIds: Set<string>
): Array<{ id: string; nomeCompleto: string }> {
  return funcionarios
    .filter((f) => equipaIds.has(f.id))
    .map((f) => ({ id: f.id, nomeCompleto: f.nomeCompleto }));
}
