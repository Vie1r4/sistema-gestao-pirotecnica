import { describe, expect, it } from "vitest";
import {
  calcularEstadoLicencaOperador,
  DIAS_AVISO_EXPIRACAO_LICENCA,
} from "@/app/lib/licencaOperadorConformidade";
import {
  temFicheiroLicencaOperador,
  validarLicencaOperadorForm,
} from "@/app/lib/licencaOperadorForm";

describe("licencaOperadorConformidade", () => {
  const ref = new Date("2026-07-07T12:00:00");

  it("devolve Ausente sem dados", () => {
    expect(calcularEstadoLicencaOperador(false, "", "", ref)).toBe("Ausente");
  });

  it("devolve Incompleta se falta ficheiro", () => {
    expect(calcularEstadoLicencaOperador(false, "123", "2027-01-01", ref)).toBe("Incompleta");
  });

  it("devolve AExpirar dentro de 60 dias", () => {
    const validade = new Date(ref);
    validade.setDate(validade.getDate() + DIAS_AVISO_EXPIRACAO_LICENCA);
    const iso = validade.toISOString().slice(0, 10);
    expect(calcularEstadoLicencaOperador(true, "123", iso, ref)).toBe("AExpirar");
  });

  it("devolve Valida além de 60 dias", () => {
    expect(calcularEstadoLicencaOperador(true, "123", "2028-01-01", ref)).toBe("Valida");
  });
});

describe("licencaOperadorForm", () => {
  it("exige todos os campos quando ativa", () => {
    expect(
      validarLicencaOperadorForm({
        ativa: true,
        numeroCredencial: "",
        dataValidade: "2028-01-01",
        temFicheiro: true,
      })
    ).toMatch(/CRED/);
  });

  it("aceita licença completa", () => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const data = amanha.toISOString().slice(0, 10);
    expect(
      validarLicencaOperadorForm({
        ativa: true,
        numeroCredencial: "3412",
        dataValidade: data,
        temFicheiro: true,
      })
    ).toBeNull();
  });

  it("deteta ficheiro existente na edição", () => {
    expect(
      temFicheiroLicencaOperador({
        mode: "edit",
        licFile: null,
        existingDoc: true,
        removerDoc: false,
      })
    ).toBe(true);
  });
});
