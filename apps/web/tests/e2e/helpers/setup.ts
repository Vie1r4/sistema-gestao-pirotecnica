import type { Page } from "@playwright/test";
import { injectE2eAuth, mockAuthMeAdmin, mockAuthRefreshOk } from "./auth";

/** Sessão E2E padrão (Admin) para rotas protegidas com mocks estáveis. */
export async function setupAuthenticatedAdmin(page: Page): Promise<void> {
  await injectE2eAuth(page);
  await mockAuthMeAdmin(page);
  await mockAuthRefreshOk(page);
}
