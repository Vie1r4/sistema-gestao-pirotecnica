import { expect, test } from "@playwright/test";
import { setupAuthenticatedAdmin } from "./helpers/setup";

test.describe("Documentação flow", () => {
  test("abre página protegida e gera declaração PSP", async ({ page }) => {
    await setupAuthenticatedAdmin(page);

    let ficheiroPedido = false;

    await page.route("**/api/servicos**", async (route) => {
      const url = route.request().url();
      if (route.request().method() === "POST" && url.includes("/licenca/gerar")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ licencaId: 42, nomeFicheiro: "declaracao-psp-servico-1.pdf" }),
        });
        return;
      }
      if (route.request().method() === "GET" && url.includes("/licenca/42/ficheiro")) {
        ficheiroPedido = true;
        await route.fulfill({
          status: 200,
          contentType: "application/pdf",
          body: Buffer.from("%PDF-1.4 fake"),
        });
        return;
      }
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

    await page.getByRole("button", { name: "Gerar declaração PSP (oficial)" }).click();

    await expect(page.getByText(/Declaração PSP gerada \(licença #42\)/i)).toBeVisible();
    await expect.poll(() => ficheiroPedido).toBe(true);
  });
});
