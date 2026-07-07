import { describe, expect, it } from "vitest";
import {
  calcularEstadoCartaoCidadao,
  DIAS_AVISO_EXPIRACAO_CARTAO_CIDADAO,
} from "@/app/lib/cartaoCidadaoConformidade";
import {
  temFicheiroCartaoCidadao,
  validarCartaoCidadaoForm,
} from "@/app/lib/cartaoCidadaoForm";

describe("cartaoCidadaoConformidade", () => {
  const ref = new Date("2026-07-07T12:00:00");

  it("devolve Ausente sem dados", () => {
    expect(calcularEstadoCartaoCidadao(false, "", "", "", ref)).toBe("Ausente");
  });

  it("devolve Incompleta se falta ficheiro", () => {
    expect(calcularEstadoCartaoCidadao(false, "123456789", "Rua A", "2027-01-01", ref)).toBe(
      "Incompleta"
    );
  });

  it("devolve AExpirar dentro de 60 dias", () => {
    const validade = new Date(ref);
    validade.setDate(validade.getDate() + DIAS_AVISO_EXPIRACAO_CARTAO_CIDADAO);
    const iso = validade.toISOString().slice(0, 10);
    expect(calcularEstadoCartaoCidadao(true, "123456789", "Rua A", iso, ref)).toBe("AExpirar");
  });

  it("devolve Valida além de 60 dias", () => {
    expect(calcularEstadoCartaoCidadao(true, "123456789", "Rua A", "2028-01-01", ref)).toBe(
      "Valida"
    );
  });
});

describe("cartaoCidadaoForm", () => {
  it("exige NIF quando ativo", () => {
    expect(
      validarCartaoCidadaoForm({
        ativa: true,
        nif: "",
        morada: "Rua A",
        dataValidade: "2028-01-01",
        temFicheiro: true,
      })
    ).toMatch(/NIF/);
  });

  it("aceita cartão completo", () => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const data = amanha.toISOString().slice(0, 10);
    expect(
      validarCartaoCidadaoForm({
        ativa: true,
        nif: "123456789",
        morada: "Rua Exemplo 1",
        dataValidade: data,
        temFicheiro: true,
      })
    ).toBeNull();
  });

  it("deteta ficheiro existente na edição", () => {
    expect(
      temFicheiroCartaoCidadao({
        mode: "edit",
        ccFile: null,
        existingDoc: true,
        removerDoc: false,
      })
    ).toBe(true);
  });
});
