/**
 * Mapeamento de rotas para permissões necessárias.
 * Retorna a lista de permissões (qualquer uma basta) ou null se a rota for acessível a qualquer utilizador autenticado.
 * Ordem: rotas mais específicas primeiro.
 */
export function getRequiredPermissionsForPath(pathname: string | null): string[] | null {
  if (!pathname) return null;

  // Admin
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return ["admin"];

  // Funcionários
  if (pathname === "/funcionarios" || pathname.startsWith("/funcionarios/")) return ["funcionarios.gerir"];

  // Clientes
  if (pathname === "/clientes" || pathname.startsWith("/clientes/")) return ["clientes.gerir"];

  // Armazém: gestão e movimentos exigem armazem.gerir
  if (pathname === "/armazem/movimentos" || pathname.startsWith("/armazem/movimentos/")) return ["armazem.gerir"];
  if (pathname === "/armazem/gestao" || pathname.startsWith("/armazem/gestao/")) return ["armazem.gerir"];
  if (pathname === "/armazem/novo") return ["armazem.gerir"];
  if (pathname.match(/^\/armazem\/[^/]+\/editar(\/|$)/)) return ["armazem.gerir"];
  if (pathname.match(/^\/armazem\/[^/]+\/eliminar(\/|$)/)) return ["armazem.gerir"];
  // Armazém: lista, stock, entradas, saídas, detalhe, conteúdo
  if (pathname.startsWith("/armazem")) return ["armazem.stock", "armazem.gerir"];

  // Produtos: gerir, novo, editar, eliminar
  if (pathname === "/produtos/gerir" || pathname.startsWith("/produtos/gerir/")) return ["produtos.gerir"];
  if (pathname === "/produtos/novo") return ["produtos.gerir"];
  if (pathname.match(/^\/produtos\/[^/]+\/editar(\/|$)/)) return ["produtos.gerir"];
  if (pathname.match(/^\/produtos\/[^/]+\/eliminar(\/|$)/)) return ["produtos.gerir"];
  // Catálogo (lista e detalhe)
  if (pathname === "/produtos" || pathname.startsWith("/produtos/")) return ["produtos.ver", "produtos.gerir"];

  // Encomendas
  if (pathname === "/encomendas" || pathname.startsWith("/encomendas/")) return ["encomendas.gerir"];

  // Serviços
  if (pathname === "/servicos" || pathname.startsWith("/servicos/")) return ["servicos.gerir"];

  return null;
}
