# Roles, políticas e permissões

Documento de referência **alinhado ao código** (`ConstantesRoles`, `PoliticasAutorizacao`, `AuthController`, `Program.cs`).

**Última revisão:** maio de 2026.

---

## 1. Roles (cargos)

Nomes canónicos (Identity) definidos em **`Models/Constants/ConstantesRoles.cs`**:

| Role | Constante | Notas |
|------|-----------|--------|
| **Admin** | `ConstantesRoles.Admin` | Acesso total, incluindo painel de utilizadores (`PodeAcederAdmin`). |
| **Gestor** | `ConstantesRoles.Gestor` | Antigo nome **"Técnico"** — migrado automaticamente no arranque (`SeedRoles`). Mesmas capacidades operacionais que Admin **exceto** o painel Admin de utilizadores. |
| **Comercial** | `ConstantesRoles.Comercial` | **Não** satisfaz `PodeGerirClientes` (só Admin e Gestor gerem clientes na API). Permissões típicas em `/me`: `produtos.ver`, `encomendas.gerir`, `servicos.gerir`, `armazem.stock`. |
| **Armazém** | `ConstantesRoles.Armazem` | Texto da role: **"Armazém"** (com acento). Stock/armazém (ver) e produtos (ver). |

Seed inicial das roles: **`Data/SeedRoles.cs`** (garante que todas existem; migra **Técnico → Gestor** e remove a role antiga).

---

## 2. Políticas de autorização (backend)

Configuradas em **`Authorization/PoliticasAutorizacao.cs`** e registadas em **`PoliticasAutorizacao.ConfigurarPoliticas`**.

| Política | Roles que satisfazem |
|----------|----------------------|
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

Os controladores devem usar **`[Authorize(Policy = "...")]`** (ou combinações coerentes) em vez de espalhar apenas `Roles = "Admin"` — a política concentra a regra num sítio.

**Listagens sensíveis (GET):** `GET /api/funcionarios`, `GET /api/clientes` e `GET /api/encomendas` exigem as políticas `PodeGerirFuncionarios`, `PodeGerirClientes` e `PodeGerirEncomendas` respetivamente (Comercial e Armazém recebem **403** onde aplicável). **Mutações:** `POST /api/clientes` também exige `PodeGerirClientes` (corrigido em 2026-05). Downloads de documentos de funcionários exigem `PodeGerirFuncionarios`.

**Paióis:** além das políticas, o acesso a paióis concretos pode estar restrito por **configuração por paiol** (cargos com acesso ao paiol). Admin costuma ver tudo; os restantes só o que o domínio permitir.

---

## 3. Permissões no `GET /api/auth/me` (frontend)

O **`GET /api/auth/me`** devolve `roles` e também **`permissions`**: lista de strings derivada das roles por **`PoliticasAutorizacao.ObterPermissoes`**.

Exemplos de strings (não exaustivo):

- `admin`
- `clientes.gerir`
- `produtos.ver`, `produtos.gerir`
- `encomendas.gerir`, `encomendas.apagar`
- `servicos.gerir`, `servicos.apagar`
- `armazem.stock`, `armazem.gerir`
- `funcionarios.gerir`

O **frontend** (por exemplo `UserContext`, `Navbar`) deve preferir **`permissions`** para mostrar ou esconder ações, mantendo a **validação obrigatória no servidor** (nunca confiar só na UI).

---

## 4. JWT e desafio da API

Os endpoints sob **`/api/*`** usam autenticação **JWT Bearer**. Respostas **401** são JSON (sem redirect HTML), alinhado com uma API-only.

---

## 5. Manutenção deste documento

Ao alterar regras de negócio de autorização:

1. Atualizar **`PoliticasAutorizacao`** (políticas e/ou `ObterPermissoes`).
2. Atualizar este ficheiro e, se necessário, [`docs/api/API.md`](../api/API.md) (secção auth) e [`docs/frontend/VERIFICACAO-APIS-UTILIZADAS.md`](../frontend/VERIFICACAO-APIS-UTILIZADAS.md).

---

## Documentação relacionada

- [`docs/api/API.md`](../api/API.md) — endpoints de autenticação.
- [`docs/visao-geral/ARQUITETURA-E-VISAO-GERAL.md`](../visao-geral/ARQUITETURA-E-VISAO-GERAL.md) — pipeline e segurança.
- [`docs/visao-geral/PROJETO.md`](../visao-geral/PROJETO.md) — visão geral do domínio.
