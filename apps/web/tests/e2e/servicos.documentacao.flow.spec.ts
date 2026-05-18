import { expect, test } from "@playwright/test";

const servicoDetalheBase = {
  id: "1",
  encomendaId: "20",
  clienteId: "30",
  dataServico: "2026-03-26",
  local: "Braga",
  distrito: "Braga",
  cidade: "Braga",
  municipio: "Braga",
  publicoPrivado: "Público",
  responsavelTecnicoId: "5",
  observacoes: "obs",
  coordenadasLat: 41.54,
  coordenadasLng: -8.42,
  raioPublico: 50,
  cliente: { id: "30", nome: "Cliente E2E" },
  encomenda: null,
  responsavelTecnico: null,
  equipa: [{ servicoId: "1", funcionarioId: "5", funcionario: { id: "5", nomeCompleto: "Tecnico E2E" } }],
  licencas: [],
  licencasEvento: [],
  distanciasSeguranca: [],
  resumoMaterial: null,
  itensEncomenda: [],
  licencasObrigatoriasTotal: 0,
  licencasObrigatoriasEntregues: 0,
};

function apiDetalheResponse(documentosExtras: Array<{ id: string; nome: string }>) {
  return {
    servico: {
      ...servicoDetalheBase,
      documentosExtras,
    },
    resumoMaterial: null,
    itensEncomenda: [],
    distanciasSeguranca: [],
    licencasEvento: [],
    licencasObrigatoriasTotal: 0,
    licencasObrigatoriasEntregues: 0,
  };
}

test.describe("Serviços/Documentação E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("token", "token-e2e");
    });
  });

  test("documentação redireciona quando role não é Admin/Gestor", async ({ page }) => {
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "7",
          nome: "Utilizador Comercial",
          roles: ["Comercial"],
          permissions: ["servicos.gerir"],
        }),
      });
    });

    await page.route("**/api/servicos**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          lista: [],
          clientes: [],
          totalRegistos: 0,
          paginaAtual: 1,
          itensPorPagina: 20,
        }),
      });
    });

    await page.goto("/documentacao?servicoId=1");
    await expect(page).toHaveURL(/\/$/);
  });

  test("detalhe do serviço mostra erro ao anexar sem ficheiro", async ({ page }) => {
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "1",
          nome: "Admin E2E",
          roles: ["Admin"],
          permissions: ["servicos.gerir", "servicos.apagar"],
        }),
      });
    });

    await page.route("**/api/servicos/1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(apiDetalheResponse([])),
      });
    });

    await page.goto("/servicos/1");
    await expect(page.getByRole("heading", { name: "Documentação do serviço" })).toBeVisible();

    await page.getByPlaceholder("Nome do documento (ex.: Declaração final)").fill("Doc sem ficheiro");
    await page.getByRole("button", { name: "Adicionar" }).click();

    await expect(page.getByText("Selecione um ficheiro para anexar.")).toBeVisible();
  });

  test("detalhe abre e remove documento existente", async ({ page }) => {
    let removeChamado = false;

    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "1",
          nome: "Admin E2E",
          roles: ["Admin"],
          permissions: ["servicos.gerir", "servicos.apagar"],
        }),
      });
    });

    await page.route("**/api/servicos/1/documentos/55", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/pdf" },
        body: "%PDF-1.4\n%fake\n",
      });
    });

    await page.route("**/api/servicos/1", async (route) => {
      if (route.request().method() === "PUT") {
        const raw = route.request().postData() ?? "";
        if (raw.includes("RemoverDocumentoExtraIds") && raw.includes("55")) removeChamado = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(apiDetalheResponse([{ id: "55", nome: "Doc Existente" }])),
      });
    });

    await page.goto("/servicos/1");
    await expect(page.getByRole("button", { name: "Doc Existente" })).toBeVisible();

    const reqPromise = page.waitForRequest((req) =>
      req.url().includes("/api/servicos/1/documentos/55") && req.method() === "GET"
    );
    await page.getByRole("button", { name: "Doc Existente" }).click();
    await reqPromise;

    await page.getByRole("button", { name: "Remover" }).click();
    await expect(page.getByText("Documento removido com sucesso.")).toBeVisible();
    expect(removeChamado).toBeTruthy();
  });
});
