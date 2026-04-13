import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DocumentacaoPage from "@/app/documentacao/page";
import { servicosListaFixture } from "@/tests/mocks/documentacao.fixtures";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const replaceMock = vi.fn();
const fetchServicosFromApiMock = vi.fn();
const gerarDeclaracaoTestePdfMock = vi.fn();
const gerarLicencaTestePdfMock = vi.fn();
const gerarAutorizacaoTestePdfMock = vi.fn();
const getTokenMock = vi.fn();
const useUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams("servicoId=1"),
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

vi.mock("@/app/lib/auth", () => ({
  getToken: () => getTokenMock(),
}));

vi.mock("@/app/context/UserContext", () => ({
  useUser: () => useUserMock(),
}));

vi.mock("@/app/lib/servicos", () => ({
  fetchServicosFromApi: (...args: unknown[]) => fetchServicosFromApiMock(...args),
}));

vi.mock("@/app/lib/documentacaoPdf", () => ({
  gerarDeclaracaoTestePdf: (...args: unknown[]) => gerarDeclaracaoTestePdfMock(...args),
  gerarLicencaTestePdf: (...args: unknown[]) => gerarLicencaTestePdfMock(...args),
  gerarAutorizacaoTestePdf: (...args: unknown[]) => gerarAutorizacaoTestePdfMock(...args),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <DocumentacaoPage />
    </QueryClientProvider>
  );
}

describe("DocumentacaoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTokenMock.mockReturnValue("token-ok");
    useUserMock.mockReturnValue({
      user: { roles: ["Admin"], permissions: ["servicos.gerir"] },
      loading: false,
    });
    fetchServicosFromApiMock.mockResolvedValue({
      lista: servicosListaFixture,
    });
  });

  it("mostra ações de geração para serviço selecionado", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Gerar documentos - Serviço #1/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /Gerar declaração \(teste\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gerar licença \(teste\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gerar autorização \(teste\)/i })).toBeInTheDocument();
  });

  it("chama geradores PDF corretos ao clicar", async () => {
    renderPage();
    await screen.findByText(/Gerar documentos - Serviço #1/i);

    fireEvent.click(screen.getByRole("button", { name: /Gerar declaração \(teste\)/i }));
    fireEvent.click(screen.getByRole("button", { name: /Gerar licença \(teste\)/i }));
    fireEvent.click(screen.getByRole("button", { name: /Gerar autorização \(teste\)/i }));

    expect(gerarDeclaracaoTestePdfMock).toHaveBeenCalledTimes(1);
    expect(gerarLicencaTestePdfMock).toHaveBeenCalledTimes(1);
    expect(gerarAutorizacaoTestePdfMock).toHaveBeenCalledTimes(1);
  });

  it("redireciona utilizador sem role Admin/Gestor", async () => {
    useUserMock.mockReturnValueOnce({
      user: { roles: ["Comercial"], permissions: ["servicos.gerir"] },
      loading: false,
    });

    renderPage();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/");
    });
  });

  it("não apresenta ações de upload/anexo nesta página", async () => {
    renderPage();
    await screen.findByText(/Gerar documentos - Serviço #1/i);

    expect(screen.queryByRole("button", { name: /Adicionar/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Documentos anexados/i)).not.toBeInTheDocument();
  });

  it("não mostra ações quando não existem serviços na lista", async () => {
    fetchServicosFromApiMock.mockResolvedValueOnce({ lista: [] });
    renderPage();

    await waitFor(() => {
      expect(screen.queryByText(/Gerar documentos - Serviço/i)).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /Gerar declaração/i })).not.toBeInTheDocument();
  });
});
