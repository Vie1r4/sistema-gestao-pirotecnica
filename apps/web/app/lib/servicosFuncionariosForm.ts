/** Opções de funcionário no formulário de serviço (create/edit). */

export type FuncionarioServicoOpt = {
  id: string;
  nomeCompleto: string;
  numeroCredencial?: string;
  estadoLicencaOperador?: string;
  hasDocumentoADR: boolean;
  hasLicencaOperador: boolean;
};

export function mapFuncionarioServicoOpt(raw: Record<string, unknown>): FuncionarioServicoOpt {
  const cred = (raw.numeroCredencial ?? raw.NumeroCredencial) as string | undefined;
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    nomeCompleto: String(raw.nomeCompleto ?? raw.NomeCompleto ?? "").trim(),
    numeroCredencial: cred?.trim() || undefined,
    estadoLicencaOperador: (raw.estadoLicencaOperador ?? raw.EstadoLicencaOperador) as string | undefined,
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

/** Credencial pirotécnica — exigida para coordenador pirotécnico (PSP). */
export function elegivelEquipa(f: FuncionarioServicoOpt): boolean {
  return f.hasLicencaOperador;
}

/** Coordenador na declaração PSP: licença completa + n.º CRED; expirada/incompleta bloqueia. */
export function elegivelCoordenadorPirotecnico(f: FuncionarioServicoOpt): boolean {
  if (!f.hasLicencaOperador || !f.numeroCredencial) return false;
  const estado = f.estadoLicencaOperador;
  if (estado === "Expirada" || estado === "Incompleta") return false;
  return true;
}

export function motivoInelegivelEquipa(f: FuncionarioServicoOpt): string {
  return f.hasLicencaOperador ? "" : " (falta credencial)";
}

export function rotuloCoordenadorPirotecnico(f: FuncionarioServicoOpt): string {
  if (!f.hasLicencaOperador) return `${f.nomeCompleto} (falta credencial)`;
  if (!f.numeroCredencial) return `${f.nomeCompleto} (falta n.º CRED na ficha)`;
  if (f.estadoLicencaOperador === "Expirada") return `${f.nomeCompleto} (credencial expirada)`;
  if (f.estadoLicencaOperador === "Incompleta") return `${f.nomeCompleto} (credencial incompleta)`;
  if (f.estadoLicencaOperador === "AExpirar") {
    return `${f.nomeCompleto} — CRED ${f.numeroCredencial} (credencial a expirar)`;
  }
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

export type EquipaCoordenadorState = {
  equipaIds: Set<string>;
  coordenadorPirotecnicoId: string;
};

/** Ao escolher coordenador, entra automaticamente na equipa. */
export function applyCoordenadorSelection(
  state: EquipaCoordenadorState,
  coordenadorId: string
): EquipaCoordenadorState {
  const equipaIds = new Set(state.equipaIds);
  if (coordenadorId && !equipaIds.has(coordenadorId)) equipaIds.add(coordenadorId);
  return { equipaIds, coordenadorPirotecnicoId: coordenadorId };
}

/** Remover da equipa limpa coordenador se for o mesmo membro. */
export function applyEquipaToggle(
  state: EquipaCoordenadorState,
  memberId: string
): EquipaCoordenadorState {
  const equipaIds = new Set(state.equipaIds);
  if (equipaIds.has(memberId)) {
    equipaIds.delete(memberId);
    const coordenadorPirotecnicoId =
      state.coordenadorPirotecnicoId === memberId ? "" : state.coordenadorPirotecnicoId;
    return { equipaIds, coordenadorPirotecnicoId };
  }
  equipaIds.add(memberId);
  return { ...state, equipaIds };
}

/** Garante coordenador incluído na equipa (ex.: ao carregar serviço existente). */
export function ensureCoordenadorNaEquipa(state: EquipaCoordenadorState): EquipaCoordenadorState {
  const { coordenadorPirotecnicoId, equipaIds } = state;
  if (!coordenadorPirotecnicoId || equipaIds.has(coordenadorPirotecnicoId)) return state;
  const next = new Set(equipaIds);
  next.add(coordenadorPirotecnicoId);
  return { equipaIds: next, coordenadorPirotecnicoId };
}

export function validarCoordenadorNaEquipa(
  coordenadorId: string,
  equipaIds: Set<string>
): string | null {
  if (!coordenadorId) return null;
  if (!equipaIds.has(coordenadorId)) {
    return "O coordenador pirotécnico tem de fazer parte da equipa.";
  }
  return null;
}
