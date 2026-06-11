# Testes

**Junho 2026** — totais aproximados: **~50** domínio · **~99** integração · **~64** Vitest · **~14** Playwright.

---

## Comandos

```bash
# Tudo backend
dotnet test Finalproj.sln -c Release

# Frontend (em apps/web/)
npm test
npm run test:e2e
npx playwright install chromium   # primeira vez
```

---

## Backend

### `Finalproj.Tests` (domínio)

- EF InMemory, xUnit.
- `EncomendaService` — preparação, FIFO, validações.
- `StockDisponivelService` — entradas, saídas, reservas.
- Helpers: `TestDbContextFactory`, `NoOpLogSistemaService`.

### `Finalproj.IntegrationTests` (HTTP)

- `CustomWebApplicationFactory`, ambiente `Testing`.
- Auth (login, refresh, me, logout).
- Matriz **401/403** (GET + mutação).
- **IDOR** — documentos, paiol, admin, serviços.

Regra: alterar autorização → actualizar `InlineData` ou teste IDOR; documentar em [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md).

---

## Frontend

### Vitest (`apps/web/tests/unit`)

Auth, `authApi`, `routePermissions`, APIs, CSP. Mocks de `fetch` com `Content-Type: application/json` quando usam `safeParseJson`.

### Playwright (`apps/web/tests/e2e`)

Login, rota protegida, CRUD funcionários (mocks), encomenda submeter, documentação. Helpers: `tests/e2e/helpers/auth.ts`, `setup.ts`.

`playwright.config.ts`: em CI, 2 workers e 2 retries; timeout 60s.

---

## CI

| Workflow | Conteúdo |
|----------|----------|
| `.github/workflows/dotnet-tests.yml` | `dotnet test`, cobertura HTML (informativa), bloqueio pacotes HIGH |
| `.github/workflows/client-ci.yml` | typecheck, lint, Vitest, build, Playwright |

Cobertura ≥60% Domain/Application: meta futura; CI ainda não falha por %.
