import type { Page } from "@playwright/test";

export const E2E_TOKEN = "token-e2e";

/** Injeta JWT em memória (Zustand + fallback E2E) antes da app carregar. */
export async function injectE2eAuth(page: Page, token: string = E2E_TOKEN): Promise<void> {
  await page.addInitScript((t: string) => {
    (window as Window & { __PIROFAFE_E2E_TOKEN__?: string }).__PIROFAFE_E2E_TOKEN__ = t;
  }, token);
}

/** Mock padrão de utilizador Admin para rotas protegidas. */
export async function mockAuthMeAdmin(page: Page): Promise<void> {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "e2e-admin",
        email: "admin-e2e@pirofafe.pt",
        nome: "Admin E2E",
        roles: ["Admin"],
        permissions: [
          "admin",
          "clientes.gerir",
          "funcionarios.gerir",
          "produtos.ver",
          "produtos.gerir",
          "encomendas.gerir",
          "encomendas.apagar",
          "servicos.gerir",
          "servicos.apagar",
          "armazem.stock",
          "armazem.gerir",
          "documentacao.gerir",
        ],
      }),
    });
  });
}

/** Garante contexto sem sessão (rotas protegidas → login). */
export async function ensureNoAuth(page: Page): Promise<void> {
  await page.addInitScript(() => {
    delete (window as Window & { __PIROFAFE_E2E_TOKEN__?: string }).__PIROFAFE_E2E_TOKEN__;
  });
  await page.route("**/api/auth/refresh", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: "{}" });
  });
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "Unauthorized" }) });
  });
}

export async function mockAuthRefreshOk(page: Page): Promise<void> {
  await page.route("**/api/auth/refresh", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: E2E_TOKEN }),
    });
  });
}
