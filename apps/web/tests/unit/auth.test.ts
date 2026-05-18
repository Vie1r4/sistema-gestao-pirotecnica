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
});
