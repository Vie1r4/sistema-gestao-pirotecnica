# Roles, políticas e permissões

Alinhado ao código: `ConstantesRoles`, `PoliticasAutorizacao`, `AuthController`.

**Última revisão:** maio de 2026.

---

## 1. Roles (cargos)

Definidas em `src/Finalproj.Domain` (`ConstantesRoles`):

| Role | Notas |
|------|--------|
| **Admin** | Tudo, incluindo `PodeAcederAdmin` |
| **Gestor** | Como Admin exceto painel de utilizadores; migração automática Técnico → Gestor |
| **Comercial** | Encomendas, serviços, produtos (ver), armazém (ver); **não** gere clientes na API |
| **Armazém** | Stock e produtos (ver) |

Seed: `SeedRoles` no arranque da API.

---

## 2. Políticas de autorização

`src/Finalproj.Api/Authorization/PoliticasAutorizacao.cs`:

| Política | Roles |
|----------|-------|
| `PodeAcederAdmin` | Admin |
| `PodeGerirClientes` | Admin, Gestor |
| `PodeVerProdutos` | Admin, Gestor, Comercial, Armazém |
| `PodeGerirProdutos` | Admin, Gestor |
| `PodeGerirEncomendas` | Admin, Gestor, Comercial |
| `PodeApagarEncomendas` | Admin, Gestor |
| `PodeGerirServicos` | Admin, Gestor, Comercial |
| `PodeApagarServicos` | Admin, Gestor |
| `PodeVerArmazemStock` | Admin, Gestor, Comercial, Armazém |
| `PodeGerirArmazem` | Admin, Gestor |
| `PodeGerirFuncionarios` | Admin, Gestor |
| `PodeGerirDocumentacaoRegulatoria` | Admin, Gestor (geração/download declaração PSP **PedidoGerado**; outros perfis recebem **404**) |

**GET sensíveis:** funcionários, clientes e encomendas exigem as políticas de gestão respetivas. **Paióis:** também `PaiolAcesso` por role.

Usar `[Authorize(Policy = "...")]` nos controllers; validação **sempre** no servidor.

Ver também [documentacao-regulatoria/README.md](documentacao-regulatoria/README.md).

---

## 3. Permissões no `GET /api/auth/me`

Lista `permissions` derivada das roles (`ObterPermissoes`), por exemplo:

`admin`, `clientes.gerir`, `produtos.ver`, `produtos.gerir`, `encomendas.gerir`, `servicos.gerir`, `servicos.apagar`, `armazem.stock`, `armazem.gerir`, `funcionarios.gerir`, **`documentacao.gerir`** (Admin e Gestor — declaração PSP).

O frontend (`Navbar`, rotas) usa estas strings; a API é a fonte de verdade.

---

## 4. JWT

Endpoints `/api/*` com JWT Bearer. **401/403** em JSON, sem redirect HTML.

---

## Manutenção

Ao alterar políticas: actualizar `PoliticasAutorizacao`, este ficheiro e [API.md](API.md) se auth mudar.
