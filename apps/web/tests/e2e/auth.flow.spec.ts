import { expect, test } from "@playwright/test";
import { injectE2eAuth, mockAuthMeAdmin, mockAuthRefreshOk } from "./helpers/auth";

test.describe("Auth fluxos", () => {
  test("login com credenciais erradas mostra mensagem", async ({ page }) => {
    await page.route("**/api/auth/existem-utilizadores", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ primeiroRegistoDisponivel: false }),
      });
    });
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Credenciais inválidas." }),
      });
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill("errado@teste.pt");
    await page.getByLabel("Palavra-passe").fill("WrongPass1!");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Credenciais inválidas.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("fluxo login mock e terminar sessão", async ({ page }) => {
    await injectE2eAuth(page);
    await mockAuthMeAdmin(page);
    await mockAuthRefreshOk(page);
    await page.route("**/api/home/perfil", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ model: { nome: "Admin E2E", email: "admin-e2e@pirofafe.pt", roles: ["Admin"] } }),
      });
    });
    await page.route("**/api/auth/logout", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.goto("/perfil");
    await expect(page.getByRole("heading", { name: /perfil/i })).toBeVisible({ timeout: 15000 });
    await Promise.all([
      page.waitForURL(/\/login/, { timeout: 15000 }),
      page.getByRole("button", { name: "Terminar sessão" }).click(),
    ]);
  });

  test("reload mantém sessão com refresh mockado", async ({ page }) => {
    await mockAuthRefreshOk(page);
    await mockAuthMeAdmin(page);
    await page.route("**/api/auth/existem-utilizadores", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ primeiroRegistoDisponivel: false }),
      });
    });

    await page.goto("/");
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await page.reload();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  });
});
