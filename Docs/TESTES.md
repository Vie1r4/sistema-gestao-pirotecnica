# Testes

O projeto usa **quatro camadas** de testes automatizados:

| Camada | Projeto / pasta | O que testa | Para quê |
|--------|-----------------|-------------|----------|
| **Unitários (domínio)** | `Finalproj.Tests` | Regras de negócio, validadores, cálculos legais, stock | Lógica pura, rápida, sem rede nem browser |
| **Integração (HTTP)** | `Finalproj.IntegrationTests` | API completa: auth, 401/403, IDOR, endpoints reais | Garantir que o servidor responde bem e que a segurança está aplicada |
| **Unitários (frontend)** | `apps/web/tests/unit` (Vitest) | Permissões de rotas, mapeadores de API, CSP, helpers | Lógica do client sem abrir browser |
| **E2E (browser)** | `apps/web/tests/e2e` (Playwright) | Fluxos como login, rotas protegidas, CRUD, encomendas | Simular o utilizador real na aplicação web |

Em CI (GitHub Actions), estes testes correm automaticamente em cada push/PR — ver secção [CI](#ci) abaixo.

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
