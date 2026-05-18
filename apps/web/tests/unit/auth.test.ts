import { beforeEach, describe, expect, it, vi } from "vitest";
import { getToken, isAuthenticated, logout, setToken } from "@/app/lib/auth";
import { useAuthStore } from "@/app/stores/useAuthStore";

describe("auth (memória)", () => {
  beforeEach(() => {
    useAuthStore.getState().setToken(null);
    localStorage.clear();
  });

  it("getToken devolve null sem token", () => {
    expect(getToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it("setToken guarda em memória", () => {
    setToken("jwt-test");
    expect(getToken()).toBe("jwt-test");
    expect(isAuthenticated()).toBe(true);
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("logout limpa token em memória", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    setToken("jwt-test");
    logout();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("getToken prioriza token E2E injectado (Playwright)", () => {
    window.__PIROFAFE_E2E_TOKEN__ = "token-e2e-playwright";
    expect(getToken()).toBe("token-e2e-playwright");
    delete window.__PIROFAFE_E2E_TOKEN__;
  });

  it("setToken limpa flag E2E após login real", () => {
    window.__PIROFAFE_E2E_TOKEN__ = "token-e2e-playwright";
    setToken("jwt-real");
    expect(window.__PIROFAFE_E2E_TOKEN__).toBeUndefined();
    expect(getToken()).toBe("jwt-real");
  });
});
