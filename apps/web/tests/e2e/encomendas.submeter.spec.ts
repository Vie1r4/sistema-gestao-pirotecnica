import { expect, test } from "@playwright/test";
import { setupAuthenticatedAdmin } from "./helpers/setup";

const CLIENTE_ID = 1;

const adicionarItensPayload = {
  cliente: { id: CLIENTE_ID, nome: "Cliente E2E" },
  clienteId: CLIENTE_ID,
  produtosFiltrados: [
    { id: 1, nome: "Produto E2E", familiaRisco: "1.1G", stockDisponivel: 100 },
  ],
  itensRascunho: [{ produtoId: 1, produtoNome: "Produto E2E", quantidade: 2 }],
};

test.describe("Encomendas — submeter (mocks API)", () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedAdmin(page);
  });

  const encomendaDetalhePayload = {
    encomenda: {
      id: 50,
      clienteId: CLIENTE_ID,
      estado: "Pendente",
      dataCriacao: "2026-05-18T12:00:00Z",
      cliente: { id: CLIENTE_ID, nome: "Cliente E2E" },
      itens: [{ produtoId: 1, produtoNome: "Produto E2E", quantidade: 2 }],
    },
    stockPorProduto: { "1": 100 },
  };

  test("registar encomenda redireciona para detalhe Pendente", async ({ page }) => {
    await page.route("**/api/encomendas/50", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fulfill({ status: 405, contentType: "application/json", body: "{}" });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(encomendaDetalhePayload),
      });
    });

    await page.route("**/api/encomendas/submeter", async (route) => {
      if (route.request().method() !== "POST") {
        await route.fulfill({ status: 405, contentType: "application/json", body: "{}" });
        return;
      }
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          encomenda: {
            id: 50,
            clienteId: CLIENTE_ID,
            estado: "Pendente",
            dataCriacao: "2026-05-18T12:00:00Z",
            itens: [{ produtoId: 1, quantidade: 2 }],
          },
          encomendaCriada: true,
        }),
      });
    });

    await page.route("**/api/encomendas/adicionar-itens**", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fulfill({ status: 405, contentType: "application/json", body: "{}" });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(adicionarItensPayload),
      });
    });

    await page.goto(`/encomendas/novo/adicionar-itens?clienteId=${CLIENTE_ID}`);
    await expect(page.getByRole("heading", { name: /nova encomenda/i })).toBeVisible();
    await expect(page.getByText("Cliente E2E")).toBeVisible();

    await page.getByRole("button", { name: "Registar encomenda" }).click();
    await page.waitForURL(/\/encomendas\/50(\?|$)/, { timeout: 30000 });
    await expect(page.getByRole("heading", { name: /Encomenda #50/i })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/Encomenda criada com sucesso/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("main").getByText("Pendente").first()).toBeVisible();
  });
});
