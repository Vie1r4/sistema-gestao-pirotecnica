import { expect, test } from "@playwright/test";
import { setupAuthenticatedAdmin } from "./helpers/setup";

const funcionarioMock = {
  id: 42,
  nomeCompleto: "João E2E",
  email: "joao.e2e@pirofafe.pt",
  telefone: "912345678",
  cargo: "Gestor",
  nif: "123456789",
  dataRegisto: "2026-01-01T00:00:00Z",
  contaAssociada: false,
};

function detailApiBody(overrides: Record<string, unknown> = {}) {
  return {
    item: { ...funcionarioMock, ...overrides },
    contaEmailConfirmada: false,
    associadoAoUtilizadorAtual: false,
  };
}

test.describe("Funcionários CRUD (mocks API)", () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedAdmin(page);
  });

  test("lista funcionários com dados mockados", async ({ page }) => {
    await page.route("**/api/funcionarios", async (route) => {
      if (route.request().method() === "GET" && !route.request().url().includes("/create")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            items: [funcionarioMock],
            pesquisa: "",
            ordenar: "nome",
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/funcionarios");
    await expect(page.getByRole("heading", { name: "Funcionários" })).toBeVisible();
    await expect(page.getByText("João E2E")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver detalhes" })).toBeVisible();
  });

  test("criar funcionário e abrir detalhe", async ({ page }) => {
    await page.route("**/api/funcionarios/99", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fulfill({ status: 405, contentType: "application/json", body: "{}" });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(detailApiBody({ id: 99, nomeCompleto: "Maria E2E" })),
      });
    });

    await page.route("**/api/funcionarios/create", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          cargos: ["Gestor", "Comercial"],
          rolesConta: ["Gestor"],
        }),
      });
    });

    await page.route("**/api/funcionarios", async (route) => {
      const url = route.request().url();
      if (/\/funcionarios\/\d/.test(url)) {
        await route.fallback();
        return;
      }
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            funcionario: { id: 99, nomeCompleto: "Maria E2E" },
            funcionarioCriado: true,
          }),
        });
        return;
      }
      await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: "Not mocked" }) });
    });

    await page.goto("/funcionarios/novo");
    await expect(page.getByRole("heading", { name: /novo funcionário/i })).toBeVisible();
    await page.getByLabel(/nome completo/i).fill("Maria E2E");
    await page.getByRole("button", { name: "Guardar funcionário" }).click();
    await expect(page.getByRole("main").getByText(/Funcionário criado com sucesso/i)).toBeVisible({
      timeout: 15000,
    });
    await page.waitForURL(/\/funcionarios\/99(\?|$)/, { timeout: 30000 });
    await expect(page.getByRole("heading", { name: "Maria E2E" })).toBeVisible({ timeout: 30000 });
  });

  test("editar funcionário guarda alterações", async ({ page }) => {
    await page.route("**/api/funcionarios/42/edit", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            item: {
              ...funcionarioMock,
              nomeCompleto: "João E2E",
              contaAssociada: true,
              userId: "user-42",
            },
            contaEmail: "joao.e2e@pirofafe.pt",
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.route("**/api/funcionarios/42", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
        return;
      }
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(detailApiBody({ nomeCompleto: "João Editado" })),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/funcionarios/42/editar");
    await expect(page.getByRole("heading", { name: /editar funcionário/i })).toBeVisible();
    const nomeInput = page.getByLabel(/nome completo/i);
    await expect(nomeInput).toHaveValue("João E2E", { timeout: 10000 });
    await nomeInput.fill("João Editado");
    await page.getByRole("button", { name: "Guardar alterações" }).click();
    await expect(page.getByText(/Alterações guardadas/i)).toBeVisible({ timeout: 15000 });
    await page.waitForURL(/\/funcionarios\/42(\?|$)/, { timeout: 20000 });
    await expect(page.getByRole("heading", { name: "João Editado" })).toBeVisible({ timeout: 10000 });
  });

  test("eliminar funcionário redireciona para lista com sucesso", async ({ page }) => {
    await page.route("**/api/funcionarios/42/delete", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(funcionarioMock),
      });
    });

    await page.route("**/api/funcionarios/42", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({ status: 204, body: "" });
        return;
      }
      await route.continue();
    });

    await page.route("**/api/funcionarios", async (route) => {
      if (route.request().method() === "GET" && !route.request().url().includes("/create")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ items: [], pesquisa: "", ordenar: "nome" }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/funcionarios/42/eliminar");
    await expect(page.getByRole("heading", { name: "Eliminar funcionário" })).toBeVisible();
    await expect(page.getByText("João E2E")).toBeVisible();
    await page.getByRole("button", { name: "Confirmar eliminação" }).click();
    await page.waitForURL(/\/funcionarios\?eliminado=1/, { timeout: 15000 });
    await expect(page.getByText("Funcionário eliminado com sucesso.")).toBeVisible();
  });
});
