import { expect, test } from "@playwright/test";

test.describe("Rotas protegidas", () => {
  test("acesso a /funcionarios sem login redireciona para /login", async ({ page }) => {
    await page.route("**/api/auth/refresh", async (route) => {
      await route.fulfill({ status: 401, contentType: "application/json", body: "{}" });
    });

    await page.goto("/funcionarios");
    await expect(page).toHaveURL(/\/login/);
  });
});
