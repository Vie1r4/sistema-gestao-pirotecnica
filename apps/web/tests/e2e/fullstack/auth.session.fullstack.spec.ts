import { expect, test } from "@playwright/test";
import {
  expectAuthenticatedNavbar,
  expectSessionSurvivesReload,
  loginViaUi,
} from "./helpers";

test.describe("Sessão full-stack", () => {
  test.skip(!process.env.E2E_FULLSTACK, "Requer E2E_FULLSTACK=1, API e SQL Server.");

  test("reload renova JWT via refresh cookie e mantém utilizador", async ({ page }) => {
    await loginViaUi(page);

    const meResponse = page.waitForResponse(
      (res) => res.url().includes("/api/auth/me") && res.request().method() === "GET",
      { timeout: 30_000 }
    );
    await page.goto("/perfil");
    const me = await meResponse;
    expect(me.ok(), `auth/me HTTP ${me.status()}`).toBeTruthy();
    const meBody = (await me.json()) as Record<string, unknown>;
    expect(meBody.email ?? meBody.Email).toBeTruthy();

    await expectSessionSurvivesReload(page);
  });

  test("listagem de clientes carrega dados da API real", async ({ page }) => {
    await loginViaUi(page);

    const clientesResponse = page.waitForResponse(
      (res) => res.url().includes("/api/clientes") && res.request().method() === "GET",
      { timeout: 30_000 }
    );

    await page.goto("/clientes");
    const res = await clientesResponse;
    expect(res.ok(), `GET clientes HTTP ${res.status()}`).toBeTruthy();

    await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
    await expect(page.getByText("Falha de rede")).toHaveCount(0);
    await expect(
      page.getByText("Ainda não há clientes registados.").or(page.getByRole("table"))
    ).toBeVisible({ timeout: 15_000 });
    await expectAuthenticatedNavbar(page);
  });
});
