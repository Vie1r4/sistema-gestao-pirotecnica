# Testes

O projeto usa **quatro camadas** de testes automatizados:

| Camada | Projeto / pasta | O que testa | Para quê |
|--------|-----------------|-------------|----------|
| **Unitários (domínio)** | `Finalproj.Tests` | Regras de negócio, validadores, cálculos legais, stock | Lógica pura, rápida, sem rede nem browser |
| **Integração (HTTP)** | `Finalproj.IntegrationTests` | API completa: auth, 401/403, IDOR, endpoints reais | Garantir que o servidor responde bem e que a segurança está aplicada |
| **Unitários (frontend)** | `apps/web/tests/unit` (Vitest) | Permissões de rotas, mapeadores de API, CSP, helpers | Lógica do frontend sem abrir browser |
| **E2E (browser)** | `apps/web/tests/e2e` (Playwright) | Fluxos como login, rotas protegidas, CRUD, encomendas | Simular o utilizador real na aplicação web |
| **E2E full-stack** | `apps/web/tests/e2e/fullstack` | Login real: browser → Next.js → API → SQL Server | Provar pipeline completo (workflow `fullstack-e2e.yml`) |

Em CI (GitHub Actions), estes testes correm automaticamente em cada push/PR — ver secção [CI](#ci) abaixo.

---

## Comandos

```bash
# Tudo backend (exclui teste Docker de concorrência FIFO)
dotnet test Finalproj.sln -c Release --filter "Category!=Docker"

# Concorrência FIFO — requer Docker a correr
dotnet test Finalproj.IntegrationTests/Finalproj.IntegrationTests.csproj -c Release --filter "Category=Docker"

# Frontend — obrigatório estar em apps/web/ (não há package.json na raiz)
cd apps/web
npm ci                            # ou npm install
npm test
npm run test:e2e
npx playwright install chromium   # primeira vez

# E2E full-stack (API + SQL Server reais) — ver scripts/e2e-fullstack/
# E2E_FULLSTACK=1 bash ../../scripts/e2e-fullstack/start-api.sh  # com ConnectionStrings__FinalprojContext
# bash ../../scripts/e2e-fullstack/seed-admin.sh
# npm run build && E2E_FULLSTACK=1 npm run test:e2e:fullstack
```

---

## Backend

### `Finalproj.Tests` (domínio)

- EF InMemory, xUnit.
- `EncomendaService` — preparação, FIFO, validações, logs após commit.
- `AuthTokenService` — refresh, emissão JWT (mocks).
- `StockDisponivelService` — entradas, saídas, reservas.
- Helpers: `TestDbContextFactory`, `NoOpLogSistemaService`.

### `Finalproj.IntegrationTests` (HTTP)

- `CustomWebApplicationFactory`, ambiente `Testing`.
- Auth (login, refresh, me, logout).
- Matriz **401/403** (GET + mutação).
- **IDOR** — documentos, paiol, admin, serviços.
- **FIFO concorrência** — `FifoPreparacaoConcorrenciaTests` (Docker + SQL Server; trait `Category=Docker`).

Regra: alterar autorização → actualizar `InlineData` ou teste IDOR; documentar em [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md).

---

## Frontend

### Vitest (`apps/web/tests/unit`)

Auth, `authApi`, `routePermissions`, APIs, CSP. Mocks de `fetch` com `Content-Type: application/json` quando usam `safeParseJson`.

### Playwright (`apps/web/tests/e2e`)

Login, rota protegida, CRUD funcionários (mocks), encomenda submeter, documentação. Helpers: `tests/e2e/helpers/auth.ts`, `setup.ts`.

`playwright.config.ts`: em CI, 2 workers e 2 retries; timeout 60s. A pasta `fullstack/` **não corre** aqui — usa `playwright.fullstack.config.ts`.

### E2E full-stack (`apps/web/tests/e2e/fullstack`)

Um spec de login + sessão (`auth.login`, `auth.session`): login sem `page.route`, reload com refresh HttpOnly, `GET /api/auth/me`, listagem de clientes. Só corre com `E2E_FULLSTACK=1`. CI usa **API HTTPS** (`E2E_USE_HTTPS=1`) para cookies cross-origin. Workflow: [`.github/workflows/fullstack-e2e.yml`](../../.github/workflows/fullstack-e2e.yml).

---

## CI

| Workflow | Conteúdo |
|----------|----------|
| `.github/workflows/dotnet-tests.yml` | `dotnet test` (sem Docker), **threshold ≥60%** Domain/Application, teste FIFO (Docker), relatório HTML, bloqueio pacotes HIGH |
| `.github/workflows/client-ci.yml` | `npm audit --audit-level=high`, typecheck, lint, Vitest, build, Playwright (mocks) |
| `.github/workflows/fullstack-e2e.yml` | SQL Server + API + Playwright login real (browser → API → BD) |

Cobertura backend: merge dos relatórios `coverage.cobertura.xml` (unitários + integração). O script `scripts/check-coverage-threshold.py` falha o CI se **Finalproj.Domain** ou **Finalproj.Application** ficarem abaixo de **60%** linhas cobertas.
