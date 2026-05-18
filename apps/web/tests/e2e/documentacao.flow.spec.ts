import { expect, test } from "@playwright/test";
import { setupAuthenticatedAdmin } from "./helpers/setup";

test.describe("Documentação flow", () => {
  test("abre página protegida e gera declaração de teste", async ({ page }) => {
    await setupAuthenticatedAdmin(page);

    await page.route("**/api/servicos**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          lista: [
            {
              id: "1",
              clienteId: "10",
              dataServico: "2026-03-26",
              cliente: { id: "10", nome: "Cliente E2E" },
            },
          ],
          clientes: [{ id: 10, nome: "Cliente E2E" }],
          totalRegistos: 1,
          paginaAtual: 1,
          itensPorPagina: 20,
        }),
      });
    });

    await page.goto("/documentacao?servicoId=1");

    await expect(page.getByRole("heading", { name: "Documentação" })).toBeVisible();
    await expect(page.getByText("Gerar documentos - Serviço #1")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Gerar declaração (teste)" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("declaracao-teste-servico-1");
  });
});
