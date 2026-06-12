"use client";

import Link from "next/link";
import {
  elegivelEquipa,
  elegivelCoordenadorPirotecnico,
  rotuloCoordenadorPirotecnico,
  type FuncionarioServicoOpt,
} from "@/app/lib/servicosFuncionariosForm";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const hintClass = "mt-1 text-xs text-gray-500 dark:text-gray-400";

type Props = {
  inputClass: string;
  funcionarios: FuncionarioServicoOpt[];
  coordenadorPirotecnicoId: string;
  equipaIds: Set<string>;
  onCoordenadorChange: (id: string) => void;
  onToggleEquipa: (id: string) => void;
};

export default function ServicoFuncionariosFields({
  inputClass,
  funcionarios,
  coordenadorPirotecnicoId,
  equipaIds,
  onCoordenadorChange,
  onToggleEquipa,
}: Props) {
  const comLicenca = funcionarios.filter(elegivelEquipa);

  return (
    <>
      <div>
        <label htmlFor="coordenadorPirotecnicoId" className={labelClass}>
          Coordenador pirotécnico
        </label>
        <p className={hintClass}>
          Opcional — usado na declaração PSP. Requer licença de operador e n.º CRED na ficha do funcionário.{" "}
          <Link href="/funcionarios" className="text-[#f97316] hover:underline">
            Gerir funcionários
          </Link>
        </p>
        <select
          id="coordenadorPirotecnicoId"
          value={coordenadorPirotecnicoId}
          onChange={(e) => onCoordenadorChange(e.target.value)}
          className={inputClass + " mt-2 w-full"}
        >
          <option value="">— Selecione —</option>
          {funcionarios.map((f) => (
            <option key={`coord-${f.id}`} value={f.id} disabled={!elegivelCoordenadorPirotecnico(f)}>
              {rotuloCoordenadorPirotecnico(f)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className={labelClass}>Equipa</span>
        <p className={hintClass}>
          Registo histórico do serviço. Selecione os membros presentes; o responsável pirotécnico de cada zona
          escolhe-se abaixo entre estes membros.
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
                    onChange={() => onToggleEquipa(f.id)}
                    className="rounded border-gray-300"
                  />
                  <span>{f.nomeCompleto}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
        {funcionarios.length > 0 && comLicenca.length === 0 && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Nenhum membro tem licença de operador — o coordenador pirotécnico (PSP) ficará indisponível até carregar documentos.
          </p>
        )}
      </div>
    </>
  );
}
