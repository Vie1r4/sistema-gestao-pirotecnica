import { describe, expect, it } from "vitest";
import { getRequiredPermissionsForPath } from "@/app/lib/routePermissions";

describe("getRequiredPermissionsForPath", () => {
  it("exige permissao de servicos na rota /servicos", () => {
    expect(getRequiredPermissionsForPath("/servicos")).toEqual(["servicos.gerir"]);
    expect(getRequiredPermissionsForPath("/servicos/123")).toEqual(["servicos.gerir"]);
  });

  it("exige permissao base de servicos na rota /documentacao", () => {
    expect(getRequiredPermissionsForPath("/documentacao")).toEqual(["servicos.gerir"]);
  });

  it("retorna null para rota sem regra", () => {
    expect(getRequiredPermissionsForPath("/")).toBeNull();
  });
});
