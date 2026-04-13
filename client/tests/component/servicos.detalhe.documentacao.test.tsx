import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ServicoDetalhePage from "@/app/servicos/[id]/page";
import { servicoDetalheFixture } from "@/tests/mocks/documentacao.fixtures";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const fetchServicoDetalheFromApiMock = vi.fn();
const putServicoMock = vi.fn();
const downloadComTokenMock = vi.fn();
const documentoUrlMock = vi.fn();
const getTokenMock = vi.fn();
const useUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "1" }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />,
    section: (props: React.HTMLAttributes<HTMLElement>) => <section {...props} />,
  },
}));

vi.mock("@/app/components/Navbar", () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">navbar</nav>,
  CONTENT_OFFSET_TOP: 80,
}));

vi.mock("@/app/components/MapaCoordenadas", () => ({
  __esModule: true,
  default: () => <div data-testid="mapa">mapa</div>,
}));

vi.mock("@/app/lib/auth", () => ({
  getToken: () => getTokenMock(),
}));

vi.mock("@/app/context/UserContext", () => ({
  useUser: () => useUserMock(),
}));

vi.mock("@/app/lib/servicos", () => ({
  fetchServicoDetalheFromApi: (...args: unknown[]) => fetchServicoDetalheFromApiMock(...args),
  servicosApi: {
    putServico: (...args: unknown[]) => putServicoMock(...args),
    downloadComToken: (...args: unknown[]) => downloadComTokenMock(...args),
    documentoUrl: (...args: unknown[]) => documentoUrlMock(...args),
  },
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ServicoDetalhePage />
    </QueryClientProvider>
  );
}

function formDataToRecord(fd: FormData): Record<string, string> {
  const rec: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    rec[k] = typeof v === "string" ? v : v.name;
  }
  return rec;
}

describe("ServicoDetalhePage - documentação", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTokenMock.mockReturnValue("token-ok");
    useUserMock.mockReturnValue({
      user: { roles: ["Admin"], permissions: ["servicos.gerir", "servicos.apagar"] },
      loading: false,
    });
    documentoUrlMock.mockReturnValue("/api/servicos/1/documentos/55");
    fetchServicoDetalheFromApiMock.mockResolvedValue(servicoDetalheFixture);
  });

  it("permite anexar documento no detalhe", async () => {
    renderPage();
    await screen.findByText(/Documentação do serviço/i);

    fireEvent.change(screen.getByPlaceholderText(/Nome do documento/i), {
      target: { value: "Declaracao final" },
    });

    const file = new File(["conteudo"], "declaracao.pdf", { type: "application/pdf" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole("button", { name: /Adicionar/i }));

    await waitFor(() => {
      expect(putServicoMock).toHaveBeenCalledTimes(1);
    });

    const args = putServicoMock.mock.calls[0] as [string, string, FormData];
    const payload = formDataToRecord(args[2]);
    expect(args[0]).toBe("token-ok");
    expect(args[1]).toBe("1");
    expect(payload["DocumentosExtras[0].Nome"]).toBe("Declaracao final");
    expect(payload["DocumentosExtras[0].Ficheiro"]).toBe("declaracao.pdf");
    expect(payload["Servico.Id"]).toBe("1");
    expect(payload["Servico.EncomendaId"]).toBe("20");
  });

  it("permite remover documento existente", async () => {
    renderPage();
    await screen.findByText("Doc Existente");

    fireEvent.click(screen.getByRole("button", { name: /Remover/i }));

    await waitFor(() => {
      expect(putServicoMock).toHaveBeenCalledTimes(1);
    });

    const args = putServicoMock.mock.calls[0] as [string, string, FormData];
    const payload = formDataToRecord(args[2]);
    expect(payload.RemoverDocumentoExtraIds).toBe("55");
  });

  it("mostra erro quando upload falha", async () => {
    putServicoMock.mockRejectedValueOnce(new Error("Falha API upload"));
    renderPage();
    await screen.findByText(/Documentação do serviço/i);

    fireEvent.change(screen.getByPlaceholderText(/Nome do documento/i), {
      target: { value: "Doc Erro" },
    });
    const file = new File(["conteudo"], "doc.pdf", { type: "application/pdf" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole("button", { name: /Adicionar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Falha API upload/i)).toBeInTheDocument();
    });
  });

  it("mostra erro quando remoção falha", async () => {
    putServicoMock.mockRejectedValueOnce(new Error("Falha API remover"));
    renderPage();
    await screen.findByText("Doc Existente");

    fireEvent.click(screen.getByRole("button", { name: /Remover/i }));

    await waitFor(() => {
      expect(screen.getByText(/Falha API remover/i)).toBeInTheDocument();
    });
  });

  it("não mostra formulário de upload para quem não gere serviços", async () => {
    useUserMock.mockReturnValue({
      user: { roles: ["Comercial"], permissions: ["servicos.ver"] },
      loading: false,
    });
    renderPage();
    await screen.findByText(/Documentação do serviço/i);

    expect(screen.queryByRole("button", { name: /Adicionar/i })).not.toBeInTheDocument();
    expect(screen.getByText("Doc Existente")).toBeInTheDocument();
  });

  it("abre documento anexado com URL e token corretos", async () => {
    renderPage();
    await screen.findByText("Doc Existente");

    fireEvent.click(screen.getByRole("button", { name: /Doc Existente/i }));

    await waitFor(() => {
      expect(documentoUrlMock).toHaveBeenCalledWith("1", "55");
      expect(downloadComTokenMock).toHaveBeenCalledWith("token-ok", "/api/servicos/1/documentos/55");
    });
  });

  it("mostra erro se tentar anexar sem ficheiro", async () => {
    renderPage();
    await screen.findByText(/Documentação do serviço/i);

    fireEvent.change(screen.getByPlaceholderText(/Nome do documento/i), {
      target: { value: "Sem ficheiro" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Adicionar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Selecione um ficheiro para anexar/i)).toBeInTheDocument();
    });
    expect(putServicoMock).not.toHaveBeenCalled();
  });

  it("mostra erro se falhar abrir documento", async () => {
    downloadComTokenMock.mockRejectedValueOnce(new Error("Falha a abrir documento"));
    renderPage();
    await screen.findByText("Doc Existente");

    fireEvent.click(screen.getByRole("button", { name: /Doc Existente/i }));

    await waitFor(() => {
      expect(screen.getByText(/Falha a abrir documento/i)).toBeInTheDocument();
    });
  });
});
