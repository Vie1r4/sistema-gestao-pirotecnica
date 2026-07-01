import { test } from "@playwright/test";
import { loginViaUi } from "./helpers";

test.describe("Auth full-stack (API + BD reais)", () => {
  test.skip(!process.env.E2E_FULLSTACK, "Requer E2E_FULLSTACK=1, API e SQL Server (ver scripts/e2e-fullstack).");

  test("login na UI contra API real devolve JWT e mostra utilizador", async ({ page }) => {
    await loginViaUi(page);
  });
});
