import { expect, test } from "@playwright/test";
import { ensureNoAuth } from "./helpers/auth";

test.describe("Rotas protegidas", () => {
  test("acesso a /funcionarios sem login redireciona para /login", async ({ page }) => {
    await ensureNoAuth(page);

    await page.goto("/funcionarios");
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });
});
