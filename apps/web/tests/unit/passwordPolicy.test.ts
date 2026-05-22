import { describe, expect, it } from "vitest";
import { validatePasswordClient } from "@/app/lib/passwordPolicy";

describe("validatePasswordClient", () => {
  it("aceita password que cumpre as regras", () => {
    expect(validatePasswordClient("Abcdef1!")).toBeNull();
  });

  it("rejeita menos de 8 caracteres", () => {
    expect(validatePasswordClient("Ab1!xyz")).toMatch(/8 caracteres/);
  });

  it("rejeita sem maiúsculas", () => {
    expect(validatePasswordClient("abcdef1!")).toMatch(/maiúscula/);
  });
});
