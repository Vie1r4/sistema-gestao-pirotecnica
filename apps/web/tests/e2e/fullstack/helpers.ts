import { expect, type Page } from "@playwright/test";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_NOME, E2E_ADMIN_PASSWORD } from "./constants";

/** Login real na UI; devolve corpo JSON do POST login. */
export async function loginViaUi(page: Page) {
  const loginResponse = page.waitForResponse(
    (res) => res.url().includes("/api/auth/login") && res.request().method() === "POST",
    { timeout: 30_000 }
  );
  const meResponse = page.waitForResponse(
    (res) => res.url().includes("/api/auth/me") && res.request().method() === "GET" && res.ok(),
    { timeout: 30_000 }
  );

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Iniciar sessão" })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Não foi possível contactar a API.")).toHaveCount(0);

  await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
  await page.getByLabel("Palavra-passe").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();

  const res = await loginResponse;
  expect(res.ok(), `login HTTP ${res.status()}`).toBeTruthy();
  const body = (await res.json()) as Record<string, unknown>;
  const token = (body.token ?? body.Token) as string | undefined;
  expect(token, "JWT em falta na resposta de login").toBeTruthy();
  expect(String(token).length).toBeGreaterThan(10);

  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 });
  await meResponse;
  await expectAuthenticatedNavbar(page);

  return body;
}

export async function expectAuthenticatedNavbar(page: Page) {
  await expect(page.getByRole("link", { name: "Iniciar sessão" })).toHaveCount(0);
  await expect(
    page.getByRole("link", {
      name: new RegExp(`^(${escapeRegExp(E2E_ADMIN_NOME)}|${escapeRegExp(E2E_ADMIN_EMAIL)}|Perfil)$`),
    })
  ).toBeVisible({ timeout: 30_000 });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Após reload, o frontend deve renovar sessão (refresh HttpOnly) e voltar a obter /me. */
export async function expectSessionSurvivesReload(page: Page) {
  const refreshOrMe = page.waitForResponse(
    (res) => {
      const url = res.url();
      return (
        (url.includes("/api/auth/refresh") && res.request().method() === "POST") ||
        (url.includes("/api/auth/me") && res.request().method() === "GET")
      );
    },
    { timeout: 30_000 }
  );

  await page.reload();
  await refreshOrMe;
  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 });
  await expectAuthenticatedNavbar(page);
}
