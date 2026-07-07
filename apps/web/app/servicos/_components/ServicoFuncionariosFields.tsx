"use client";

import Link from "next/link";
import {
  applyCoordenadorSelection,
  applyEquipaToggle,
  elegivelEquipa,
  elegivelCoordenadorPirotecnico,
  rotuloCoordenadorPirotecnico,
  type EquipaCoordenadorState,
  type FuncionarioServicoOpt,
} from "@/app/lib/servicosFuncionariosForm";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const hintClass = "mt-1 text-xs text-gray-500 dark:text-gray-400";

type Props = {
  inputClass: string;
  funcionarios: FuncionarioServicoOpt[];
  state: EquipaCoordenadorState;
  onStateChange: (state: EquipaCoordenadorState) => void;
};

export default function ServicoFuncionariosFields({
  inputClass,
  funcionarios,
  state,
  onStateChange,
}: Props) {
  const { equipaIds, coordenadorPirotecnicoId } = state;
  const comLicenca = funcionarios.filter(elegivelEquipa);
  const candidatosCoordenador = funcionarios.filter((f) => equipaIds.has(f.id));

  return (
    <>
      <div>
        <span className={labelClass}>Equipa</span>
        <p className={hintClass}>
          Registo histórico do serviço. Selecione os membros presentes; o responsável pirotécnico de cada zona
          escolhe-se abaixo entre estes membros. O coordenador pirotécnico tem de estar na equipa.
        </p>
        {funcionarios.length === 0 ? (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            Não há funcionários registados.{" "}
            <Link href="/funcionarios" className="text-[#f97316] hover:underline">
              Criar fichas
            </Link>
          </p>
        ) : (
          <ul className="mt-2 space-y-1">
            {funcionarios.map((f) => (
              <li key={`eq-${f.id}`}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={equipaIds.has(f.id)}
                    onChange={() => onStateChange(applyEquipaToggle(state, f.id))}
                    className="rounded border-gray-300"
                  />
                  <span>
                    {f.nomeCompleto}
                    {coordenadorPirotecnicoId === f.id && (
                      <span className="ml-1 text-xs text-[#57534e] dark:text-gray-400">
                        (coordenador pirotécnico)
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
        {funcionarios.length > 0 && comLicenca.length === 0 && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Nenhum membro tem credencial — o coordenador pirotécnico (PSP) ficará indisponível até carregar documentos.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="coordenadorPirotecnicoId" className={labelClass}>
          Coordenador pirotécnico
        </label>
        <p className={hintClass}>
          Opcional — usado na declaração PSP. Tem de fazer parte da equipa. Requer credencial e n.º CRED na
          ficha do funcionário.{" "}
          <Link href="/funcionarios" className="text-[#f97316] hover:underline">
            Gerir funcionários
          </Link>
        </p>
        {equipaIds.size === 0 ? (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            Selecione primeiro membros na equipa para designar o coordenador pirotécnico.
          </p>
        ) : (
          <select
            id="coordenadorPirotecnicoId"
            value={coordenadorPirotecnicoId}
            onChange={(e) => onStateChange(applyCoordenadorSelection(state, e.target.value))}
            className={inputClass + " mt-2 w-full"}
          >
            <option value="">— Selecione —</option>
            {candidatosCoordenador.map((f) => (
              <option key={`coord-${f.id}`} value={f.id} disabled={!elegivelCoordenadorPirotecnico(f)}>
                {rotuloCoordenadorPirotecnico(f)}
              </option>
            ))}
          </select>
        )}
      </div>
    </>
  );
}
