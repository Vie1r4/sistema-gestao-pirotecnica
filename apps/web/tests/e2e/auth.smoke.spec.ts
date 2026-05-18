import { expect, test } from "@playwright/test";

test.describe("Auth smoke", () => {
  test("login page renders base fields", async ({ page }) => {
    await page.route("**/api/auth/existem-utilizadores", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ existem: true }),
      });
    });

    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Iniciar sessão" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Palavra-passe")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });
});
