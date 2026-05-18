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

  it("exige admin em /admin", () => {
    expect(getRequiredPermissionsForPath("/admin")).toEqual(["admin"]);
    expect(getRequiredPermissionsForPath("/admin/utilizadores")).toEqual(["admin"]);
  });

  it("exige funcionarios.gerir em /funcionarios", () => {
    expect(getRequiredPermissionsForPath("/funcionarios")).toEqual(["funcionarios.gerir"]);
    expect(getRequiredPermissionsForPath("/funcionarios/novo")).toEqual(["funcionarios.gerir"]);
  });

  it("exige clientes.gerir em /clientes", () => {
    expect(getRequiredPermissionsForPath("/clientes")).toEqual(["clientes.gerir"]);
  });

  it("exige encomendas.gerir em /encomendas", () => {
    expect(getRequiredPermissionsForPath("/encomendas")).toEqual(["encomendas.gerir"]);
    expect(getRequiredPermissionsForPath("/encomendas/50")).toEqual(["encomendas.gerir"]);
  });

  it("exige armazem.gerir em movimentos e gestao", () => {
    expect(getRequiredPermissionsForPath("/armazem/movimentos")).toEqual(["armazem.gerir"]);
    expect(getRequiredPermissionsForPath("/armazem/gestao")).toEqual(["armazem.gerir"]);
    expect(getRequiredPermissionsForPath("/armazem/novo")).toEqual(["armazem.gerir"]);
  });

  it("exige armazem.stock ou gerir na lista de armazem", () => {
    expect(getRequiredPermissionsForPath("/armazem")).toEqual(["armazem.stock", "armazem.gerir"]);
    expect(getRequiredPermissionsForPath("/armazem/5/conteudo")).toEqual(["armazem.stock", "armazem.gerir"]);
  });

  it("exige produtos.ver ou gerir no catalogo e produtos.gerir em gerir/novo", () => {
    expect(getRequiredPermissionsForPath("/produtos")).toEqual(["produtos.ver", "produtos.gerir"]);
    expect(getRequiredPermissionsForPath("/produtos/1")).toEqual(["produtos.ver", "produtos.gerir"]);
    expect(getRequiredPermissionsForPath("/produtos/gerir")).toEqual(["produtos.gerir"]);
    expect(getRequiredPermissionsForPath("/produtos/novo")).toEqual(["produtos.gerir"]);
  });

  it("retorna null para rota sem regra", () => {
    expect(getRequiredPermissionsForPath("/")).toBeNull();
    expect(getRequiredPermissionsForPath("/login")).toBeNull();
    expect(getRequiredPermissionsForPath("/perfil")).toBeNull();
  });
});
