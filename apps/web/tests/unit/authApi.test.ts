import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { confirmEmail } from "@/app/lib/authApi";

describe("confirmEmail", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const jsonResponse = (body: unknown, ok = true) =>
    ({
      ok,
      headers: { get: (name: string) => (name.toLowerCase() === "content-type" ? "application/json" : null) },
      json: async () => body,
    }) as Response;

  it("devolve redirect quando API envia token", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ token: "jwt-confirm" }));

    const result = await confirmEmail("uid", "code");
    expect(result).toEqual({ status: "redirect", token: "jwt-confirm" });
  });

  it("devolve ok com mensagem sem token", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "Confirmado." }));

    const result = await confirmEmail("uid", "code");
    expect(result.status).toBe("ok");
    if (result.status === "ok") expect(result.message).toContain("Confirmado");
  });

  it("devolve error em resposta 400", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ error: "Código inválido." }, false));

    const result = await confirmEmail("uid", "bad");
    expect(result).toEqual({ status: "error", message: "Código inválido." });
  });
});
