import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testIgnore: ["**/fullstack/**"],
  fullyParallel: true,
  /** Menos workers em CI evita timeouts no dev server partilhado (redirects após POST). */
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000",
    /** Em CI o servidor tem de ser iniciado pelo Playwright; localmente pode reutilizar `npm run dev`. */
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
