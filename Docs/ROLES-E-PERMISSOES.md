# Roles, políticas e permissões

Alinhado ao código: `ConstantesRoles`, `PoliticasAutorizacao`, `AuthController`.

---

## 1. Roles (cargos)

Definidas em `src/Finalproj.Domain` (`ConstantesRoles`):

| Role | Notas |
|------|--------|
| **Admin** | Tudo, incluindo `PodeAcederAdmin` |
| **Gestor** | Como Admin exceto painel de utilizadores; migração automática Técnico → Gestor |
| **Comercial** | Encomendas, serviços, produtos (ver), armazém (ver); **não** gere clientes na API |
| **Armazém** | Stock e produtos (ver) |

Arranque: `SeedRoles` cria apenas as **roles** Identity (Admin, Gestor, …) — não cria utilizadores nem dados de negócio.

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

**GET sensíveis:** funcionários, clientes e encomendas exigem as políticas de gestão respetivas. **Paióis:** visíveis para quem tem `PodeVerArmazemStock` (todos os paióis são iguais para todos os perfis autorizados).

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

Após alteração das **próprias** roles (`PUT /api/admin/utilizadores/{id}` na conta em sessão, ou mudança do próprio cargo na ficha de funcionário), a API devolve `requiresTokenRefresh: true` e o frontend renova o JWT (`POST /api/auth/refresh`) e invalida o cache de `GET /api/auth/me`. Alterar o cargo de **outro** utilizador não termina a sessão de quem edita nem força logout global.

---

## 5. Regras de alteração de cargos

- **Um cargo operacional por utilizador** (Admin, Gestor, Comercial ou Armazém) — não são cumulativos.
- **Último Admin:** não é possível remover a role Admin se for o único administrador do sistema (mensagem de erro na API).
- **Ficha de funcionário:** ao alterar o **cargo** de quem tem conta, a role Identity é sincronizada automaticamente (com as mesmas validações).
- **Painel Admin → Utilizadores:** edição de roles com toggles mutuamente exclusivos; após guardar a própria conta, o menu e o JWT actualizam-se de imediato.

---

## Manutenção

Ao alterar políticas: actualizar `PoliticasAutorizacao`, este ficheiro e [API.md](API.md) se auth mudar.
