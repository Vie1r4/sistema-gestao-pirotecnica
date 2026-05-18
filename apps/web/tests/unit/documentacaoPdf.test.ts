import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  gerarAutorizacaoTestePdf,
  gerarDeclaracaoTestePdf,
  gerarLicencaTestePdf,
} from "@/app/lib/documentacaoPdf";

const saveMock = vi.fn();

vi.mock("jspdf", () => {
  class JsPdfMock {
    save = saveMock;
    setFillColor = vi.fn();
    rect = vi.fn();
    setTextColor = vi.fn();
    setFont = vi.fn();
    setFontSize = vi.fn();
    text = vi.fn();
    setDrawColor = vi.fn();
    line = vi.fn();
    splitTextToSize = vi.fn((value: string) => [value]);
  }

  return { jsPDF: JsPdfMock };
});

describe("documentacaoPdf", () => {
  beforeEach(() => {
    saveMock.mockClear();
  });

  it("gera declaracao com nome esperado", () => {
    gerarDeclaracaoTestePdf({ servicoId: "123", clienteNome: "Cliente X", dataServico: "01/01/2026" });
    expect(saveMock).toHaveBeenCalledWith("declaracao-teste-servico-123.pdf");
  });

  it("gera licenca com nome esperado", () => {
    gerarLicencaTestePdf({ servicoId: "456", clienteNome: "Cliente Y", dataServico: "02/02/2026" });
    expect(saveMock).toHaveBeenCalledWith("licenca-teste-servico-456.pdf");
  });

  it("gera autorizacao com nome esperado", () => {
    gerarAutorizacaoTestePdf({ servicoId: "789", clienteNome: "Cliente Z", dataServico: "03/03/2026" });
    expect(saveMock).toHaveBeenCalledWith("autorizacao-teste-servico-789.pdf");
  });
});
