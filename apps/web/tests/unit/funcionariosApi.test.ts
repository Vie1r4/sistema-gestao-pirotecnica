import { describe, expect, it } from "vitest";
import { mapApiItemToFuncionarioDetalhe } from "@/app/lib/funcionariosApi";

describe("mapApiItemToFuncionarioDetalhe", () => {
  it("mapeia campos completos em camelCase", () => {
    const f = mapApiItemToFuncionarioDetalhe({
      id: 42,
      nomeCompleto: "Ana Silva",
      numeroCredencial: "3412",
      email: "ana@teste.pt",
      cargo: "Gestor",
      hasCartaoCidadao: true,
      contaAssociada: true,
      userId: "uid-1",
      dataRegisto: "2026-01-15T10:00:00Z",
    });
    expect(f.id).toBe("42");
    expect(f.nomeCompleto).toBe("Ana Silva");
    expect(f.numeroCredencial).toBe("3412");
    expect(f.email).toBe("ana@teste.pt");
    expect(f.cargo).toBe("Gestor");
    expect(f.contaAssociada).toBe(true);
    expect(f.documentos?.cartaoCidadao).toBe("cc");
  });

  it("aceita propriedades PascalCase e JSON incompleto", () => {
    const f = mapApiItemToFuncionarioDetalhe({
      Id: 7,
      NomeCompleto: "Bob",
    });
    expect(f.id).toBe("7");
    expect(f.nomeCompleto).toBe("Bob");
    expect(f.cargo).toBe("Comercial");
    expect(f.contaAssociada).toBe(false);
    expect(f.documentos).toBeUndefined();
  });

  it("propaga contaEmailConfirmada do argumento", () => {
    const f = mapApiItemToFuncionarioDetalhe({ id: 1, nomeCompleto: "X" }, true);
    expect(f.emailConfirmado).toBe(true);
  });
});
