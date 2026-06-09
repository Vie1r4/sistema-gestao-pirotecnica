import { describe, expect, it, vi, beforeEach } from "vitest";
import type { LogSistemaItem } from "@/app/lib/admin";
import {
  exportPageCount,
  fetchAllFilteredAdminLogs,
  buildLogsCsvMetadataLines,
} from "@/app/admin/lib/exportLogsCsv";

vi.mock("@/app/lib/admin", () => ({
  fetchAdminLogs: vi.fn(),
}));

import { fetchAdminLogs } from "@/app/lib/admin";

const mockFetch = vi.mocked(fetchAdminLogs);

function log(id: number): LogSistemaItem {
  return {
    id,
    acao: "TEST",
    userId: null,
    userName: "Admin",
    jsonDados: null,
    timestamp: "2026-06-01T10:00:00Z",
  };
}

describe("exportPageCount", () => {
  it("devolve 0 quando total ou batchSize inválidos", () => {
    expect(exportPageCount(0, 200)).toBe(0);
    expect(exportPageCount(100, 0)).toBe(0);
  });

  it("calcula páginas para total inferior ao limite", () => {
    expect(exportPageCount(450, 200)).toBe(3);
    expect(exportPageCount(200, 200)).toBe(1);
  });

  it("respeita maxRows no cálculo de páginas", () => {
    expect(exportPageCount(50_000, 200, 10_000)).toBe(50);
  });
});

describe("fetchAllFilteredAdminLogs", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("devolve vazio quando não há registos", async () => {
    mockFetch.mockResolvedValueOnce({
      items: [],
      paginaAtual: 1,
      itensPorPagina: 200,
      totalRegistos: 0,
    });

    const result = await fetchAllFilteredAdminLogs("token", { acao: "CRIAD" });
    expect(result).toEqual({ items: [], totalRegistos: 0, truncated: false });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("pede várias páginas até cobrir o total filtrado", async () => {
    mockFetch
      .mockResolvedValueOnce({
        items: [log(1), log(2)],
        paginaAtual: 1,
        itensPorPagina: 2,
        totalRegistos: 3,
      })
      .mockResolvedValueOnce({
        items: [log(3)],
        paginaAtual: 2,
        itensPorPagina: 2,
        totalRegistos: 3,
      });

    const result = await fetchAllFilteredAdminLogs(
      "token",
      {},
      { batchSize: 2, maxRows: 100 }
    );

    expect(result.items).toHaveLength(3);
    expect(result.totalRegistos).toBe(3);
    expect(result.truncated).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1, "token", {
      pagina: 1,
      itensPorPagina: 2,
    });
    expect(mockFetch).toHaveBeenNthCalledWith(2, "token", {
      pagina: 2,
      itensPorPagina: 2,
    });
  });

  it("marca truncated quando total excede maxRows", async () => {
    const page1 = Array.from({ length: 50 }, (_, i) => log(i + 1));
    const page2 = Array.from({ length: 50 }, (_, i) => log(i + 51));
    mockFetch
      .mockResolvedValueOnce({
        items: page1,
        paginaAtual: 1,
        itensPorPagina: 50,
        totalRegistos: 150,
      })
      .mockResolvedValueOnce({
        items: page2,
        paginaAtual: 2,
        itensPorPagina: 50,
        totalRegistos: 150,
      });

    const result = await fetchAllFilteredAdminLogs(
      "token",
      {},
      { batchSize: 50, maxRows: 100 }
    );

    expect(result.truncated).toBe(true);
    expect(result.totalRegistos).toBe(150);
    expect(result.items).toHaveLength(100);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe("buildLogsCsvMetadataLines", () => {
  it("inclui filtros, data e contagens", () => {
    const lines = buildLogsCsvMetadataLines({
      filters: {
        entidade: "encomenda",
        acao: "CRIAD",
        userName: "Ana",
        dataInicio: "2026-06-01",
        dataFim: "2026-06-09",
      },
      exportedCount: 12,
      totalFiltered: 40,
      truncated: false,
      exportedAt: new Date("2026-06-09T10:00:00.000Z"),
    });

    expect(lines[0]).toMatch(/^# Exportação PIROFAFE/);
    expect(lines.join("\n")).toContain("Exportado em: 2026-06-09T10:00:00.000Z");
    expect(lines.join("\n")).toContain("Área: Encomendas");
    expect(lines.join("\n")).toContain("Ação: CRIAD");
    expect(lines.join("\n")).toContain("Utilizador: Ana");
    expect(lines.join("\n")).toContain("2026-06-01 → 2026-06-09");
    expect(lines.join("\n")).toContain("Registos exportados: 12 de 40");
    expect(lines.join("\n")).toContain("Truncado: não");
  });

  it("indica truncado quando aplicável", () => {
    const lines = buildLogsCsvMetadataLines({
      filters: {},
      exportedCount: 10_000,
      totalFiltered: 15_000,
      truncated: true,
    });
    expect(lines.join("\n")).toContain("Truncado: sim");
  });
});
