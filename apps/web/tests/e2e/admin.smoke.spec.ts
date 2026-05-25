import { expect, test } from "@playwright/test";
import { setupAuthenticatedAdmin } from "./helpers/setup";

const adminStats = {
  totalUtilizadores: 2,
  utilizadoresSemEmailConfirmado: 1,
  totalEncomendas: 10,
  encomendasEsteMes: 3,
  totalServicos: 5,
  servicosEsteMes: 1,
  totalClientes: 4,
  totalFuncionarios: 3,
  totalProdutos: 20,
  totalPaiois: 2,
  totalLogs: 100,
};

test.describe("Painel Admin (smoke)", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedAdmin(page);

    await page.route("**/api/auth/existem-utilizadores", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ primeiroRegistoDisponivel: false }),
      });
    });

    await page.route("**/api/admin/stats", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(adminStats),
      });
    });

    await page.route("**/api/admin/health", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "ok",
          database: true,
          environment: "Development",
          version: "1.0.0.0",
          utcNow: new Date().toISOString(),
        }),
      });
    });

    await page.route("**/api/admin/logs**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: 1,
              acao: "ADMIN_UTILIZADOR_CRIADO",
              userId: "e2e-admin",
              userName: "Admin E2E",
              jsonDados: '{"email":"test@x.pt"}',
              timestamp: new Date().toISOString(),
            },
          ],
          paginaAtual: 1,
          itensPorPagina: 50,
          totalRegistos: 1,
        }),
      });
    });

    await page.route("**/api/admin/utilizadores**", async (route) => {
      const url = route.request().url();
      if (url.includes("criar-opcoes")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            roles: ["Admin", "Gestor"],
            funcionariosDisponiveis: [],
          }),
        });
        return;
      }
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "u1",
              userName: "admin@x.pt",
              email: "admin@x.pt",
              roles: ["Admin"],
              funcionarioAssociadoNome: null,
              emailConfirmed: true,
            },
          ]),
        });
        return;
      }
      await route.continue();
    });

    await page.route("**/api/admin/backups**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [] }),
      });
    });
  });

  test("dashboard admin renderiza", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Estado do sistema" }).first()).toBeVisible();
    await expect(page.getByText("Operacional").first()).toBeVisible();
  });

  test("utilizadores e logs renderizam", async ({ page }) => {
    await page.goto("/admin/utilizadores");
    await expect(page.getByRole("heading", { name: "Utilizadores" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Novo utilizador" })).toBeVisible();

    await page.goto("/admin/logs");
    await expect(page.getByRole("heading", { name: "Logs do sistema" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Filtros/ })).toBeVisible();
  });

  test("definições com estado do sistema", async ({ page }) => {
    await page.goto("/admin/definicoes");
    await expect(page.getByRole("heading", { name: "Definições" })).toBeVisible();
    await expect(page.getByText("Estado do sistema")).toBeVisible();
  });
});
