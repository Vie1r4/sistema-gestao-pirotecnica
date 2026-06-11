import { describe, it, expect } from "vitest";
import {
  calcularAllocacao,
  calcularRaioPublicoZona,
  createDefaultZonasFromItens,
  parseItensEncomenda,
  parseQuantidadeInteira,
  sanitizeQuantidadeInput,
  validarZonasForm,
  zonasToApiInput,
} from "@/app/lib/zonasLancamento";

describe("zonasLancamento", () => {
  const itens = [
    { produtoId: 1, produtoNome: "Fogo A", quantidadePedida: 10, distanciaSegurancaPublico_m: 100 },
    { produtoId: 2, produtoNome: "Fogo B", quantidadePedida: 5, distanciaSegurancaPublico_m: 50 },
  ];

  it("parseItensEncomenda mapeia PascalCase e camelCase", () => {
    const parsed = parseItensEncomenda([
      { ProdutoId: 3, QuantidadePedida: 2, Produto: { Nome: "X", DistanciaSegurancaPublico_m: 75 } },
      { produtoId: 4, quantidadePedida: 0 },
    ]);
    expect(parsed).toEqual([
      { produtoId: 3, produtoNome: "X", quantidadePedida: 2, distanciaSegurancaPublico_m: 75 },
    ]);
  });

  it("calcularRaioPublicoZona usa o máximo entre produtos da zona", () => {
    const zonas = createDefaultZonasFromItens(itens, "2026-06-01");
    expect(calcularRaioPublicoZona(zonas[0], itens)).toBe(100);
    zonas[0].linhas = [zonas[0].linhas[1]];
    expect(calcularRaioPublicoZona(zonas[0], itens)).toBe(50);
  });

  it("createDefaultZonasFromItens cria uma zona com todo o material", () => {
    const zonas = createDefaultZonasFromItens(itens, "2026-06-01");
    expect(zonas).toHaveLength(1);
    expect(zonas[0].linhas).toHaveLength(2);
    expect(zonas[0].linhas[0].quantidade).toBe("10");
  });

  it("calcularAllocacao detecta excedente", () => {
    const zonas = createDefaultZonasFromItens(itens, "2026-06-01");
    zonas[0].linhas[0].quantidade = "15";
    const { excede, restantePorProduto } = calcularAllocacao(zonas, itens);
    expect(excede).toBe(true);
    expect(restantePorProduto.get(1)).toBe(0);
  });

  it("validarZonasForm exige coordenadas", () => {
    const zonas = createDefaultZonasFromItens(itens, "2026-06-01");
    expect(validarZonasForm(zonas, itens)).toMatch(/coordenadas/i);
    zonas[0].coordenadasLat = "41.5";
    zonas[0].coordenadasLng = "-8.4";
    expect(validarZonasForm(zonas, itens)).toBeNull();
  });

  it("sanitizeQuantidadeInput aceita apenas inteiros positivos", () => {
    expect(sanitizeQuantidadeInput("3,9901")).toBe("3");
    expect(sanitizeQuantidadeInput("3.99")).toBe("3");
    expect(sanitizeQuantidadeInput("12")).toBe("12");
    expect(sanitizeQuantidadeInput("")).toBe("");
    expect(parseQuantidadeInteira("0")).toBeNull();
  });

  it("zonasToApiInput converte para payload da API", () => {
    const zonas = createDefaultZonasFromItens(itens, "2026-06-01");
    zonas[0].coordenadasLat = "41.5";
    zonas[0].coordenadasLng = "-8.4";
    zonas[0].linhas[0].horaInicio = "22:00";
    zonas[0].linhas[0].horaFim = "22:30";
    const api = zonasToApiInput(zonas);
    expect(api[0].coordenadasLat).toBe(41.5);
    expect(api[0].linhas[0].horaInicio).toBe("22:00:00");
    expect(api[0].linhas[0].horaFim).toBe("22:30:00");
    expect(api[0].linhas[0].produtoId).toBe(1);
    expect(api[0].raioPublico).toBeUndefined();
  });
});
