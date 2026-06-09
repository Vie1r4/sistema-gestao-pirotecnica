import { describe, expect, it } from "vitest";
import { rotuloChave, summarizeLogJson } from "@/app/admin/lib/logSummary";

describe("summarizeLogJson", () => {
  it("devolve [] para entradas vazias ou inválidas", () => {
    expect(summarizeLogJson(null)).toEqual([]);
    expect(summarizeLogJson("")).toEqual([]);
    expect(summarizeLogJson("não é json")).toEqual([]);
    expect(summarizeLogJson("[1,2,3]")).toEqual([]);
    expect(summarizeLogJson("{}")).toEqual([]);
  });

  it("prioriza campos identificadores (id, nome, estado)", () => {
    const json = JSON.stringify({
      observacoes: "texto longo qualquer",
      nome: "Encomenda Teste",
      id: 123,
    });
    const resumo = summarizeLogJson(json);
    expect(resumo.map((r) => r.chave)).toEqual(["id", "nome", "observacoes"]);
    expect(resumo[0].valor).toBe("123");
  });

  it("ignora valores nulos/vazios e objetos aninhados", () => {
    const json = JSON.stringify({
      id: 5,
      nome: "",
      detalhe: { x: 1 },
      estado: "Ativo",
    });
    const resumo = summarizeLogJson(json);
    expect(resumo.map((r) => r.chave)).toEqual(["id", "estado"]);
  });

  it("limita ao número máximo de campos", () => {
    const json = JSON.stringify({ a: 1, b: 2, c: 3, d: 4, e: 5 });
    expect(summarizeLogJson(json, 2)).toHaveLength(2);
  });

  it("trunca valores muito longos", () => {
    const json = JSON.stringify({ nota: "x".repeat(100) });
    const [campo] = summarizeLogJson(json);
    expect(campo.valor.length).toBeLessThanOrEqual(60);
    expect(campo.valor.endsWith("…")).toBe(true);
  });
});

describe("rotuloChave", () => {
  it("mapeia chaves comuns para rótulos amigáveis", () => {
    expect(rotuloChave("id")).toBe("ID");
    expect(rotuloChave("Nome")).toBe("Nome");
    expect(rotuloChave("status")).toBe("Estado");
  });

  it("mantém a chave original quando não há rótulo", () => {
    expect(rotuloChave("referenciaInterna")).toBe("referenciaInterna");
  });
});
