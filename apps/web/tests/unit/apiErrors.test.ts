import { describe, expect, it } from "vitest";
import { humanizeValidationMessage, parseApiErrorBody } from "@/app/lib/apiErrors";

describe("parseApiErrorBody", () => {
  it("lê campo error global", () => {
    const result = parseApiErrorBody({ error: "Paiol ou produto inválido." });
    expect(result.message).toBe("Paiol ou produto inválido.");
  });

  it("lê array erros do backend de entrada", () => {
    const result = parseApiErrorBody({
      error: "[ERRO_002] Paiol 1.1G só pode conter produtos 1.1G (ADR 7.5.2.2). O produto é 1.4.",
      erros: ["[ERRO_002] Paiol 1.1G só pode conter produtos 1.1G (ADR 7.5.2.2). O produto é 1.4."],
    });
    expect(result.message).toContain("Paiol 1.1G só pode conter produtos 1.1G");
    expect(result.message).not.toContain("[ERRO_002]");
  });

  it("lê ModelState ASP.NET com errorMessage aninhado", () => {
    const result = parseApiErrorBody({
      errors: {
        "": {
          errors: [{ errorMessage: "[ERRO_004] Incompatibilidade de grupos: produto do grupo B não pode coexistir com produto do grupo G já existente no paiol (ADR 7.2.5)." }],
          validationState: 3,
        },
      },
    });
    expect(result.message).toContain("Incompatibilidade de grupos");
    expect(result.list).toHaveLength(1);
  });

  it("lê ModelState serializado como arrays de strings", () => {
    const result = parseApiErrorBody({
      errors: {
        Quantidade: ["A quantidade deve ser um valor positivo (mínimo 0,0001)."],
      },
    });
    expect(result.message).toBe("A quantidade deve ser um valor positivo (mínimo 0,0001).");
    expect(result.byKey.Quantidade).toContain("quantidade");
  });
});

describe("humanizeValidationMessage", () => {
  it("remove código ERRO_XXX", () => {
    expect(humanizeValidationMessage("[ERRO_002] Licença expirada.")).toBe("Licença expirada.");
  });
});
