# Arquitetura

Visão técnica do PIROFAFE (backend + frontend). **Maio 2026.**

---

## O que é

Sistema de gestão pirotécnica: paióis e stock (MLE/NEM, FIFO), catálogo de produtos, encomendas com reservas, serviços no terreno (1:1 com encomenda concluída), clientes, funcionários e documentos.

- **Backend:** `src/Finalproj.*` — API ASP.NET Core 8, EF Core, SQL Server, Identity + JWT.
- **Frontend:** `apps/web/` — Next.js 16, React 19, TanStack Query, Tailwind.

---

## Camadas backend

| Projeto | Conteúdo |
|---------|----------|
| `Finalproj.Api` | Controllers, `Program.cs`, middleware, `proxy` não (CSP é no Next) |
| `Finalproj.Application` | Serviços de aplicação, DTOs, validadores FluentValidation |
| `Finalproj.Domain` | Entidades, constantes (`ConstantesRoles`, etc.) |
| `Finalproj.Infrastructure` | EF `FinalprojContext`, email, `ArquivosRaizService`, `DocumentoStorageService`, backups, `LogSistemaService` |

Serviços de negócio relevantes: `EncomendaService` (preparação FIFO), `StockDisponivelService`, `ServicoService`, `DocumentoStorageService` (uploads em `PirofafeData/Uploads` via `IArquivosRaizService`; validação extensão + magic bytes).

---

## Frontend

- Chamadas HTTP em `apps/web/app/lib/*Api.ts` e `auth.ts` / `authApi.ts`.
- Utilizador e permissões: `GET /api/auth/me` → `UserContext`.
- Rotas protegidas: `routePermissions.ts` + `ProtectedRoute`.
- Dados de negócio **só via API** (TanStack Query). Ver [SEGURANCA.md](SEGURANCA.md).

---

## Domínio (resumo)

- **Paiol** + acessos por role, entradas/saídas, documentos.
- **Produto** — NEM, classificação, compatibilidade.
- **Encomenda** — estados (Pendente → Aceite → Em preparação → Concluída / Rejeitada), itens, **reservas**.
- **Servico** — equipa, licenças, distâncias, documentos; `EncomendaId` único.
- **Cliente**, **Funcionario**, **RefreshToken**, **LogSistema**.

Regras centrais: stock disponível = entradas − saídas − reservas; preparação só em encomenda Aceite, saídas FIFO.

---

## Autorização

Roles: **Admin**, **Gestor**, **Comercial**, **Armazém**. Políticas em `PoliticasAutorizacao`; detalhe em [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md).

Auth: JWT + refresh HttpOnly; endpoints em `AuthController`. Listagem completa de recursos: [API.md](API.md).

---

## Pipeline HTTP (backend)

1. HSTS (não-Development) → middleware de erros JSON em `/api/*`.
2. HTTPS (prod) → static files → routing → CORS → session → auth → controllers.
3. `RequestDiagnosticsMiddleware` — `X-Correlation-Id`, latência (ver [OPERACOES.md](OPERACOES.md)).
4. Arranque: `MigrateAsync`, seed de roles, opcional seed de utilizadores (`SeedUsers:Enabled=false` por defeito).

---

## API — módulos

| Prefixo | Função |
|---------|--------|
| `/api/auth` | Login, refresh, me, primeiro utilizador |
| `/api/paiol` | Paióis, stock, movimentos, entradas/saídas |
| `/api/produtos` | Catálogo |
| `/api/encomendas` | Rascunho sessão, submeter, aceitar, preparar, concluir |
| `/api/servicos` | Serviços, licenças, documentos |
| `/api/clientes`, `/api/funcionarios` | CRUD + documentos |
| `/api/admin` | Utilizadores, backups |
| `/api/home` | Stats, perfil, preferências |

Paginação habitual: `pagina`, `itensPorPagina`; resposta com `totalRegistos`.

---

## Convenções

- Decimais invariantes no binding (`DecimalInvariantModelBinder`).
- Documentos em `PirofafeData/Uploads` (portátil, relativo ao `ContentRootPath`); paths na BD permanecem relativos; leitura com fallback opcional em `wwwroot` (legado). Path traversal validado em `ArquivosRaizService` / `DocumentoStorageService`.
- Erros `/api/*` em JSON (401/403/404/500); 500 inclui `correlationId` quando aplicável.
